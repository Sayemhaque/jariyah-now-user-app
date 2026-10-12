import { wordWeight } from '@/lib/wordTiming'
import { arabicLineStarts, fitTextScale } from './layout'

export interface PageRange {
  start: number
  end: number
}

export interface AyahPage extends PageRange {
  translation: string
  transliteration: string
}

export interface PagePlanInput {
  words: string[]
  translation: string
  transliteration: string
  arabicSize: number
  translationSize: number
  arabicLineHeight: number
  maxWidth: number
  availableHeight: number
  arabicWidthFactor: number
}

export const linesPerPage = 2
export const minWholeScale = 0.75
const breakChars = /[।,;:.!?—]/

export function pageRanges(words: string[], fontSize: number, maxWidth: number, lines = linesPerPage): PageRange[] {
  const starts = arabicLineStarts(words, fontSize, maxWidth).filter((_, index) => index % lines === 0)
  return starts.map((start, index) => ({ start, end: starts[index + 1] ?? words.length }))
}

function nearestCut(text: string, target: number, after: number, reach: number): number {
  let best = -1
  for (let p = Math.max(after + 1, target - reach); p <= Math.min(text.length - 1, target + reach); p++) {
    if (text[p] === ' ' && breakChars.test(text[p - 1]!) && (best < 0 || Math.abs(p - target) < Math.abs(best - target))) best = p
  }
  if (best >= 0) return best
  const before = text.lastIndexOf(' ', target)
  const later = text.indexOf(' ', target)
  const options = [before, later].filter((p) => p > after)
  if (!options.length) return after
  return options.reduce((a, b) => (Math.abs(a - target) <= Math.abs(b - target) ? a : b))
}

export function splitByWeights(text: string, weights: number[]): string[] {
  if (weights.length <= 1) return [text]
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const reach = Math.round((text.length / weights.length) * 0.4)
  const cuts = [0]
  let share = 0
  for (const weight of weights.slice(0, -1)) {
    share += weight
    cuts.push(nearestCut(text, Math.round((text.length * share) / total), cuts[cuts.length - 1]!, reach))
  }
  cuts.push(text.length)
  return weights.map((_, index) => text.slice(cuts[index], cuts[index + 1]).trim())
}

export function planPages(input: PagePlanInput): { pages: AyahPage[]; scale: number } {
  const fit = (words: string[], translation: string) => fitTextScale({ ...input, arabicWords: words, translation })
  const whole = fit(input.words, input.translation)
  if (whole >= minWholeScale) {
    return { pages: [{ start: 0, end: input.words.length, translation: input.translation, transliteration: input.transliteration }], scale: whole }
  }
  const ranges = pageRanges(input.words, input.arabicSize * input.arabicWidthFactor, input.maxWidth)
  const weights = ranges.map((r) => input.words.slice(r.start, r.end).reduce((sum, word) => sum + wordWeight(word), 0))
  const translations = splitByWeights(input.translation, weights)
  const transliterations = splitByWeights(input.transliteration, weights)
  const pages = ranges.map((r, index) => ({ ...r, translation: translations[index] ?? '', transliteration: transliterations[index] ?? '' }))
  return { pages, scale: Math.min(1, ...pages.map((p) => fit(input.words.slice(p.start, p.end), p.translation))) }
}
