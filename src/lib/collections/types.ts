export type ContentMode = 'quran' | 'masnoon' | 'duas' | 'hadith' | 'azkar'
export type PresetMode = 'masnoon' | 'duas'
export type TextMode = 'azkar'
export type TextLanguage = 'english' | 'bangla'

export interface QuranPreset {
  id: string
  title: string
  note: string
  surah: number
  fromAyat: number
  toAyat: number
}

export interface TextItem {
  id: string
  title: string
  arabic: string
  english: string
  bangla: string
  source: string
}

export const isPresetMode = (mode: ContentMode): mode is PresetMode => mode === 'masnoon' || mode === 'duas'
export const isTextMode = (mode: ContentMode): mode is TextMode => mode === 'azkar'
