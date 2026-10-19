import { execFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { speechFromSamples, type SpeechMap } from '@/lib/speech/speechActivity'

const execFileAsync = promisify(execFile)
const analysisRate = 8000

export interface AudioAnalysis {
  durationMs: number
  speech: SpeechMap | null
}

export interface AudioTools {
  ffprobeBin?: string
  ffmpegBin?: string
}

async function probeDuration(file: string, ffprobeBin: string): Promise<number> {
  const { stdout } = await execFileAsync(ffprobeBin, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file])
  const sec = parseFloat(stdout.trim())
  if (!Number.isFinite(sec) || sec <= 0) throw new Error(`ffprobe returned no duration for ${file}`)
  return Math.round(sec * 1000)
}

async function detectSpeechInFile(file: string, ffmpegBin: string): Promise<SpeechMap | null> {
  try {
    const { stdout } = await execFileAsync(
      ffmpegBin,
      ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(analysisRate), '-f', 'f32le', 'pipe:1'],
      { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 },
    )
    const samples = new Float32Array(stdout.buffer.slice(stdout.byteOffset, stdout.byteOffset + stdout.byteLength - (stdout.byteLength % 4)))
    return speechFromSamples(samples, analysisRate)
  } catch {
    return null
  }
}

export async function analyzeAudio(url: string, tools: AudioTools = {}): Promise<AudioAnalysis> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Audio download failed (${res.status}): ${url}`)
  const dir = await mkdtemp(join(tmpdir(), 'daily-audio-'))
  const file = join(dir, 'a.mp3')
  try {
    await writeFile(file, Buffer.from(await res.arrayBuffer()))
    const [durationMs, speech] = await Promise.all([probeDuration(file, tools.ffprobeBin ?? 'ffprobe'), detectSpeechInFile(file, tools.ffmpegBin ?? 'ffmpeg')])
    return { durationMs, speech }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
