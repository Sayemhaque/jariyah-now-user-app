import type { Surah } from '@/lib/types'

const dhakaOffsetMs = 6 * 60 * 60 * 1000
const dayMs = 24 * 60 * 60 * 1000
const totalSurahs = 114

export function dhakaDateKey(date: Date): string {
  return new Date(date.getTime() + dhakaOffsetMs).toISOString().slice(0, 10)
}

export function dhakaDayIndex(date: Date): number {
  return Math.floor((date.getTime() + dhakaOffsetMs) / dayMs)
}

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

export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = items.slice()
  const rand = mulberry32(seed)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

export function pickSurahNumber(dayIndex: number): number {
  const cycle = Math.floor(dayIndex / totalSurahs)
  const order = seededShuffle(
    Array.from({ length: totalSurahs }, (_, i) => i + 1),
    0x51ab + cycle,
  )
  return order[((dayIndex % totalSurahs) + totalSurahs) % totalSurahs]!
}

export function pickStartAyat(numberOfAyahs: number, maxAyats: number, rand: () => number): number {
  if (numberOfAyahs <= maxAyats) return 1
  const lastStart = Math.max(1, numberOfAyahs - 2)
  return 1 + Math.floor(rand() * lastStart)
}

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
  translationCredit?: string
  extraHashtags?: string[]
}

export interface PostMetadata {
  title: string
  description: string
  hashtags: string[]
  shortCaption: string
}

const defaultHashtags = [
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
    ...defaultHashtags,
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
    '',
    `Reciter: ${reciterName}`,
    ...(input.translationCredit ? [`Translation: ${input.translationCredit}`] : []),
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
