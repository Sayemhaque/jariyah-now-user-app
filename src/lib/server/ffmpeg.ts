import { spawn } from 'node:child_process'

import { env } from '@/lib/env'

const FFMPEG_STDERR_CAP = 256 * 1024

export interface RunFfmpegOptions {
  cwd?: string
  durationSec?: number
  onProgress?: (ratio: number) => void
}

export interface RunFfmpegResult {
  code: number
  stderr: string
}

export function parseFfmpegTimestampToSeconds(timestamp: string): number | null {
  const match = timestamp.trim().match(/^(\d+):(\d+):(\d+(?:\.\d+)?)$/)
  if (!match) return null
  const [, hours, minutes, seconds] = match
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
}

export function mapFfmpegProgressLineToRatio(
  line: string,
  durationSec: number,
): number | null {
  if (!durationSec || durationSec <= 0) return null

  if (line.startsWith('out_time=')) {
    const seconds = parseFfmpegTimestampToSeconds(line.slice('out_time='.length))
    if (seconds == null) return null
    return Math.max(0, Math.min(1, seconds / durationSec))
  }

  if (line.startsWith('out_time_ms=')) {
    const micros = Number(line.slice('out_time_ms='.length))
    if (!Number.isFinite(micros) || micros < 0) return null
    return Math.max(0, Math.min(1, micros / 1_000_000 / durationSec))
  }

  if (line.startsWith('out_time_us=')) {
    const micros = Number(line.slice('out_time_us='.length))
    if (!Number.isFinite(micros) || micros < 0) return null
    return Math.max(0, Math.min(1, micros / 1_000_000 / durationSec))
  }

  return null
}

export async function runFfmpeg(
  args: string[],
  options: RunFfmpegOptions = {},
): Promise<RunFfmpegResult> {
  return new Promise((resolve, reject) => {
    const proc = spawn(env.FFMPEG_BIN, args, {
      cwd: options.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stderr = ''
    let stderrBuffer = ''

    proc.stdout.on('data', () => {})
    proc.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf8')
      if (stderr.length < FFMPEG_STDERR_CAP) {
        stderr += text.slice(0, FFMPEG_STDERR_CAP - stderr.length)
      }
      if (!options.onProgress || !options.durationSec) return
      stderrBuffer += text
      const lines = stderrBuffer.split(/\r?\n/)
      stderrBuffer = lines.pop() ?? ''
      for (const line of lines) {
        const ratio = mapFfmpegProgressLineToRatio(line, options.durationSec)
        if (ratio != null) {
          options.onProgress(ratio)
        }
      }
    })

    proc.on('error', reject)
    proc.on('close', (code) => {
      if (options.onProgress && options.durationSec) {
        const ratio = mapFfmpegProgressLineToRatio(stderrBuffer, options.durationSec)
        if (ratio != null) options.onProgress(ratio)
      }
      resolve({ code: code ?? -1, stderr })
    })
  })
}
