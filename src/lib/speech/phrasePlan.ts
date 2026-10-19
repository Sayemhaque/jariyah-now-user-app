import type { WordUnit } from './wordUnits'
import type { SpeechTimeline } from './speechTimeline'

export interface Phrase {
  firstUnit: number
  endUnit: number
  fromBoundary: number
  toBoundary: number
}

const ratioWeight = 4
const nonWaqfStopCost = 0.3
const skipScaleMs = 300

function prefixSums(values: number[]): number[] {
  const sums = [0]
  values.forEach((v, i) => sums.push(sums[i]! + v))
  return sums
}

function skipCosts(timeline: SpeechTimeline): number[] {
  return prefixSums(timeline.speech.pauses.map((p) => 0.5 * ((p.endMs - p.startMs) / skipScaleMs) ** 2))
}

export function planPhrases(units: WordUnit[], timeline: SpeechTimeline): Phrase[] {
  const unitCount = units.length
  const lastBoundary = timeline.boundaryCount - 1
  const weights = prefixSums(units.map((u) => u.weight))
  const skips = skipCosts(timeline)
  const msPerWeight = timeline.totalSpokenMs() / weights[unitCount]!
  const width = timeline.boundaryCount
  const cost = new Float64Array((unitCount + 1) * width).fill(Infinity)
  const back = new Int32Array((unitCount + 1) * width * 2).fill(-1)
  cost[0] = 0

  for (let to = 1; to <= lastBoundary; to++) {
    const isEnd = to === lastBoundary
    for (let end = isEnd ? unitCount : 1; end <= (isEnd ? unitCount : unitCount - 1); end++) {
      const stopCost = !isEnd && !units[end - 1]!.waqf ? nonWaqfStopCost : 0
      for (let from = 0; from < to; from++) {
        const spoken = timeline.spokenMs(from, to)
        if (spoken <= 0) continue
        const skip = skips[to - 1]! - skips[from]!
        for (let first = from === 0 ? 0 : 1; first < end; first++) {
          const before = cost[first * width + from]!
          if (before === Infinity) continue
          const ratio = spoken / ((weights[end]! - weights[first]!) * msPerWeight)
          const total = before + ratioWeight * Math.log(ratio) ** 2 + skip + stopCost
          const cell = end * width + to
          if (total < cost[cell]!) {
            cost[cell] = total
            back[cell * 2] = first
            back[cell * 2 + 1] = from
          }
        }
      }
    }
  }

  const phrases: Phrase[] = []
  let end = unitCount
  let to = lastBoundary
  while (end > 0) {
    const cell = end * width + to
    const first = back[cell * 2]!
    const from = back[cell * 2 + 1]!
    if (first < 0) return [{ firstUnit: 0, endUnit: unitCount, fromBoundary: 0, toBoundary: lastBoundary }]
    phrases.unshift({ firstUnit: first, endUnit: end, fromBoundary: from, toBoundary: to })
    end = first
    to = from
  }
  return phrases
}
