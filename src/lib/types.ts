export interface Surah {
  number: number
  name: string
  englishName: string
  arabicName: string
  numberOfAyahs: number
  revelationType: 'Meccan' | 'Medinan'
}

export interface AyatData {
  surahNumber: number
  ayatNumber: number
  arabicText: string
  translation: string
  transliteration: string
  audioUrl: string
  audioDurationMs: number
  audioPauses?: { start: number; end: number; duration: number }[]
  words?: TimedWord[]
  surahName: string
  surahNameArabic: string
}

export interface AyatSlide {
  arabicText: string
  translation: string
  transliteration?: string
  surahName: string
  surahNameArabic: string
  ayatNumber: number
  surahNumber: number
  audioUrl: string
  audioDurationMs: number
  audioPauses?: { start: number; end: number; duration: number }[]
  words?: TimedWord[]
}

export interface TimedWord {
  text: string
  startMs: number
  endMs: number
}

export interface Reciter {
  id: string
  name: string
  arabicName: string
  style: string
  audioKey: string
  recitationId: number
  quranComId?: number
  avatarColor: string
}

export type Orientation = 'landscape' | 'portrait'

export type ArabicFont =
  | 'quran'
  | 'uthmani'
  | 'scheherazade'
  | 'markazi'
  | 'naskh'
  | 'kufi'
  | 'cairo'
  | 'amiri'

export type BengaliFont = 'sans' | 'serif' | 'hind'

export type FontStyle = ArabicFont

export type OverlayStyle =
  | 'solid'
  | 'bottom-gradient'
  | 'top-gradient'
  | 'vignette'
  | 'center-focus'
  | 'none'

export type TextWidth = 'full' | 'wide' | 'medium' | 'narrow'
export type TextSpacing = 'compact' | 'normal' | 'spacious'

export interface VideoSettings {
  backgroundImage: string
  backgroundPreset: string
  overlayStyle: OverlayStyle
  overlayColor: string
  overlayOpacity: number
  fontColor: string
  highlightColor: string
  wordHighlight?: boolean
  arabicFontSize: number
  translationFontSize: number
  fontStyle: FontStyle
  arabicFont: ArabicFont
  bengaliFont: BengaliFont
  useTajweed: boolean
  showTranslation: boolean
  showTransliteration: boolean
  orientation: Orientation
  autoFitFonts: boolean
  textWidth: TextWidth
  textSpacing: TextSpacing
}

export interface ExportOptions {
  platform: 'reel' | 'shorts' | 'youtube'
  quality: '480p' | '720p' | '1080p'
  filename: string
}

export const autoFontSizes: Record<Orientation, { arabic: number; translation: number }> = {
  portrait: { arabic: 30, translation: 14 },
  landscape: { arabic: 34, translation: 15 },
}
