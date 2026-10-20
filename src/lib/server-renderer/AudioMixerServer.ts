import { spawn } from 'node:child_process'
import { getAdvanceAtMs } from '@/lib/advanceTiming'
import type { AyatSlide } from '@/lib/types'

export interface AudioMixResult {
  pcmData: Float32Array[]
  sampleRate: number
  channels: number
  totalSamples: number
}

interface DecodedAudio {
  pcm: Float32Array
  sampleRate: number
  channels: number
}

async function fetchAndDecode(url: string): Promise<DecodedAudio> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch audio: ${url}`)
  const mp3Buf = Buffer.from(await res.arrayBuffer())

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    const proc = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-f', 'f32le',
      '-acodec', 'pcm_f32le',
      '-vn',
      'pipe:1',
    ], { stdio: ['pipe', 'pipe', 'pipe'] })

    proc.stdout!.on('data', (chunk: Buffer) => chunks.push(chunk))

    let stderr = ''
    proc.stderr!.on('data', (chunk: Buffer) => { stderr += chunk.toString() })

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg decode failed for ${url}: ${stderr.slice(-500)}`))
        return
      }
      const raw = Buffer.concat(chunks)
      const pcm = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4)

      const srMatch = stderr.match(/(\d+) Hz/)
      const chMatch = stderr.match(/(\d+) channels?/)
      const sampleRate = srMatch ? parseInt(srMatch[1]!, 10) : 44100
      const channels = chMatch ? parseInt(chMatch[1]!, 10) : 1

      resolve({ pcm, sampleRate, channels })
    })

    proc.on('error', reject)
    proc.stdin!.end(mp3Buf)
  })
}

export async function mixAudio(
  slides: AyatSlide[],
  onProgress?: (p: number) => void,
): Promise<AudioMixResult> {
  onProgress?.(0.03)

  const decoded = await Promise.all(
    slides.map((s) => fetchAndDecode(s.audioUrl))
  )
  onProgress?.(0.04)

  const sampleRate = decoded[0]!.sampleRate
  const channels = decoded[0]!.channels

  const slideOffsetsSamples: number[] = []
  let totalSamples = 0
  let accAdvanceMs = 0

  for (let i = 0; i < slides.length; i++) {
    slideOffsetsSamples.push(Math.round((accAdvanceMs / 1000) * sampleRate))

    const advanceMs = getAdvanceAtMs(slides[i]!, slides[i]!.audioDurationMs)
    const buf = decoded[i]!
    const bufSamples = buf.pcm.length / channels

    const endSample = slideOffsetsSamples[i]! + bufSamples
    if (endSample > totalSamples) totalSamples = endSample
    accAdvanceMs += advanceMs
  }

  const mix: Float32Array[] = []
  for (let ch = 0; ch < channels; ch++) {
    mix.push(new Float32Array(totalSamples))
  }

  for (let i = 0; i < slides.length; i++) {
    const buf = decoded[i]!
    const offset = slideOffsetsSamples[i]!
    const bufSamples = buf.pcm.length / channels

    for (let ch = 0; ch < channels; ch++) {
      const dest = mix[ch]!
      for (let s = 0; s < bufSamples; s++) {
        const idx = offset + s
        if (idx < dest.length) {
          const srcVal = buf.pcm[s * channels + ch] ?? 0
          dest[idx] = Math.max(-1, Math.min(1, dest[idx]! + srcVal))
        }
      }
    }
    onProgress?.(0.04 + ((i + 1) / slides.length) * 0.01)
  }

  return { pcmData: mix, sampleRate, channels, totalSamples }
}
