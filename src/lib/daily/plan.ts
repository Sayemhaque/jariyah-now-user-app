/**
 * Daily auto-post planning — pure, deterministic helpers.
 *
 * Every decision (surah, start ayat, reciter, background) is derived from the
 * Bangladesh calendar date, so a re-run of the same day's job produces the
 * same video and nothing needs to be persisted between runs.
 */
import type { Surah } from '@/lib/types'

/** Asia/Dhaka is UTC+6 all year (no DST). */
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const TOTAL_SURAHS = 114

/** YYYY-MM-DD of `date` in Bangladesh local time. */
export function dhakaDateKey(date: Date): string {
  return new Date(date.getTime() + DHAKA_OFFSET_MS).toISOString().slice(0, 10)
}

/** Whole days since 1970-01-01 in Bangladesh local time. */
export function dhakaDayIndex(date: Date): number {
  return Math.floor((date.getTime() + DHAKA_OFFSET_MS) / DAY_MS)
}

/** Small seeded PRNG (mulberry32). Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher–Yates shuffle with a seeded PRNG. Does not mutate `items`. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = items.slice()
  const rand = mulberry32(seed)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/**
 * Surah for a given day. Walks a fixed shuffled order of all 114 surahs, so
 * the pick looks random but no surah repeats until every other one has been
 * posted (one full cycle = 114 days). A new order is used for each cycle.
 */
export function pickSurahNumber(dayIndex: number): number {
  const cycle = Math.floor(dayIndex / TOTAL_SURAHS)
  const order = seededShuffle(
    Array.from({ length: TOTAL_SURAHS }, (_, i) => i + 1),
    0x51ab + cycle,
  )
  return order[((dayIndex % TOTAL_SURAHS) + TOTAL_SURAHS) % TOTAL_SURAHS]!
}

/**
 * First ayat of the excerpt. Short surahs always start at 1 so the whole
 * surah can be posted; longer ones start at a random ayat, leaving room for
 * at least a few ayats after it.
 */
export function pickStartAyat(numberOfAyahs: number, maxAyats: number, rand: () => number): number {
  if (numberOfAyahs <= maxAyats) return 1
  const lastStart = Math.max(1, numberOfAyahs - 2)
  return 1 + Math.floor(rand() * lastStart)
}

/**
 * How many consecutive ayats (from the start of `durationsMs`) fit in the
 * time budget. Returns 0 when even the first ayat is too long.
 */
export function countAyatsWithinBudget(
  durationsMs: readonly number[],
  maxTotalMs: number,
  maxAyats: number,
): number {
  let total = 0
  let count = 0
  for (const d of durationsMs) {
    if (count >= maxAyats || total + d > maxTotalMs) break
    total += d
    count++
  }
  return count
}

export interface PostMetadataInput {
  surah: Pick<Surah, 'number' | 'name' | 'englishName' | 'arabicName' | 'numberOfAyahs'>
  fromAyat: number
  toAyat: number
  reciterName: string
  /** Extra hashtags (without or with '#') appended to the defaults. */
  extraHashtags?: string[]
}

export interface PostMetadata {
  /** ≤100 chars (YouTube's title limit). */
  title: string
  /** Long caption for YouTube / Facebook / Instagram. */
  description: string
  /** Hashtags, each starting with '#'. */
  hashtags: string[]
  /** Short caption for TikTok (title field, ≤2200 chars). */
  shortCaption: string
}

const DEFAULT_HASHTAGS = [
  '#Quran',
  '#QuranRecitation',
  '#Islam',
  '#Muslim',
  '#Allah',
  '#Tilawat',
  '#কুরআন',
  '#QuranReels',
  '#Shorts',
]

function toHashtag(raw: string): string {
  const cleaned = raw.trim().replace(/^#+/, '').replace(/[^\p{L}\p{N}_]/gu, '')
  return cleaned ? `#${cleaned}` : ''
}

export function buildPostMetadata(input: PostMetadataInput): PostMetadata {
  const { surah, fromAyat, toAyat, reciterName } = input
  const isWhole = fromAyat === 1 && toAyat === surah.numberOfAyahs
  const range = isWhole
    ? 'Full Surah'
    : fromAyat === toAyat
      ? `Ayat ${fromAyat}`
      : `Ayat ${fromAyat}-${toAyat}`

  const tags = [
    ...DEFAULT_HASHTAGS,
    toHashtag(`Surah${surah.name}`),
    toHashtag(reciterName),
    ...(input.extraHashtags ?? []).map(toHashtag),
  ].filter(Boolean)
  const hashtags = Array.from(new Set(tags))

  const base = `Surah ${surah.name} (${surah.arabicName}) | ${range}`
  const title = `${base} #Shorts`.length <= 100 ? `${base} #Shorts` : base.slice(0, 100)

  const lines = [
    `Surah ${surah.name} — ${surah.englishName}`,
    `Surah ${surah.number}, ${range === 'Full Surah' ? `all ${surah.numberOfAyahs} ayats` : range}`,
    `Recited by ${reciterName}`,
    '',
    'Share this reminder — it could be sadaqah jariyah for you.',
    '',
    hashtags.join(' '),
  ]

  return {
    title,
    description: lines.join('\n'),
    hashtags,
    shortCaption: `${base} — ${reciterName}\n${hashtags.join(' ')}`,
  }
}
