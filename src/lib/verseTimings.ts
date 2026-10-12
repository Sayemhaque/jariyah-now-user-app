import type { TimedWord } from './types'

export interface VerseTimings {
  audioUrl: string
  words: TimedWord[]
}

interface QuranComWord {
  position?: number
  text_uthmani?: string
  text?: string
  char_type_name?: string
}

interface QuranComVerse {
  words?: QuranComWord[]
  audio?: { url?: string; segments?: unknown[] }
}

const versesHost = 'https://verses.quran.com/'

export function resolveVerseAudioUrl(url: string): string {
  if (url.startsWith('//')) return `https:${url}`
  if (/^https?:\/\//.test(url)) return url
  return versesHost + url.replace(/^\/+/, '')
}

export function parseSegments(segments: unknown[]): Map<number, { startMs: number; endMs: number }> {
  const byPosition = new Map<number, { startMs: number; endMs: number }>()
  for (const raw of segments) {
    if (!Array.isArray(raw) || raw.length < 3 || !raw.every((n) => typeof n === 'number')) continue
    const position = raw.length >= 4 ? raw[1] : raw[0]
    const startMs = raw[raw.length - 2]
    const endMs = raw[raw.length - 1]
    if (endMs > startMs && !byPosition.has(position)) byPosition.set(position, { startMs, endMs })
  }
  return byPosition
}

export function parseVerseTimings(json: unknown): VerseTimings | null {
  const verse = (json as { verse?: QuranComVerse })?.verse
  const audioUrl = verse?.audio?.url
  if (!verse?.words?.length || !audioUrl || !Array.isArray(verse.audio?.segments)) return null

  const words = verse.words
    .filter((w) => (w.char_type_name ?? 'word') === 'word' && (w.text_uthmani ?? w.text))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  const segments = parseSegments(verse.audio.segments)
  const timed = words.map((w) => ({ text: (w.text_uthmani ?? w.text)!, timing: segments.get(w.position ?? -1) }))
  if (!timed.length || timed.filter((w) => w.timing).length < timed.length * 0.6) return null

  const filled: TimedWord[] = []
  timed.forEach((word, index) => {
    const previousEnd = filled[index - 1]?.endMs ?? 0
    const next = timed.slice(index + 1).find((w) => w.timing)?.timing
    const startMs = word.timing?.startMs ?? previousEnd
    const endMs = word.timing?.endMs ?? next?.startMs ?? startMs + 400
    filled.push({ text: word.text, startMs, endMs: Math.max(endMs, startMs + 1) })
  })
  return { audioUrl: resolveVerseAudioUrl(audioUrl), words: filled }
}
