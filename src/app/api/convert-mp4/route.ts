import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { logger } from '@/lib/logger'
import { consumeRateLimit, getClientIp } from '@/lib/rateLimit'

/**
 * /api/convert-mp4
 *
 * Receives a WebM blob produced by the browser's MediaRecorder, runs ffmpeg
 * server-side via the Python wrapper at `scripts/webm_to_mp4.py`, and streams
 * the resulting MP4 back to the client.
 *
 * Why server-side Python+ffmpeg instead of ffmpeg.wasm in the browser?
 *   - ffmpeg.wasm needs SharedArrayBuffer, which requires COOP+COEP headers
 *     on every page (those break third-party iframes, Google sign-in, some
 *     analytics, etc.). Not worth it for an optional conversion.
 *   - The server already has ffmpeg 7.x installed; a 720p30 reel converts in
 *     well under a minute.
 *   - The output is a clean H.264 Constrained Baseline + AAC-LC MP4 with
 *     `+faststart`, which plays on every browser and uploads to Instagram /
 *     YouTube / TikTok without re-encoding warnings.
 */

export const runtime = 'nodejs'
export const maxDuration = 300 // seconds — Next.js route timeout ceiling
export const dynamic = 'force-dynamic'

// Allow the Python binary to be overridden (e.g. python3.12 vs python).
const PYTHON_BIN = process.env.PYTHON_BIN || 'python3'
const CONVERTER_SCRIPT = path.join(/*turbopackIgnore: true*/ process.cwd(), 'scripts', 'webm_to_mp4.py')

// Body-size + timeout limits. 100 MB is generous: a 720p30 10-ayat reel at
// 6 Mbps is ~75 MB max. The ffmpeg timeout (4 min) is well under the route
// maxDuration (5 min) so the route can still clean up + return an error if
// ffmpeg hangs.
const MAX_BODY_BYTES = 100 * 1024 * 1024
const FFMPEG_TIMEOUT_MS = 4 * 60 * 1000

// Reuse the render rate-limiter config (3/hr/IP by default). Conversion is
// part of the render flow, so it should consume the same budget.
const RATE_LIMIT_KEY_PREFIX = 'render'

/**
 * GET /api/convert-mp4 — capability ping.
 *
 * The client calls this to decide whether to offer the "convert to MP4"
 * option. Returns 200 + {ok: true} if the route is reachable; the actual
 * ffmpeg availability is checked at POST time (and degrades to a 500 with
 * a clear message if ffmpeg is missing).
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    converter: 'python+ffmpeg',
    maxBodyBytes: MAX_BODY_BYTES,
    timeoutMs: FFMPEG_TIMEOUT_MS,
  })
}

/**
 * Run the Python converter as a subprocess. Resolves with the exit code;
 * rejects on spawn failure or timeout.
 *
 * ffmpeg's `-progress pipe:2` flag writes machine-readable key=value lines
 * to stderr — we capture them so they show up in server logs for debugging
 * (the client only sees a coarse 0→1 progress via XHR upload/download).
 */
function runConverter(
  inputPath: string,
  outputPath: string,
): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(PYTHON_BIN, [CONVERTER_SCRIPT, inputPath, outputPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stderr = ''
    // Cap stderr capture so a runaway log can't OOM the process.
    const STDERR_CAP = 64 * 1024
    proc.stderr.on('data', (chunk: Buffer) => {
      if (stderr.length < STDERR_CAP) {
        stderr += chunk.toString('utf8').slice(0, STDERR_CAP - stderr.length)
      }
    })
    // Drain stdout so the child doesn't block on a full pipe buffer.
    proc.stdout.on('data', () => {})

    const timer = setTimeout(() => {
      proc.kill('SIGKILL')
      reject(new Error(`ffmpeg timed out after ${FFMPEG_TIMEOUT_MS}ms`))
    }, FFMPEG_TIMEOUT_MS)

    proc.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })

    proc.on('close', (code) => {
      clearTimeout(timer)
      resolve({ code: code ?? -1, stderr })
    })
  })
}

