export interface ToneSpan {
  startMs: number
  endMs: number
  level?: number
}

export function synthRecitation(spans: ToneSpan[], durationMs: number, sampleRate = 8000, noise = 0.002): Float32Array {
  const samples = new Float32Array(Math.round((durationMs / 1000) * sampleRate))
  let seed = 7
  for (let i = 0; i < samples.length; i++) {
    seed = (seed * 16807) % 2147483647
    samples[i] = ((seed / 2147483647) * 2 - 1) * noise
  }
  for (const span of spans) {
    const from = Math.round((span.startMs / 1000) * sampleRate)
    const to = Math.min(samples.length, Math.round((span.endMs / 1000) * sampleRate))
    for (let i = from; i < to; i++) samples[i]! += Math.sin((2 * Math.PI * 180 * i) / sampleRate) * (span.level ?? 0.5)
  }
  return samples
}
