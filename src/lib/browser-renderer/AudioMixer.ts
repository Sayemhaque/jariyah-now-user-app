import { getAdvanceAtMs } from '@/lib/advanceTiming'
import type { AyatSlide } from '@/lib/types'

export interface AudioMixResult {
  pcmData: Float32Array[]
  sampleRate: number
  channels: number
  totalSamples: number
}

async function fetchAndDecode(url: string, audioCtx: AudioContext): Promise<AudioBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch audio: ${url}`)
  const buf = await res.arrayBuffer()
  return audioCtx.decodeAudioData(buf)
}

export async function mixAudio(
  slides: AyatSlide[],
  onProgress?: (p: number) => void,
): Promise<AudioMixResult> {
  const audioCtx = new AudioContext()

  try {
    onProgress?.(0.03)
    const buffers = await Promise.all(slides.map((s) => fetchAndDecode(s.audioUrl, audioCtx)))
    onProgress?.(0.04)

    const sampleRate = buffers[0]!.sampleRate
    const channels = buffers[0]!.numberOfChannels

    const slideOffsetsSamples: number[] = []
    let totalSamples = 0
    let accAdvanceMs = 0

    for (let i = 0; i < slides.length; i++) {
      slideOffsetsSamples.push(Math.round((accAdvanceMs / 1000) * sampleRate))

      const advanceMs = getAdvanceAtMs(slides[i]!, slides[i]!.audioDurationMs)
      const buf = buffers[i]!
      const bufSamples = buf.length

      const advanceSamples = Math.round((advanceMs / 1000) * sampleRate)
      const sliceEndSamples = Math.min(advanceSamples + bufSamples, bufSamples + advanceSamples)
      const endSample = slideOffsetsSamples[i]! + bufSamples

      if (endSample > totalSamples) totalSamples = endSample
      accAdvanceMs += advanceMs
    }

    const mix: Float32Array[] = []
    for (let ch = 0; ch < channels; ch++) {
      mix.push(new Float32Array(totalSamples))
    }

    for (let i = 0; i < slides.length; i++) {
      const buf = buffers[i]!
      const offset = slideOffsetsSamples[i]!

      for (let ch = 0; ch < channels; ch++) {
        const src = buf.getChannelData(ch)
        const dest = mix[ch]!
        for (let s = 0; s < src.length; s++) {
          const idx = offset + s
          if (idx < dest.length) {
            dest[idx] = Math.max(-1, Math.min(1, dest[idx]! + src[s]!))
          }
        }
      }
    }

    return { pcmData: mix, sampleRate, channels, totalSamples }
  } finally {
    audioCtx.close()
  }
}
