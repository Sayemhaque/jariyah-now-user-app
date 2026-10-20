import { describe, it, expect } from 'vitest'
import { hadithCollection } from './hadith'
import { buildTextSlide, isTextSlide, silentTextAudio, textVideoTitles } from './textSlide'
import { buildTextPostMetadata } from './textPostMetadata'

const item = hadithCollection[0]!
const audio = { url: 'https://x.private.blob.vercel-storage.com/recordings/hadith/intentions.webm', durationMs: 6200 }

describe('buildTextSlide', () => {
  it('turns a hadith and a recording into a slide without an ayah number', () => {
    const slide = buildTextSlide('hadith', item, 'bangla', { ...audio, words: [{ text: 'إِنَّمَا', startMs: 300, endMs: 800 }] })
    expect(slide).toMatchObject({ surahNumber: 0, ayatNumber: 0, arabicText: item.arabic, translation: item.bangla, audioUrl: audio.url, audioDurationMs: 6200 })
    expect(slide.words).toHaveLength(1)
    expect(isTextSlide(slide)).toBe(true)
    expect(isTextSlide({ surahNumber: 2 })).toBe(false)
  })

  it('uses the English translation when asked', () => {
    expect(buildTextSlide('azkar', item, 'english', audio).translation).toBe(item.english)
  })
})

describe('textVideoTitles', () => {
  it('shows the title, an Arabic heading and the source in the badge', () => {
    expect(textVideoTitles('hadith', item)).toEqual({ surahName: item.title, surahNameArabic: 'حديث', surahMeaning: '', reciterName: item.source })
  })
})

describe('buildTextPostMetadata', () => {
  it('writes a caption with the text, the source and hadith hashtags but no Quran tags', () => {
    const meta = buildTextPostMetadata({ mode: 'hadith', item, language: 'english', extraHashtags: ['JariyahNow', 'Quran'] })
    expect(meta.title).toBe(`Hadith: ${item.title} #Shorts`)
    expect(meta.description).toContain(item.arabic)
    expect(meta.description).toContain(item.english)
    expect(meta.description).toContain(`Source: ${item.source}`)
    expect(meta.hashtags).toContain('#Hadith')
    expect(meta.hashtags).toContain('#JariyahNow')
    expect(meta.hashtags).not.toContain('#Quran')
  })
})

describe('silentTextAudio', () => {
  it('gives a silent slide enough time to read the Arabic and the translation', () => {
    const long = hadithCollection.find((h) => h.id === 'anger')!
    const short = silentTextAudio(hadithCollection.find((h) => h.id === 'purity')!, 'english')
    const audio = silentTextAudio(long, 'bangla')
    expect(short.url).toBe('')
    expect(short.durationMs).toBe(7000)
    expect(audio.durationMs).toBeGreaterThan(short.durationMs)
    expect(audio.words!.map((w) => w.text)).toEqual(long.arabic.split(' '))
    expect(audio.words![0]!.startMs).toBe(900)
    expect(audio.words![audio.words!.length - 1]!.endMs).toBeLessThan(audio.durationMs - 1500)
  })
})
