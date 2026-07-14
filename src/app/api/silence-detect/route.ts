import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { logger } from '@/lib/logger'
import { downloadAudioToTemp, runFfmpegBuffered } from '@/lib/server/audio-utils'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const FFMPEG_TIMEOUT_MS = 30_000

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

  const dl = await downloadAudioToTemp(audioUrl, 'silence')
  if ('error' in dl) return dl.error

  try {
    const result = await runFfmpegBuffered([
      '-i', dl.path,
      '-af', 'silencedetect=noise=-30dB:d=0.3',
      '-f', 'null',
      '-',
    ], FFMPEG_TIMEOUT_MS)

    if (result.code !== 0 && !result.stderr.includes('silencedetect')) {
      logger.error('silence-detect ffmpeg failed', { requestId, code: result.code })
      return NextResponse.json({ error: 'ffmpeg failed' }, { status: 500 })
    }

    const silences = parseSilences(result.stderr)
    logger.info('silence-detect complete', {
      requestId,
      silenceCount: silences.length,
    })

    return NextResponse.json({ silences })
  } finally {
    await unlink(dl.path).catch(() => {})
  }
}
