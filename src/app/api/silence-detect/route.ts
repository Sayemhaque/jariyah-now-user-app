import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
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

  // Download the audio file to a temp location
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
    const { writeFile, unlink } = await import('fs/promises')
    await writeFile(tmpFile, buf)
  } catch (err) {
    logger.error('silence-detect download failed', {
      requestId,
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'Failed to download audio' }, { status: 502 })
  }

  // Run ffmpeg's silencedetect filter
  return new Promise<Response>((resolve) => {
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
      // Clean up temp file
      import('fs/promises').then(({ unlink }) => unlink(tmpFile).catch(() => {}))

      if (code !== 0 && !stderr.includes('silencedetect')) {
        logger.error('silence-detect ffmpeg failed', { requestId, code })
        resolve(NextResponse.json({ error: 'ffmpeg failed' }, { status: 500 }))
        return
      }

      // Parse silencedetect output from stderr
      // Format: [silencedetect @ 0x...] silence_start: 3.234
      //         [silencedetect @ 0x...] silence_end: 3.5 | silence_duration: 0.266
      const silences: { start: number; end: number; duration: number }[] = []
      const startRegex = /silence_start:\s*([\d.]+)/g
      const endRegex = /silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/g

      const starts: number[] = []
      const ends: { end: number; duration: number }[] = []

      let match: RegExpExecArray | null
      while ((match = startRegex.exec(stderr)) !== null) {
        starts.push(parseFloat(match[1]!))
      }
      while ((match = endRegex.exec(stderr)) !== null) {
        ends.push({ end: parseFloat(match[1]!), duration: parseFloat(match[2]!) })
      }

      // Pair starts with ends
      for (let i = 0; i < Math.min(starts.length, ends.length); i++) {
        silences.push({
          start: starts[i]!,
          end: ends[i]!.end,
          duration: ends[i]!.duration,
        })
      }

      logger.info('silence-detect complete', {
        requestId,
        silenceCount: silences.length,
      })

      resolve(NextResponse.json({ silences }))
    })

    proc.on('error', () => {
      import('fs/promises').then(({ unlink }) => unlink(tmpFile).catch(() => {}))
      resolve(NextResponse.json({ error: 'Failed to run ffmpeg' }, { status: 500 }))
    })

    // Timeout after 30 seconds
    setTimeout(() => {
      proc.kill('SIGKILL')
      import('fs/promises').then(({ unlink }) => unlink(tmpFile).catch(() => {}))
      resolve(NextResponse.json({ error: 'ffmpeg timed out' }, { status: 504 }))
    }, 30000)
  })
}
