import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { logger } from '@/lib/logger'

/**
 * POST /api/audio-breakpoints
 *
 * Downloads an audio file, extracts raw PCM data via ffmpeg, and
 * analyzes the ENERGY CURVE to find natural phrase boundaries.
 *
 * Unlike /api/silence-detect (which looks for ABSOLUTE silence),
 * this endpoint finds RELATIVE energy dips — the slight quiet
 * moments between phrases that every reciter has, even in
 * continuous Murattal recitation where there's no complete silence.
 *
 * Algorithm:
 *   1. ffmpeg extracts mono PCM at 8kHz, 32-bit float
 *   2. Compute RMS energy over 200ms windows, 50ms hop
 *   3. Smooth the energy curve (5-window moving average)
 *   4. Find local minima where energy drops below 60% of the
 *      local average (within a ±1s neighborhood)
 *   5. Filter out dips closer than 1s apart
 *
 * Body: { audioUrl: string, numBreakpoints?: number }
 * Response: { breakpoints: number[], duration: number }
 *   - breakpoints: timestamps in SECONDS
 *   - duration: total audio duration in seconds
 */
export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? `req_${Date.now().toString(36)}`

  // ─── Parse input ──────────────────────────────────────────────────
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

  // ─── Download audio ───────────────────────────────────────────────
  const tmpFile = `/tmp/bp_${Date.now()}.mp3`
  try {
    const dlRes = await fetch(audioUrl)
    if (!dlRes.ok) {
      return NextResponse.json(
        { error: `Failed to download audio: ${dlRes.status}` },
        { status: 502 },
      )
    }
    const buf = Buffer.from(await dlRes.arrayBuffer())
    const { writeFile, unlink } = await import('fs/promises')
    await writeFile(tmpFile, buf)
  } catch (err) {
    logger.error('audio-breakpoints download failed', {
      requestId,
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'Failed to download audio' }, { status: 502 })
  }

  // ─── Extract raw PCM via ffmpeg ───────────────────────────────────
  // -ar 8000:  8kHz sample rate (enough resolution for speech)
  // -ac 1:     mono (mix down stereo)
  // -f f32le:  32-bit float little-endian PCM
  const pcmBuffer = await new Promise<Buffer | null>((resolve) => {
    const chunks: Buffer[] = []
    const proc = spawn('ffmpeg', [
      '-i', tmpFile,
      '-ar', '8000',
      '-ac', '1',
      '-f', 'f32le',
      'pipe:1',
    ], { stdio: ['ignore', 'pipe', 'pipe'] })

    proc.stdout.on('data', (chunk: Buffer) => chunks.push(chunk))
    proc.stderr.on('data', () => { /* swallow ffmpeg progress */ })

    proc.on('close', (code) => {
      if (code !== 0 && chunks.length === 0) {
        resolve(null)
      } else {
        resolve(Buffer.concat(chunks))
      }
    })

    proc.on('error', () => resolve(null))

    setTimeout(() => {
      proc.kill('SIGKILL')
      resolve(null)
    }, 30000)
  })

  // Clean up temp file
  import('fs/promises').then(({ unlink }) => unlink(tmpFile).catch(() => {}))

  if (!pcmBuffer || pcmBuffer.length < 4) {
    logger.error('audio-breakpoints ffmpeg extraction failed', { requestId })
    return NextResponse.json({ error: 'Failed to extract PCM' }, { status: 500 })
  }

  // ─── Parse PCM samples ────────────────────────────────────────────
  const samples = new Float32Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.byteLength / 4)
  const sampleRate = 8000
  const durationSec = samples.length / sampleRate

  // ─── Compute RMS energy over sliding windows ──────────────────────
  const WINDOW_MS = 200       // 200ms analysis window
  const HOP_MS = 50           // 50ms hop → 20 energy values per second
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

  // ─── Smooth the energy curve (5-window moving average) ────────────
  const smoothRadius = 2 // ±2 frames = ±100ms
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

  // ─── Find local minima (energy dips) ──────────────────────────────
  // A frame is a dip candidate if:
  //   1. It's a local minimum (lower than both neighbors)
  //   2. Its energy < 60% of the average energy in a ±1s neighborhood
  //   3. It's at least 1s from the start/end (don't switch at very beginning/end)
  const NEIGHBORHOOD_FRAMES = Math.floor(1000 / HOP_MS) // ±1s = 20 frames
  const DIP_RATIO = 0.65 // dip must be < 65% of local average
  const MIN_FROM_EDGE_SEC = 1.0
  const MIN_DIP_GAP_SEC = 1.5

  const dips: { time: number; energy: number }[] = []
  for (let i = 1; i < smoothed.length - 1; i++) {
    const timeSec = (i * hopSize) / sampleRate
    if (timeSec < MIN_FROM_EDGE_SEC || timeSec > durationSec - MIN_FROM_EDGE_SEC) continue

    // Must be a local minimum
    if (smoothed[i]! >= smoothed[i - 1]! || smoothed[i]! >= smoothed[i + 1]!) continue

    // Compute local average
    let sum = 0
    let count = 0
    for (let j = i - NEIGHBORHOOD_FRAMES; j <= i + NEIGHBORHOOD_FRAMES; j++) {
      if (j >= 0 && j < smoothed.length) {
        sum += smoothed[j]!
        count++
      }
    }
    const localAvg = sum / count

    // Must be significantly below local average
    if (localAvg > 0 && smoothed[i]! < DIP_RATIO * localAvg) {
      dips.push({ time: timeSec, energy: smoothed[i]! })
    }
  }

  // ─── Filter dips: remove ones too close together ──────────────────
  // Keep the deepest dip in each cluster.
  const minGapSec = MIN_DIP_GAP_SEC
  const filtered: { time: number; energy: number }[] = []
  for (const dip of dips) {
    const last = filtered[filtered.length - 1]
    if (!last || dip.time - last.time >= minGapSec) {
      filtered.push(dip)
    } else if (dip.energy < last.energy) {
      // This dip is deeper → replace the previous one
      filtered[filtered.length - 1] = dip
    }
  }

  // ─── Select the best N breakpoints if requested ───────────────────
  // Sort by deepest energy dip first, take top N, then re-sort by time.
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

  return NextResponse.json({
    breakpoints,
    duration: durationSec,
  })
}
