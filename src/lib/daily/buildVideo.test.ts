import { describe, it, expect, vi } from 'vitest'
import { surahsFallback } from '@/lib/surahs-fallback'

vi.mock('./audioAnalysis', () => ({ analyzeAudio: vi.fn(async () => ({ durationMs: 5000, speech: { startMs: 400, endMs: 4600, pauses: [] } })) }))
vi.mock('@/lib/fetchVerseTimings', () => ({ fetchVerseTimings: vi.fn(async () => null) }))
vi.mock('@/lib/quranApi', () => ({
  fetchSurahs: vi.fn(async () => surahsFallback),
  fetchAyatData: vi.fn(async (surah: number, ayat: number) => ({
    surahNumber: surah,
    ayatNumber: ayat,
    arabicText: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    translation: `Translation of ${surah}:${ayat}`,
    transliteration: '',
    audioUrl: `https://everyayah.com/data/x/${surah}-${ayat}.mp3`,
    audioDurationMs: 0,
    surahName: 'x',
    surahNameArabic: 'x',
  })),
}))

const { buildDailyPost } = await import('./buildVideo')

const postTimes = ['09:00', '15:00', '22:00']
const rotation = ['quran', 'masnoon', 'hadith', 'duas', 'azkar'] as const
const slotHours = [3, 9, 16]
const atSequence = (n: number) => new Date(Date.UTC(2026, 9, 20 + Math.floor(n / 3), slotHours[n % 3]!, 30))
const post = (n: number, extra = {}) => buildDailyPost({ now: atSequence(n), postTimes, contentRotation: [...rotation], reciterId: 'alafasy', ...extra })

async function firstOfMode(mode: string) {
  for (let n = 0; n < 15; n++) {
    const p = await post(n)
    if (p.mode === mode) return p
  }
  throw new Error(`no ${mode} post`)
}

describe('buildDailyPost', () => {
  it('rotates a Quran reel with four kinds of image posts', async () => {
    const posts = await Promise.all([0, 1, 2, 3, 4, 5].map((n) => post(n)))
    expect(new Set(posts.map((p) => p.mode))).toEqual(new Set(rotation))
    posts.forEach((p) => expect(p.kind).toBe(p.mode === 'quran' ? 'video' : 'images'))
  })

  it('makes one portrait hadith card with an English caption and no Quran tags', async () => {
    const p = await firstOfMode('hadith')
    if (p.kind !== 'images') throw new Error('expected images')
    expect(p.cards).toHaveLength(1)
    expect(p.cards[0]!.format).toBe('portrait')
    expect(p.cards[0]!.content.lines[0]!.arabic).toBeUndefined()
    expect(p.meta.title.startsWith('Hadith: ')).toBe(true)
    expect(p.meta.hashtags).toContain('#Hadith')
    expect(p.meta.hashtags).not.toContain('#Quran')
  })

  it('makes a masnoon carousel of at most ten slides from the preset ayat', async () => {
    const p = await firstOfMode('masnoon')
    if (p.kind !== 'images') throw new Error('expected images')
    expect(p.cards.length).toBeGreaterThanOrEqual(1)
    expect(p.cards.length).toBeLessThanOrEqual(10)
    expect(p.cards.every((c) => c.theme.key === p.cards[0]!.theme.key)).toBe(true)
    expect(p.cards[0]!.content.lines[0]!.translation).toMatch(/^Translation of \d+:\d+$/)
    expect(p.meta.title.startsWith('Masnoon Surah: ')).toBe(true)
  })

  it('keeps a manual surah override as a Quran reel', async () => {
    const p = await post(2, { surahOverride: 112 })
    expect(p.kind).toBe('video')
    if (p.kind === 'video') expect(p.props.surahName).toBe(surahsFallback.find((s) => s.number === 112)!.name)
  })
})