/**
 * POST /api/convert-mp4
 *
 * Accepts the WebM blob as either `application/octet-stream` (raw body) or
 * `multipart/form-data` (a single file upload). Writes it to a temp file,
 * runs the Python+ffmpeg converter, reads the resulting MP4, and returns it
 * as `video/mp4`.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const requestId = req.headers.get('x-request-id') ?? `conv_${Date.now().toString(36)}`

  // --- Rate limit (same budget as /api/render) ---------------------------
  const rl = await consumeRateLimit(`${RATE_LIMIT_KEY_PREFIX}:${ip}`)
  if (!rl.ok) {
    logger.warn('convert-mp4 rate limited', { ip, requestId, remaining: rl.remaining })
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) },
      },
    )
  }

  // --- Pull the WebM bytes out of the request ----------------------------
  // Read the raw body as a stream (via req.body) instead of req.arrayBuffer()
  // to bypass Next.js's middleware body size limit (default 10MB). The
  // middleware truncates arrayBuffer reads to 10MB, which silently corrupts
  // larger WebM uploads. Streaming reads bypass that limit.
  let webmBytes: Uint8Array
  try {
    const contentType = req.headers.get('content-type') ?? ''

    if (contentType.startsWith('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file')
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: 'multipart upload must include a "file" field' },
          { status: 400 },
        )
      }
      if (file.size > MAX_BODY_BYTES) {
        return NextResponse.json(
          {
            error: `File too large: ${file.size} bytes (max ${MAX_BODY_BYTES})`,
          },
          { status: 413 },
        )
      }
      webmBytes = new Uint8Array(await file.arrayBuffer())
    } else {
      // Treat anything else (including application/octet-stream) as a raw body.
      // Content-Length is the cheapest pre-flight size check.
      const contentLength = Number(req.headers.get('content-length') ?? '0')
      if (contentLength && contentLength > MAX_BODY_BYTES) {
        return NextResponse.json(
          {
            error: `Body too large: ${contentLength} bytes (max ${MAX_BODY_BYTES})`,
          },
          { status: 413 },
        )
      }

      // Stream the body — req.body is a ReadableStream<Uint8Array> in
      // Node.js runtime. This bypasses the middleware's 10MB truncation.
      const reader = req.body?.getReader()
      if (!reader) {
        return NextResponse.json({ error: 'No request body' }, { status: 400 })
      }
      const chunks: Uint8Array[] = []
      let total = 0
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        if (!value) continue
        total += value.byteLength
        if (total > MAX_BODY_BYTES) {
          return NextResponse.json(
            { error: `Body too large: >${MAX_BODY_BYTES} bytes` },
            { status: 413 },
          )
        }
        chunks.push(value)
      }
      if (total === 0) {
        return NextResponse.json({ error: 'Empty request body' }, { status: 400 })
      }
      // Concatenate all chunks into a single Buffer
      const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)))
      webmBytes = new Uint8Array(buf)
    }
  } catch (err) {
    logger.error('convert-mp4 body read failed', {
      ip,
      requestId,
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 })
  }

  // --- Spawn Python+ffmpeg on a temp file pair ---------------------------
  const id = randomUUID()
  const tmpDir = os.tmpdir()
  const inputPath = path.join(tmpDir, `jariyahnow-${id}.webm`)
  const outputPath = path.join(tmpDir, `jariyahnow-${id}.mp4`)

  try {
    await fs.writeFile(inputPath, webmBytes)

    let result: { code: number; stderr: string }
    try {
      result = await runConverter(inputPath, outputPath)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logger.error('convert-mp4 spawn failed', {
        ip,
        requestId,
        inputBytes: webmBytes.byteLength,
        error: msg,
      })
      return NextResponse.json(
        { error: `Converter failed to start: ${msg}` },
        { status: 500 },
      )
    }

    if (result.code !== 0) {
      // The Python script maps: 1=bad args, 2=ffmpeg missing, 3=conversion failed.
      const status = result.code === 2 ? 503 : 500
      const reason =
        result.code === 2
          ? 'ffmpeg is not installed on the server'
          : result.code === 3
            ? 'ffmpeg conversion failed'
            : `converter exited with code ${result.code}`
      logger.error('convert-mp4 conversion failed', {
        ip,
        requestId,
        inputBytes: webmBytes.byteLength,
        exitCode: result.code,
        stderrTail: result.stderr.slice(-1200),
      })
      return NextResponse.json(
        { error: reason, exitCode: result.code },
        { status },
      )
    }

    // --- Read the MP4 + return it ----------------------------------------
    let mp4Buffer: Buffer
    try {
      mp4Buffer = await fs.readFile(outputPath)
    } catch (err) {
      logger.error('convert-mp4 output read failed', {
        ip,
        requestId,
        error: err instanceof Error ? err.message : String(err),
      })
      return NextResponse.json(
        { error: 'Conversion finished but the output file was unreadable' },
        { status: 500 },
      )
    }

    if (mp4Buffer.byteLength === 0) {
      logger.error('convert-mp4 produced empty output', { ip, requestId })
      return NextResponse.json(
        { error: 'Conversion produced an empty file' },
        { status: 500 },
      )
    }

    logger.info('convert-mp4 success', {
      ip,
      requestId,
      inputBytes: webmBytes.byteLength,
      outputBytes: mp4Buffer.byteLength,
    })

    // Copy the Buffer into a fresh ArrayBuffer-backed Uint8Array. The Node
    // Buffer's backing ArrayBuffer can be a SharedArrayBuffer in some Node
    // builds, which TS 5.7+'s BlobPart type rejects. A fresh Uint8Array over
    // a plain ArrayBuffer satisfies the strict type and avoids the cast.
    const safeBytes = new Uint8Array(mp4Buffer.byteLength)
    safeBytes.set(mp4Buffer)
    const mp4Blob = new Blob([safeBytes], { type: 'video/mp4' })

    return new NextResponse(mp4Blob, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(mp4Buffer.byteLength),
        'Cache-Control': 'no-store',
        'X-Converter': 'python+ffmpeg',
      },
    })
  } finally {
    // Always clean up temp files — never leak into /tmp.
    await Promise.allSettled([fs.unlink(inputPath), fs.unlink(outputPath)])
  }
}
