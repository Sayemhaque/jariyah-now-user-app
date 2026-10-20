import { describe, it, expect, vi, beforeEach } from 'vitest'
import { surahsFallback } from '@/lib/surahs-fallback'

const recordings = vi.hoisted(() => ({ list: [] as { mode: string; itemId: string; url: string; uploadedAt: string }[] }))

vi.mock('@/lib/recordings/blobRecordings', () => ({ listRecordings: vi.fn(async () => recordings.list) }))
vi.mock('./audioAnalysis', () => ({ analyzeAudio: vi.fn(async () => ({ durationMs: 5000, speech: { startMs: 400, endMs: 4600, pauses: [] } })) }))
vi.mock('@/lib/fetchVerseTimings', () => ({ fetchVerseTimings: vi.fn(async () => null) }))
vi.mock('@/lib/quranApi', () => ({
  fetchSurahs: vi.fn(async () => surahsFallback),
  fetchAyatData: vi.fn(async (surah: number, ayat: number) => ({
    surahNumber: surah,
    ayatNumber: ayat,
    arabicText: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    translation: 'In the name of Allah',
    transliteration: '',
    audioUrl: `https://everyayah.com/data/x/${surah}-${ayat}.mp3`,
    audioDurationMs: 0,
    surahName: 'x',
    surahNameArabic: 'x',
  })),
}))

const { buildDailyVideo } = await import('./buildVideo')

const postTimes = ['09:00', '15:00', '22:00']
const rotation = ['quran', 'masnoon', 'hadith', 'duas', 'azkar'] as const
const atSlot = (dayOffset: number, hourUtc: number) => new Date(Date.UTC(2026, 9, 20 + dayOffset, hourUtc, 30))

async function modesOver(days: number) {
  const modes: string[] = []
  for (let d = 0; d < days; d++) {
    for (const hour of [3, 9, 16]) {
      const video = await buildDailyVideo({ now: atSlot(d, hour), postTimes, contentRotation: [...rotation], blobToken: 'token', reciterId: 'alafasy' })
      modes.push(video.mode)
    }
  }
  return modes
}

describe('buildDailyVideo content rotation', () => {
  beforeEach(() => {
    recordings.list = []
  })

  it('rotates Quran, masnoon surahs and duas when no voice recordings exist yet', async () => {
    const modes = await modesOver(3)
    expect(new Set(modes)).toEqual(new Set(['quran', 'masnoon', 'duas']))
  })

  it('posts a hadith with the recorded voice once a recording is saved', async () => {
    recordings.list = [{ mode: 'hadith', itemId: 'purity', url: 'https://x.private.blob.vercel-storage.com/recordings/hadith/purity.webm', uploadedAt: '' }]
    const modes = await modesOver(2)
    expect(modes).toContain('hadith')
    const hadithIndex = modes.indexOf('hadith')
    const video = await buildDailyVideo({ now: atSlot(Math.floor(hadithIndex / 3), [3, 9, 16][hadithIndex % 3]!), postTimes, contentRotation: [...rotation], blobToken: 'token' })
    expect(video.props.slides[0]).toMatchObject({ ayatNumber: 0, audioUrl: recordings.list[0]!.url, audioDurationMs: 5000 })
    expect(video.props.slides[0]!.words?.[0]!.startMs).toBe(400)
    expect(video.props.surahName).toBe('Purity is half of faith')
    expect(video.meta.title).toBe('Hadith: Purity is half of faith #Shorts')
  })

  it('makes masnoon posts from the preset range with a headline in the caption', async () => {
    const video = await buildDailyVideo({ now: atSlot(0, 9), postTimes, contentRotation: ['masnoon'], reciterId: 'alafasy' })
    expect(video.mode).toBe('masnoon')
    expect(video.meta.title.startsWith('Masnoon Surah: ')).toBe(true)
    expect(video.meta.hashtags).toContain('#MasnoonSurah')
    expect(video.props.slides.length).toBeLessThanOrEqual(10)
  })

  it('keeps a manual surah override as a plain Quran post', async () => {
    const video = await buildDailyVideo({ now: atSlot(0, 3), postTimes, contentRotation: ['hadith'], surahOverride: 112, reciterId: 'alafasy' })
    expect(video.mode).toBe('quran')
    expect(video.props.surahName).toBe(surahsFallback.find((s) => s.number === 112)!.name)
  })
})
