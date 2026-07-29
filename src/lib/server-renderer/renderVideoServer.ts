import { spawn } from 'node:child_process'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import { mixAudio } from './AudioMixerServer'
import { createVideoComposer, type VideoComposerOptions } from './VideoComposerServer'
import { ensureFonts } from './fonts'
import { FPS } from '@/lib/constants'

export interface RenderServerOptions {
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

export async function renderVideoServer(options: RenderServerOptions): Promise<Buffer> {
  const { slides, settings, orientation, onProgress } = options
  const fps = FPS
  const qualityScale = QUALITY_SCALE[options.quality] ?? 1
  const bitrate = QUALITY_BITRATES[options.quality] ?? 3_000_000

  const baseRes = { landscape: { w: 1280, h: 720 }, portrait: { w: 720, h: 1280 } }[orientation]!
  const W = Math.round(baseRes.w * qualityScale) & ~1
  const H = Math.round(baseRes.h * qualityScale) & ~1

  onProgress?.(0)

  await ensureFonts()

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

  const [composer, audioResult] = await Promise.all([
    createVideoComposer(composerOpts),
    mixAudio(slides, onProgress),
  ])

  const { totalFrames, drawFrame } = composer
  const { pcmData, sampleRate, channels, totalSamples } = audioResult

  onProgress?.(0.05)

  const interleaved = new Float32Array(totalSamples * channels)
  for (let i = 0; i < totalSamples; i++) {
    for (let ch = 0; ch < channels; ch++) {
      interleaved[i * channels + ch] = pcmData[ch]![i] ?? 0
    }
  }

  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'rawvideo',
    '-pix_fmt', 'rgba',
    '-s', `${W}x${H}`,
    '-r', String(fps),
    '-i', 'pipe:3',
    '-f', 'f32le',
    '-ar', String(sampleRate),
    '-ac', String(channels),
    '-i', 'pipe:4',
    '-c:v', 'libx264',
    '-b:v', String(bitrate),
    '-preset', 'medium',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', 'frag_keyframe+empty_moov',
    '-f', 'mp4',
    'pipe:1',
  ], {
    stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
  })

  const videoInput = ffmpeg.stdio[3]! as NodeJS.WritableStream
  const audioInput = ffmpeg.stdio[4]! as NodeJS.WritableStream
  const mp4Output = ffmpeg.stdout! as NodeJS.ReadableStream
  const errOutput = ffmpeg.stderr! as NodeJS.ReadableStream

  const mp4Chunks: Buffer[] = []
  let stderr = ''

  mp4Output.on('data', (chunk: Buffer) => mp4Chunks.push(chunk))
  errOutput.on('data', (chunk: Buffer) => { stderr += chunk.toString() })

  const ffmpegError = new Promise<void>((_, reject) => {
    ffmpeg.on('error', reject)
  })

  const framePromise = new Promise<void>((resolve, reject) => {
    try {
      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        drawFrame(frameIndex)

        const imageData = composer.ctx.getImageData(0, 0, W, H)
        const buf = Buffer.from(imageData.data.buffer, imageData.data.byteOffset, imageData.data.byteLength)
        videoInput.write(buf)

        if (frameIndex % 60 === 0 || frameIndex === totalFrames - 1) {
          onProgress?.(0.05 + (frameIndex / totalFrames) * 0.60)
        }
      }
      videoInput.end()
      resolve()
    } catch (err) {
      videoInput.end()
      reject(err)
    }
  })

  const audioPromise = new Promise<void>((resolve, reject) => {
    try {
      const audioBuf = Buffer.from(interleaved.buffer, interleaved.byteOffset, interleaved.byteLength)
      audioInput.end(audioBuf)
      resolve()
    } catch (err) {
      reject(err)
    }
  })

  onProgress?.(0.65)

  await Promise.all([framePromise, audioPromise])

  const exitCode = await new Promise<number | null>((resolve) => {
    ffmpeg.on('close', resolve)
  })

  if (exitCode !== 0) {
    throw new Error(`FFmpeg exited with code ${exitCode}: ${stderr.slice(-500)}`)
  }

  onProgress?.(0.85)

  const result = Buffer.concat(mp4Chunks)

  onProgress?.(1)

  return result
}
