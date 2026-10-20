import type { AyatData, TimedWord } from '@/lib/types'
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

export const textTranslation = (item: TextItem, language: TextLanguage) => (language === 'bangla' ? item.bangla : item.english)

export function buildTextSlide(mode: TextMode, item: TextItem, language: TextLanguage, audio: RecordedAudio): AyatData {
  return {
    surahNumber: 0,
    ayatNumber: 0,
    arabicText: item.arabic,
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
