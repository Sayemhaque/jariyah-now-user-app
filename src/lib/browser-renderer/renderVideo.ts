import { Muxer, ArrayBufferTarget } from 'mp4-muxer'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import { mixAudio } from './AudioMixer'
import { createVideoComposer, type VideoComposerOptions } from './VideoComposer'
import { FPS } from '@/lib/constants'

export interface RenderOptions {
  slides: AyatSlide[]
  settings: VideoSettings
  orientation: 'portrait' | 'landscape'
  reciterName: string
  attributionLine: string
  surahName: string
  surahNameArabic: string
  totalAyats: number
  quality: '480p' | '720p' | '1080p'
  onProgress?: (progress: number) => void
}

const QUALITY_SCALE: Record<string, number> = {
  '480p': 0.667,
  '720p': 1,
  '1080p': 1.5,
}

const QUALITY_BITRATES: Record<string, number> = {
  '480p': 1_500_000,
  '720p': 3_000_000,
  '1080p': 6_000_000,
}

function getCodecString(width: number, height: number): string {
  if (width > 1280 || height > 720) return 'avc1.4D4028'
  if (width > 720 || height > 480) return 'avc1.42E01F'
  return 'avc1.42E01E'
}

function interleavePcm(
  channels: Float32Array[],
  totalSamples: number,
  numChannels: number,
): Float32Array {
  const out = new Float32Array(totalSamples * numChannels)
  for (let i = 0; i < totalSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      out[i * numChannels + ch] = channels[ch]![i] ?? 0
    }
  }
  return out
}

export async function renderVideo(options: RenderOptions): Promise<Blob> {
  const { slides, settings, orientation, onProgress } = options
  const fps = FPS
  const qualityScale = QUALITY_SCALE[options.quality] ?? 1
  const bitrate = QUALITY_BITRATES[options.quality] ?? 3_000_000

  const baseRes: Record<string, { w: number; h: number }> = {
    landscape: { w: 1280, h: 720 },
    portrait: { w: 720, h: 1280 },
  }
  const res = baseRes[orientation]!
  const W = Math.round(res.w * qualityScale) & ~1
  const H = Math.round(res.h * qualityScale) & ~1

  const composerOpts: VideoComposerOptions = {
    slides,
    settings,
    orientation,
    reciterName: options.reciterName,
    attributionLine: options.attributionLine,
    surahName: options.surahName,
    surahNameArabic: options.surahNameArabic,
    totalAyats: options.totalAyats,
    fps,
    qualityScale,
    onProgress,
  }

  onProgress?.(0)

  const [composer, audioResult] = await Promise.all([
    createVideoComposer(composerOpts),
    mixAudio(slides, onProgress),
  ])

  const { canvas, ctx, totalFrames, drawFrame } = composer
  const { pcmData, sampleRate, channels, totalSamples } = audioResult

  const codec = getCodecString(W, H)

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width: W, height: H, frameRate: fps },
    audio: { codec: 'aac', numberOfChannels: channels, sampleRate },
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset',
  })

  let encodeFailed = false

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => { if (!encodeFailed) muxer.addVideoChunk(chunk, meta) },
    error: (err) => {
      encodeFailed = true
      lastFrameError = err instanceof Error ? err : new Error(String(err))
    },
  })

  const audioEncoder = new AudioEncoder({
    output: (chunk, meta) => { if (!encodeFailed) muxer.addAudioChunk(chunk, meta) },
    error: (err) => { encodeFailed = true },
  })

  try {
    videoEncoder.configure({
      codec,
      width: W,
      height: H,
      bitrate,
      alpha: 'discard',
    })
  } catch {
    throw new Error(`H.264 encoder not supported (${codec})`)
  }

  audioEncoder.configure({
    codec: 'mp4a.40.2',
    sampleRate,
    numberOfChannels: channels,
    bitrate: 128_000,
  })

  const frameDurationMicros = Math.round(1_000_000 / fps)

  let lastFrameError: Error | null = null

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    if (encodeFailed) {
      throw lastFrameError ?? new Error('Video encoder failed')
    }

    drawFrame(frameIndex)

    try {
      const videoFrame = new VideoFrame(canvas, {
        timestamp: frameIndex * frameDurationMicros,
        duration: frameDurationMicros,
      })
      videoEncoder.encode(videoFrame)
      videoFrame.close()
    } catch (frameErr) {
      lastFrameError = frameErr instanceof Error ? frameErr : new Error(String(frameErr))
      encodeFailed = true
      throw lastFrameError
    }

    if (frameIndex % 60 === 0 || frameIndex === totalFrames - 1) {
      onProgress?.(0.05 + (frameIndex / totalFrames) * 0.60)
      await new Promise((r) => setTimeout(r, 0))
    }
  }

  onProgress?.(0.65)
  await videoEncoder.flush()

  const interleaved = interleavePcm(pcmData, totalSamples, channels)

  const CHUNK_SIZE = sampleRate * 10
  let audioOffset = 0

  while (audioOffset < totalSamples) {
    if (encodeFailed) throw new Error('Audio encoder failed')

    const end = Math.min(audioOffset + CHUNK_SIZE, totalSamples)
    const chunkLength = end - audioOffset
    const chunkData = new Float32Array(chunkLength * channels)
    for (let i = 0; i < chunkLength; i++) {
      for (let ch = 0; ch < channels; ch++) {
        chunkData[i * channels + ch] = interleaved[(audioOffset + i) * channels + ch]!
      }
    }

    const audioData = new AudioData({
      timestamp: Math.round((audioOffset / sampleRate) * 1_000_000),
      data: chunkData,
      numberOfChannels: channels,
      numberOfFrames: chunkLength,
      sampleRate,
      format: 'f32',
    })
    audioEncoder.encode(audioData)
    audioData.close()

    audioOffset = end
  }

  onProgress?.(0.85)
  await audioEncoder.flush()

  onProgress?.(0.95)
  muxer.finalize()

  const { buffer } = muxer.target as ArrayBufferTarget
  const blob = new Blob([buffer], { type: 'video/mp4' })

  onProgress?.(1)
  return blob
}
