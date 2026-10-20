import type { AyatData, TimedWord } from '@/lib/types'
import { splitWords, wordWeight } from '@/lib/wordTiming'
import type { TextItem, TextLanguage, TextMode } from './types'

export interface VideoTitles {
  surahName: string
  surahNameArabic: string
  surahMeaning: string
  reciterName: string
}

export interface RecordedAudio {
  url: string
  durationMs: number
  words?: TimedWord[]
}

const arabicHeadings: Record<TextMode, string> = { hadith: 'حديث', azkar: 'أذكار' }
const englishHeadings: Record<TextMode, string> = { hadith: 'Hadith', azkar: 'Azkar' }

export const slideArabic = (mode: TextMode, item: TextItem) => (mode === 'hadith' ? '' : item.arabic)

export const textTranslation = (item: TextItem, language: TextLanguage) => (language === 'bangla' ? item.bangla : item.english)

export function buildTextSlide(mode: TextMode, item: TextItem, language: TextLanguage, audio: RecordedAudio): AyatData {
  return {
    surahNumber: 0,
    ayatNumber: 0,
    arabicText: slideArabic(mode, item),
    translation: textTranslation(item, language),
    transliteration: '',
    audioUrl: audio.url,
    audioDurationMs: audio.durationMs,
    surahName: englishHeadings[mode],
    surahNameArabic: arabicHeadings[mode],
    ...(audio.words ? { words: audio.words } : {}),
  }
}

export function textVideoTitles(mode: TextMode, item: TextItem): VideoTitles {
  return { surahName: item.title, surahNameArabic: arabicHeadings[mode], surahMeaning: '', reciterName: item.source }
}

export const isTextSlide = (slide: { surahNumber: number } | undefined) => slide?.surahNumber === 0

const leadInMs = 900
const msPerArabicWord = 700
const msPerTranslationWord = 260
const msPerMainTextWord = 420
const tailMs = 1500
const minSilentMs = 7000

function evenlyTimedWords(words: string[], startMs: number, spanMs: number): TimedWord[] {
  const total = words.reduce((sum, w) => sum + wordWeight(w), 0)
  let cursor = startMs
  return words.map((text) => {
    const lengthMs = (wordWeight(text) / total) * spanMs
    const word = { text, startMs: cursor, endMs: cursor + lengthMs }
    cursor += lengthMs
    return word
  })
}

export function silentTextAudio(mode: TextMode, item: TextItem, language: TextLanguage): RecordedAudio {
  const arabicWords = splitWords(slideArabic(mode, item))
  const arabicMs = arabicWords.length * msPerArabicWord
  const translationMs = splitWords(textTranslation(item, language)).length * (arabicWords.length ? msPerTranslationWord : msPerMainTextWord)
  const durationMs = Math.max(minSilentMs, leadInMs + arabicMs + translationMs + tailMs)
  return { url: '', durationMs, ...(arabicWords.length ? { words: evenlyTimedWords(arabicWords, leadInMs, arabicMs) } : {}) }
}
