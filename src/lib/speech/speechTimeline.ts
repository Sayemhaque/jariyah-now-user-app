import type { SpeechMap } from './speechActivity'

export interface Region {
  startMs: number
  endMs: number
}

export class SpeechTimeline {
  readonly boundaryCount: number
  private readonly pauseTotals: number[]

  constructor(readonly speech: SpeechMap) {
    this.boundaryCount = speech.pauses.length + 2
    this.pauseTotals = [0]
    speech.pauses.forEach((p, i) => this.pauseTotals.push(this.pauseTotals[i]! + p.endMs - p.startMs))
  }

  resumeAt(boundary: number): number {
    return boundary === 0 ? this.speech.startMs : this.speech.pauses[boundary - 1]!.endMs
  }

  stopAt(boundary: number): number {
    return boundary > this.speech.pauses.length ? this.speech.endMs : this.speech.pauses[boundary - 1]!.startMs
  }

  skippedMs(from: number, to: number): number {
    return this.pauseTotals[to - 1]! - this.pauseTotals[from]!
  }

  spokenMs(from: number, to: number): number {
    return this.stopAt(to) - this.resumeAt(from) - this.skippedMs(from, to)
  }

  totalSpokenMs(): number {
    return this.spokenMs(0, this.boundaryCount - 1)
  }

  regions(from: number, to: number): Region[] {
    const inner = this.speech.pauses.slice(from, to - 1)
    const starts = [this.resumeAt(from), ...inner.map((p) => p.endMs)]
    const ends = [...inner.map((p) => p.startMs), this.stopAt(to)]
    return starts.map((startMs, i) => ({ startMs, endMs: ends[i]! }))
  }
}

export function spokenToRealMs(regions: Region[], offsetMs: number, preferLater: boolean): number {
  let remaining = offsetMs
  for (const [index, region] of regions.entries()) {
    const length = region.endMs - region.startMs
    const isLast = index === regions.length - 1
    if (remaining < length || (!preferLater && remaining === length) || isLast) return region.startMs + Math.min(remaining, length)
    remaining -= length
  }
  return regions[regions.length - 1]?.endMs ?? 0
}
