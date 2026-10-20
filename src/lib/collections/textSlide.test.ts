import { describe, it, expect } from 'vitest'
import { azkarCollection } from './azkar'
import { hadithCollection } from './hadith'
import { buildTextSlide, isTextSlide, silentTextAudio, textVideoTitles } from './textSlide'
import { buildTextPostMetadata } from './textPostMetadata'

const item = hadithCollection[0]!
const audio = { url: 'https://x.private.blob.vercel-storage.com/recordings/hadith/intentions.webm', durationMs: 6200 }

describe('buildTextSlide', () => {
  it('turns a hadith and a recording into a translation-only slide without an ayah number', () => {
    const slide = buildTextSlide('hadith', item, 'bangla', audio)
    expect(slide).toMatchObject({ surahNumber: 0, ayatNumber: 0, arabicText: '', translation: item.bangla, audioUrl: audio.url, audioDurationMs: 6200 })
    expect(slide.words).toBeUndefined()
    expect(isTextSlide(slide)).toBe(true)
    expect(isTextSlide({ surahNumber: 2 })).toBe(false)
  })

  it('keeps the Arabic for azkar and uses the English translation when asked', () => {
    const zikr = azkarCollection[0]!
    const slide = buildTextSlide('azkar', zikr, 'english', { ...audio, words: [{ text: 'x', startMs: 300, endMs: 800 }] })
    expect(slide.arabicText).toBe(zikr.arabic)
    expect(slide.translation).toBe(zikr.english)
    expect(slide.words).toHaveLength(1)
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
    expect(meta.description).not.toContain(item.arabic)
    expect(meta.description).toContain(item.english)
    expect(meta.description).toContain(`Source: ${item.source}`)
    expect(meta.hashtags).toContain('#Hadith')
    expect(meta.hashtags).toContain('#JariyahNow')
    expect(meta.hashtags).not.toContain('#Quran')
  })
})

describe('silentTextAudio', () => {
  it('shows a hadith as translation only, timed to how long it takes to read', () => {
    const short = silentTextAudio('hadith', hadithCollection.find((h) => h.id === 'purity')!, 'english')
    const long = silentTextAudio('hadith', hadithCollection.find((h) => h.id === 'anger')!, 'bangla')
    expect(short).toEqual({ url: '', durationMs: 7000 })
    expect(long.durationMs).toBeGreaterThan(short.durationMs)
    expect(long.words).toBeUndefined()
  })

  it('highlights azkar Arabic at reading pace before the translation', () => {
    const item = azkarCollection.find((a) => a.id === 'sayyidul-istighfar')!
    const audio = silentTextAudio('azkar', item, 'bangla')
    expect(audio.words!.map((w) => w.text)).toEqual(item.arabic.split(' '))
    expect(audio.words![0]!.startMs).toBe(900)
    expect(audio.words![audio.words!.length - 1]!.endMs).toBeLessThan(audio.durationMs - 1500)
  })
})
