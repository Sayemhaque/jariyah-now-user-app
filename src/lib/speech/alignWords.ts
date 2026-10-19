import type { WordWindow } from '@/lib/wordTiming'
import type { SpeechMap } from './speechActivity'
import { SpeechTimeline, spokenToRealMs } from './speechTimeline'
import { planPhrases, type Phrase } from './phrasePlan'
import { toWordUnits, type WordUnit } from './wordUnits'

const stopElongation = 2
const maxPauses = 40

function keepLongestPauses(speech: SpeechMap): SpeechMap {
  if (speech.pauses.length <= maxPauses) return speech
  const longest = [...speech.pauses].sort((a, b) => b.endMs - b.startMs - (a.endMs - a.startMs)).slice(0, maxPauses)
  return { ...speech, pauses: longest.sort((a, b) => a.startMs - b.startMs) }
}

function phraseWindows(units: WordUnit[], phrase: Phrase, timeline: SpeechTimeline): WordWindow[] {
  const regions = timeline.regions(phrase.fromBoundary, phrase.toBoundary)
  const group = units.slice(phrase.firstUnit, phrase.endUnit).map((u) => u.weight)
  group[group.length - 1]! += stopElongation
  const msPerWeight = timeline.spokenMs(phrase.fromBoundary, phrase.toBoundary) / group.reduce((s, w) => s + w, 0)
  let cursor = 0
  return group.map((weight) => {
    const startMs = spokenToRealMs(regions, cursor * msPerWeight, true)
    cursor += weight
    return { startMs, endMs: spokenToRealMs(regions, cursor * msPerWeight, false) }
  })
}

function closeGaps(windows: WordWindow[]): WordWindow[] {
  return windows.map((w, i) => ({ startMs: w.startMs, endMs: Math.max(w.endMs, windows[i + 1]?.startMs ?? w.endMs) }))
}

export function alignWordsToSpeech(words: string[], speech: SpeechMap): WordWindow[] {
  if (!words.length || speech.endMs <= speech.startMs) return []
  const units = toWordUnits(words)
  const timeline = new SpeechTimeline(keepLongestPauses(speech))
  const unitWindows = closeGaps(planPhrases(units, timeline).flatMap((phrase) => phraseWindows(units, phrase, timeline)))
  const windows: WordWindow[] = new Array(words.length)
  units.forEach((unit, u) => {
    const window = unitWindows[u]!
    unit.tokens.forEach((token, t) => {
      windows[token] = t === 0 ? window : { startMs: window.endMs, endMs: window.endMs }
    })
  })
  return windows
}
