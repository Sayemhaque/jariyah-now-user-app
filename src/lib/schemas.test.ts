import { describe, it, expect } from 'vitest'
import {
  timingsQuerySchema,
  renderBodySchema,
  renderUpdateBodySchema,
  renderStatusQuerySchema,
} from './schemas'
import type { AyatSlide, VideoSettings } from './types'

// A complete, valid settings object — used as the base for tests.
const VALID_SETTINGS: VideoSettings = {
  backgroundImage: '/backgrounds/twilight-mosque-portrait.png',
  backgroundPreset: 'twilight-mosque',
  overlayStyle: 'bottom-gradient',
  overlayColor: '#000000',
  overlayOpacity: 55,
  fontColor: '#ffffff',
  highlightColor: '#F5A623',
  arabicFontSize: 40,
  translationFontSize: 16,
  fontStyle: 'uthmani',
  arabicFont: 'uthmani',
  bengaliFont: 'sans',
  showTranslation: true,
  showTransliteration: false,
  orientation: 'portrait',
  autoFitFonts: true,
}

const VALID_SLIDE: AyatSlide = {
  arabicText: 'بسم الله',
  words: [{ text: 'بسم', startMs: 0, endMs: 500 }],
  translation: 'In the name of God',
  transliteration: 'Bismillah',
  surahName: 'Al-Fatihah',
  surahNameArabic: 'الفاتحة',
  ayatNumber: 1,
  surahNumber: 1,
  audioUrl: 'https://verses.quran.com/Alafasy/mp3/001001.mp3',
  audioDurationMs: 5000,
}

describe('timingsQuerySchema', () => {
  it('accepts valid input', () => {
    const parsed = timingsQuerySchema.safeParse({
      surah: 1,
      ayat: 1,
      recitationId: 7,
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects surah = 0', () => {
    const parsed = timingsQuerySchema.safeParse({
      surah: 0,
      ayat: 1,
      recitationId: 7,
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects surah = 115', () => {
    const parsed = timingsQuerySchema.safeParse({
      surah: 115,
      ayat: 1,
      recitationId: 7,
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects non-integer ayat', () => {
    const parsed = timingsQuerySchema.safeParse({
      surah: 1,
      ayat: 1.5,
      recitationId: 7,
    })
    expect(parsed.success).toBe(false)
  })
})

describe('renderBodySchema', () => {
  function validBody() {
    return {
      slides: [VALID_SLIDE],
      reciterKey: 'Alafasy/mp3',
      settings: VALID_SETTINGS,
      orientation: 'portrait' as const,
    }
  }

  it('accepts a valid single-slide body', () => {
    expect(renderBodySchema.safeParse(validBody()).success).toBe(true)
  })

  it('accepts 10 slides (the max)', () => {
    const body = validBody()
    body.slides = Array.from({ length: 10 }, () => ({ ...VALID_SLIDE }))
    expect(renderBodySchema.safeParse(body).success).toBe(true)
  })

  it('rejects 11 slides (exceeds max)', () => {
    const body = validBody()
    body.slides = Array.from({ length: 11 }, () => ({ ...VALID_SLIDE }))
    const parsed = renderBodySchema.safeParse(body)
    expect(parsed.success).toBe(false)
  })

  it('rejects 0 slides', () => {
    const body = validBody()
    body.slides = []
    const parsed = renderBodySchema.safeParse(body)
    expect(parsed.success).toBe(false)
  })

  it('rejects an invalid overlay color (not 6-digit hex)', () => {
    const body = validBody()
    ;(body.settings as any).overlayColor = '#fff' // too short
    const parsed = renderBodySchema.safeParse(body)
    expect(parsed.success).toBe(false)
  })

  it('rejects arabicFontSize out of range', () => {
    const body = validBody()
    ;(body.settings as any).arabicFontSize = 10 // below min of 24
    expect(renderBodySchema.safeParse(body).success).toBe(false)
  })

  it('rejects an invalid audio URL', () => {
    const body = validBody()
    body.slides[0]!.audioUrl = 'not-a-url'
    expect(renderBodySchema.safeParse(body).success).toBe(false)
  })

  it('rejects an invalid overlayStyle', () => {
    const body = validBody()
    ;(body.settings as any).overlayStyle = 'rainbow'
    expect(renderBodySchema.safeParse(body).success).toBe(false)
  })

  it('rejects a missing reciterKey', () => {
    const body = validBody()
    delete (body as any).reciterKey
    expect(renderBodySchema.safeParse(body).success).toBe(false)
  })
})

describe('renderUpdateBodySchema', () => {
  it('accepts a minimal progress update', () => {
    const parsed = renderUpdateBodySchema.safeParse({
      jobId: 'job_abc',
      progress: 0.5,
    })
    expect(parsed.success).toBe(true)
  })

  it('accepts a status-only update', () => {
    const parsed = renderUpdateBodySchema.safeParse({
      jobId: 'job_abc',
      status: 'done',
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects progress > 1', () => {
    const parsed = renderUpdateBodySchema.safeParse({
      jobId: 'job_abc',
      progress: 1.5,
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects progress < 0', () => {
    const parsed = renderUpdateBodySchema.safeParse({
      jobId: 'job_abc',
      progress: -0.1,
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects an invalid status', () => {
    const parsed = renderUpdateBodySchema.safeParse({
      jobId: 'job_abc',
      status: 'cancelled',
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects a missing jobId', () => {
    const parsed = renderUpdateBodySchema.safeParse({ progress: 0.5 })
    expect(parsed.success).toBe(false)
  })
})

describe('renderStatusQuerySchema', () => {
  it('accepts a valid jobId', () => {
    expect(
      renderStatusQuerySchema.safeParse({ jobId: 'job_abc' }).success,
    ).toBe(true)
  })

  it('rejects an empty jobId', () => {
    expect(
      renderStatusQuerySchema.safeParse({ jobId: '' }).success,
    ).toBe(false)
  })
})
