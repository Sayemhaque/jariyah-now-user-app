import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { unlink, writeFile } from 'fs/promises'
import { logger } from '@/lib/logger'

/**
 * POST /api/silence-detect
 *
 * Downloads an audio file (MP3 URL), runs ffmpeg's silencedetect filter
 * to find natural pause points, and returns them as JSON.
 *
 * Used by the Split Long Ayah feature to snap split points to natural
 * pauses in the reciter's audio.
 *
 * Body: { audioUrl: string }
 * Response: { silences: [{ start, end, duration }] }
 */
export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const FFMPEG_TIMEOUT_MS = 30_000

async function removeTempFile(path: string): Promise<void> {
  await unlink(path).catch(() => {})
}

function parseSilences(stderr: string): { start: number; end: number; duration: number }[] {
  const silences: { start: number; end: number; duration: number }[] = []
  const startRegex = /silence_start:\s*([\d.]+)/g
  const endRegex = /silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/g

  const starts: number[] = []
  const ends: { end: number; duration: number }[] = []

  let match: RegExpExecArray | null = startRegex.exec(stderr)
  while (match) {
    starts.push(parseFloat(match[1] ?? '0'))
    match = startRegex.exec(stderr)
  }

  match = endRegex.exec(stderr)
  while (match) {
    ends.push({
      end: parseFloat(match[1] ?? '0'),
      duration: parseFloat(match[2] ?? '0'),
    })
    match = endRegex.exec(stderr)
  }

  for (let i = 0; i < Math.min(starts.length, ends.length); i++) {
    const start = starts[i]
    const endEntry = ends[i]
    if (start === undefined || endEntry === undefined) continue
    silences.push({
      start,
      end: endEntry.end,
      duration: endEntry.duration,
    })
  }

  return silences
}

function runSilenceDetect(
  tmpFile: string,
  requestId: string,
): Promise<Response> {
  return new Promise((resolve) => {
    let settled = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const settle = (response: Response) => {
      if (settled) return
      settled = true
      if (timeoutId !== undefined) clearTimeout(timeoutId)
      resolve(response)
    }

    const proc = spawn('ffmpeg', [
      '-i', tmpFile,
      '-af', 'silencedetect=noise=-30dB:d=0.3',
      '-f', 'null',
      '-',
    ], { stdio: ['ignore', 'pipe', 'pipe'] })

    let stderr = ''
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8')
    })

    proc.on('close', (code) => {
      if (code !== 0 && !stderr.includes('silencedetect')) {
        logger.error('silence-detect ffmpeg failed', { requestId, code })
        settle(NextResponse.json({ error: 'ffmpeg failed' }, { status: 500 }))
        return
      }

      const silences = parseSilences(stderr)
      logger.info('silence-detect complete', {
        requestId,
        silenceCount: silences.length,
      })
      settle(NextResponse.json({ silences }))
    })

    proc.on('error', () => {
      settle(NextResponse.json({ error: 'Failed to run ffmpeg' }, { status: 500 }))
    })

    timeoutId = setTimeout(() => {
      proc.kill('SIGKILL')
      settle(NextResponse.json({ error: 'ffmpeg timed out' }, { status: 504 }))
    }, FFMPEG_TIMEOUT_MS)
  })
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? `req_${Date.now().toString(36)}`

  let audioUrl: string
  try {
    const body = await req.json()
    audioUrl = body.audioUrl
    if (!audioUrl || typeof audioUrl !== 'string') {
      return NextResponse.json({ error: 'Missing audioUrl' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const tmpFile = `/tmp/silence_${Date.now()}.mp3`

  try {
    const dlRes = await fetch(audioUrl)
    if (!dlRes.ok) {
      return NextResponse.json(
        { error: `Failed to download audio: ${dlRes.status}` },
        { status: 502 },
      )
    }
    const buf = Buffer.from(await dlRes.arrayBuffer())
    await writeFile(tmpFile, buf)
  } catch (err) {
    logger.error('silence-detect download failed', {
      requestId,
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'Failed to download audio' }, { status: 502 })
  }

  try {
    return await runSilenceDetect(tmpFile, requestId)
  } finally {
    await removeTempFile(tmpFile)
  }
}
