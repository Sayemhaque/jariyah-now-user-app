// Shared types for the Quran Video Generator

export interface Surah {
  number: number
  name: string          // English name
  englishName: string
  arabicName: string
  numberOfAyahs: number
  revelationType: 'Meccan' | 'Medinan'
}

export interface WordTiming {
  text: string
  position: number
  startMs: number
  endMs: number
  // transliteration from the API when available
  transliteration?: string
}

export interface AyatData {
  surahNumber: number
  ayatNumber: number
  arabicText: string
  translation: string
  words: WordTiming[]
  audioUrl: string
  audioDurationMs: number
}

export interface AyatSlide {
  arabicText: string
  words: { text: string; startMs: number; endMs: number }[]
  translation: string
  transliteration?: string
  surahName: string
  surahNameArabic: string
  ayatNumber: number
  surahNumber: number
  audioUrl: string
  audioDurationMs: number
}

export interface Reciter {
  id: string
  name: string
  arabicName: string
  style: string
  // Used to build verses.quran.com audio URL: https://verses.quran.com/{audioKey}/{surah}{ayat}.mp3
  audioKey: string
  // Used to query word timings from api.quran.com
  recitationId: number
  avatarColor: string  // used as a fallback avatar background
}

export type Orientation = 'landscape' | 'portrait' | 'square'
export type FontStyle = 'uthmani' | 'naskh'

export interface VideoSettings {
  backgroundImage: string      // URL or data URL
  backgroundPreset: string     // preset key or 'custom'
  overlayColor: string         // hex
  overlayOpacity: number       // 0–80
  fontColor: string            // hex
  highlightColor: string       // hex, default #F5A623
  arabicFontSize: number       // 24–72
  translationFontSize: number  // 14–32
  fontStyle: FontStyle
  showBorder: boolean
  borderColor: string
  border_radius: number
  showTranslation: boolean
  showTransliteration: boolean
  orientation: Orientation
}

export interface ExportOptions {
  platform: 'reel' | 'shorts' | 'youtube' | 'square'
  quality: '720p' | '1080p'
  filename: string
}
