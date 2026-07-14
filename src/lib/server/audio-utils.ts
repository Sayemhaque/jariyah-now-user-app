import { spawn } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

export async function downloadAudioToTemp(
  audioUrl: string,
  prefix: string,
): Promise<{ path: string } | { error: NextResponse }> {
  try {
    const dlRes = await fetch(audioUrl)
    if (!dlRes.ok) {
      return { error: NextResponse.json(
        { error: `Failed to download audio: ${dlRes.status}` },
        { status: 502 },
      )}
    }
    const buf = Buffer.from(await dlRes.arrayBuffer())
    const tmpFile = `/tmp/${prefix}_${Date.now()}.mp3`
    await writeFile(tmpFile, buf)
    return { path: tmpFile }
  } catch (err) {
    logger.error('audio download failed', {
      url: audioUrl,
      error: err instanceof Error ? err.message : String(err),
    })
    return { error: NextResponse.json(
      { error: 'Failed to download audio' },
      { status: 502 },
    )}
  }
}

export interface FfmpegRawResult {
  code: number
  stdout: Buffer
  stderr: string
}

export function runFfmpegBuffered(
  args: string[],
  timeoutMs = 30_000,
): Promise<FfmpegRawResult> {
  return new Promise((resolve) => {
    const proc = spawn(env.FFMPEG_BIN, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    const stdoutChunks: Buffer[] = []
    const stderrChunks: Buffer[] = []
    let settled = false

    const settle = (code: number) => {
      if (settled) return
      settled = true
      clearTimeout(timeoutId)
      resolve({
        code,
        stdout: Buffer.concat(stdoutChunks),
        stderr: Buffer.concat(stderrChunks).toString('utf8'),
      })
    }

    proc.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk))
    proc.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk))

    proc.on('close', (code) => settle(code ?? -1))
    proc.on('error', () => settle(-1))

    const timeoutId = setTimeout(() => {
      proc.kill('SIGKILL')
      settle(-1)
    }, timeoutMs)
  })
}
