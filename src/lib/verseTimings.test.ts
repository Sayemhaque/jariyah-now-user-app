import { describe, it, expect } from 'vitest'
import { parseSegments, parseVerseTimings, resolveVerseAudioUrl } from './verseTimings'

const verse = (segments: unknown[], extraWords: object[] = []) => ({
  verse: {
    words: [
      { position: 1, text_uthmani: 'قُلْ', char_type_name: 'word' },
      { position: 2, text_uthmani: 'هُوَ', char_type_name: 'word' },
      { position: 3, text_uthmani: 'ٱللَّهُ', char_type_name: 'word' },
      { position: 4, text_uthmani: 'أَحَدٌ', char_type_name: 'word' },
      ...extraWords,
    ],
    audio: { url: 'Alafasy/mp3/112001.mp3', segments },
  },
})

describe('resolveVerseAudioUrl', () => {
  it('turns quran.com relative paths into verses.quran.com URLs', () => {
    expect(resolveVerseAudioUrl('Alafasy/mp3/112001.mp3')).toBe('https://verses.quran.com/Alafasy/mp3/112001.mp3')
    expect(resolveVerseAudioUrl('//mirrors.quranicaudio.com/a.mp3')).toBe('https://mirrors.quranicaudio.com/a.mp3')
    expect(resolveVerseAudioUrl('https://verses.quran.com/x.mp3')).toBe('https://verses.quran.com/x.mp3')
  })
})

describe('parseSegments', () => {
  it('reads both [start, end, from, to] and [position, from, to] shapes', () => {
    expect(parseSegments([[0, 1, 0, 500]]).get(1)).toEqual({ startMs: 0, endMs: 500 })
    expect(parseSegments([[2, 500, 900]]).get(2)).toEqual({ startMs: 500, endMs: 900 })
  })

  it('skips malformed segments', () => {
    expect(parseSegments([[1], 'x', [1, 900, 500]]).size).toBe(0)
  })
})

describe('parseVerseTimings', () => {
  it('maps every word to its exact timestamps and drops the verse-end marker', () => {
    const result = parseVerseTimings(
      verse([[0, 1, 120, 600], [1, 2, 600, 980], [2, 3, 980, 1700], [3, 4, 1700, 2900]], [
        { position: 5, text_uthmani: '١', char_type_name: 'end' },
      ]),
    )
    expect(result?.audioUrl).toBe('https://verses.quran.com/Alafasy/mp3/112001.mp3')
    expect(result?.words).toEqual([
      { text: 'قُلْ', startMs: 120, endMs: 600 },
      { text: 'هُوَ', startMs: 600, endMs: 980 },
      { text: 'ٱللَّهُ', startMs: 980, endMs: 1700 },
      { text: 'أَحَدٌ', startMs: 1700, endMs: 2900 },
    ])
  })

  it('fills a single missing word from its neighbours', () => {
    const result = parseVerseTimings(verse([[1, 0, 500], [2, 500, 900], [4, 1300, 2000]]))
    expect(result?.words[2]).toEqual({ text: 'ٱللَّهُ', startMs: 900, endMs: 1300 })
  })

  it('gives up when too few words have timings', () => {
    expect(parseVerseTimings(verse([[1, 0, 500]]))).toBeNull()
    expect(parseVerseTimings({})).toBeNull()
  })
})
