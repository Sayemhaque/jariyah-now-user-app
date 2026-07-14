import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { logger } from '@/lib/logger'
import { downloadAudioToTemp, runFfmpegBuffered } from '@/lib/server/audio-utils'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const FFMPEG_TIMEOUT_MS = 30_000

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? `req_${Date.now().toString(36)}`

  let audioUrl: string
  let requestedCount: number | undefined
  try {
    const body = await req.json()
    audioUrl = body.audioUrl
    requestedCount = body.numBreakpoints
    if (!audioUrl || typeof audioUrl !== 'string') {
      return NextResponse.json({ error: 'Missing audioUrl' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const dl = await downloadAudioToTemp(audioUrl, 'bp')
  if ('error' in dl) return dl.error

  let pcmBuffer: Buffer | null = null
  try {
    const result = await runFfmpegBuffered([
      '-i', dl.path,
      '-ar', '8000',
      '-ac', '1',
      '-f', 'f32le',
      'pipe:1',
    ], FFMPEG_TIMEOUT_MS)

    if (result.code !== 0 || result.stdout.length < 4) {
      logger.error('audio-breakpoints ffmpeg extraction failed', { requestId, code: result.code })
      return NextResponse.json({ error: 'Failed to extract PCM' }, { status: 500 })
    }

    pcmBuffer = result.stdout
  } finally {
    await unlink(dl.path).catch(() => {})
  }

  if (!pcmBuffer || pcmBuffer.length < 4) {
    return NextResponse.json({ error: 'Failed to extract PCM' }, { status: 500 })
  }

  // ─── Parse PCM samples ────────────────────────────────────────────
  const samples = new Float32Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.byteLength / 4)
  const sampleRate = 8000
  const durationSec = samples.length / sampleRate

  // ─── Compute RMS energy over sliding windows ──────────────────────
  const WINDOW_MS = 200
  const HOP_MS = 50
  const windowSize = Math.floor((WINDOW_MS / 1000) * sampleRate)
  const hopSize = Math.floor((HOP_MS / 1000) * sampleRate)
  const numFrames = Math.max(0, Math.floor((samples.length - windowSize) / hopSize))

  if (numFrames === 0) {
    return NextResponse.json({
      breakpoints: [],
      duration: durationSec,
    })
  }

  const energy: number[] = []
  for (let i = 0; i < numFrames; i++) {
    let sum = 0
    const offset = i * hopSize
    for (let j = 0; j < windowSize; j++) {
      const s = samples[offset + j] ?? 0
      sum += s * s
    }
    energy.push(Math.sqrt(sum / windowSize))
  }

  // ─── Smooth the energy curve ──────────────────────────────────────
  const smoothRadius = 2
  const smoothed: number[] = []
  for (let i = 0; i < energy.length; i++) {
    let sum = 0
    let count = 0
    for (let j = i - smoothRadius; j <= i + smoothRadius; j++) {
      if (j >= 0 && j < energy.length) {
        sum += energy[j]!
        count++
      }
    }
    smoothed.push(sum / count)
  }

  // ─── Find local minima ────────────────────────────────────────────
  const NEIGHBORHOOD_FRAMES = Math.floor(1000 / HOP_MS)
  const DIP_RATIO = 0.65
  const MIN_FROM_EDGE_SEC = 1.0
  const MIN_DIP_GAP_SEC = 1.5

  const dips: { time: number; energy: number }[] = []
  for (let i = 1; i < smoothed.length - 1; i++) {
    const timeSec = (i * hopSize) / sampleRate
    if (timeSec < MIN_FROM_EDGE_SEC || timeSec > durationSec - MIN_FROM_EDGE_SEC) continue
    if (smoothed[i]! >= smoothed[i - 1]! || smoothed[i]! >= smoothed[i + 1]!) continue

    let sum = 0
    let count = 0
    for (let j = i - NEIGHBORHOOD_FRAMES; j <= i + NEIGHBORHOOD_FRAMES; j++) {
      if (j >= 0 && j < smoothed.length) {
        sum += smoothed[j]!
        count++
      }
    }
    const localAvg = sum / count
    if (localAvg > 0 && smoothed[i]! < DIP_RATIO * localAvg) {
      dips.push({ time: timeSec, energy: smoothed[i]! })
    }
  }

  // ─── Filter dips ──────────────────────────────────────────────────
  const filtered: { time: number; energy: number }[] = []
  for (const dip of dips) {
    const last = filtered[filtered.length - 1]
    if (!last || dip.time - last.time >= MIN_DIP_GAP_SEC) {
      filtered.push(dip)
    } else if (dip.energy < last.energy) {
      filtered[filtered.length - 1] = dip
    }
  }

  // ─── Select best N ────────────────────────────────────────────────
  let selected = filtered
  if (requestedCount && requestedCount > 0 && filtered.length > requestedCount) {
    const sorted = [...filtered].sort((a, b) => a.energy - b.energy)
    selected = sorted
      .slice(0, requestedCount)
      .sort((a, b) => a.time - b.time)
  }

  const breakpoints = selected.map((d) => d.time)

  logger.info('audio-breakpoints complete', {
    requestId,
    duration: durationSec,
    numEnergyFrames: numFrames,
    numDips: dips.length,
    numBreakpoints: breakpoints.length,
  })

  return NextResponse.json({ breakpoints, duration: durationSec })
}
