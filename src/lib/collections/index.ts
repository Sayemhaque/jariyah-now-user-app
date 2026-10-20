import { azkarCollection } from './azkar'
import { masnoonSurahs } from './masnoonSurahs'
import { quranicDuas } from './quranicDuas'
import type { ContentMode, PresetMode, QuranPreset, TextItem, TextMode } from './types'

export const presetCollections: Record<PresetMode, QuranPreset[]> = { masnoon: masnoonSurahs, duas: quranicDuas }
export const textCollections: Record<TextMode, TextItem[]> = { azkar: azkarCollection }

export const contentModeLabels: Record<ContentMode, string> = {
  quran: 'Quran',
  masnoon: 'Masnoon Surahs',
  duas: 'Quranic Duas',
  hadith: 'Hadith',
  azkar: 'Azkar',
}

export const findPreset = (mode: PresetMode, id: string) => presetCollections[mode].find((p) => p.id === id)
export const findTextItem = (mode: TextMode, id: string) => textCollections[mode].find((t) => t.id === id)

const presetHeadlinePrefix: Record<PresetMode, string> = { masnoon: 'Masnoon Surah', duas: 'Quranic Dua' }

export function presetHeadline(mode: ContentMode, presetId: string): string | undefined {
  if (mode !== 'masnoon' && mode !== 'duas') return undefined
  const preset = findPreset(mode, presetId)
  return preset ? `${presetHeadlinePrefix[mode]}: ${preset.title}` : undefined
}
