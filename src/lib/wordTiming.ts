export interface WordWindow {
  startMs: number
  endMs: number
}

const arabicMarks = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g
const leadInShare = 0.04
const tailShare = 0.06

export const splitWords = (text: string) => text.split(/\s+/).filter(Boolean)

export function wordWeight(word: string): number {
  return Math.max(1, word.replace(arabicMarks, '').length)
}

export function computeWordWindows(words: string[], durationMs: number): WordWindow[] {
  if (!words.length || durationMs <= 0) return []
  const weights = words.map(wordWeight)
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const startMs = durationMs * leadInShare
  const spokenMs = durationMs * (1 - leadInShare - tailShare)
  let cursor = startMs
  return weights.map((weight) => {
    const lengthMs = (weight / total) * spokenMs
    const window = { startMs: cursor, endMs: cursor + lengthMs }
    cursor += lengthMs
    return window
  })
}

export function activeWordIndex(windows: WordWindow[], timeMs: number): number {
  if (!windows.length || timeMs < windows[0]!.startMs) return -1
  const index = windows.findIndex((w) => timeMs < w.endMs)
  return index === -1 ? windows.length : index
}

const arabicDigits = '٠١٢٣٤٥٦٧٨٩'

export const toArabicDigits = (value: number) => String(value).replace(/\d/g, (d) => arabicDigits[Number(d)]!)
