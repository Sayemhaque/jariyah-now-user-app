export interface Pause {
  startMs: number
  endMs: number
}

export interface SpeechMap {
  startMs: number
  endMs: number
  pauses: Pause[]
}

export interface SpeechOptions {
  frameMs?: number
  minPauseMs?: number
  minSpeechMs?: number
}

const thresholdShare = 0.1

export function rmsEnvelope(samples: ArrayLike<number>, sampleRate: number, frameMs = 10): number[] {
  const frameSize = Math.max(1, Math.round((sampleRate * frameMs) / 1000))
  const envelope: number[] = []
  for (let offset = 0; offset < samples.length; offset += frameSize) {
    const end = Math.min(samples.length, offset + frameSize)
    let sum = 0
    for (let i = offset; i < end; i++) sum += samples[i]! * samples[i]!
    envelope.push(Math.sqrt(sum / (end - offset)))
  }
  return envelope
}

function percentile(values: number[], share: number): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor(share * sorted.length))] ?? 0
}

function smooth(values: number[]): number[] {
  return values.map((_, i) => {
    const window = values.slice(Math.max(0, i - 1), i + 2)
    return window.reduce((sum, v) => sum + v, 0) / window.length
  })
}

export function speechThreshold(envelope: number[]): number {
  const floor = percentile(envelope, 0.1)
  const loud = percentile(envelope, 0.95)
  return floor + (loud - floor) * thresholdShare
}

interface Run {
  active: boolean
  from: number
  to: number
}

function toRuns(flags: boolean[]): Run[] {
  const runs: Run[] = []
  flags.forEach((active, index) => {
    const last = runs[runs.length - 1]
    if (last && last.active === active) last.to = index + 1
    else runs.push({ active, from: index, to: index + 1 })
  })
  return runs
}

function activeFrames(envelope: number[], minSpeechFrames: number): boolean[] {
  const threshold = speechThreshold(envelope)
  const flags = smooth(envelope).map((level) => level > threshold && level > 0)
  for (const run of toRuns(flags)) {
    if (run.active && run.to - run.from < minSpeechFrames) flags.fill(false, run.from, run.to)
  }
  return flags
}

export function detectSpeech(envelope: number[], options: SpeechOptions = {}): SpeechMap | null {
  const { frameMs = 10, minPauseMs = 200, minSpeechMs = 60 } = options
  const flags = activeFrames(envelope, Math.ceil(minSpeechMs / frameMs))
  const first = flags.indexOf(true)
  if (first === -1) return null
  const last = flags.lastIndexOf(true)
  const pauses = toRuns(flags.slice(first, last + 1))
    .filter((run) => !run.active && (run.to - run.from) * frameMs >= minPauseMs)
    .map((run) => ({ startMs: (run.from + first) * frameMs, endMs: (run.to + first) * frameMs }))
  return { startMs: first * frameMs, endMs: (last + 1) * frameMs, pauses }
}

export function speechFromSamples(samples: ArrayLike<number>, sampleRate: number, options: SpeechOptions = {}): SpeechMap | null {
  const frameMs = options.frameMs ?? 10
  return detectSpeech(rmsEnvelope(samples, sampleRate, frameMs), { ...options, frameMs })
}
