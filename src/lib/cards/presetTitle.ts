import type { QuranPreset } from '@/lib/collections/types'

export const isBanglaTranslation = (translationKey: string) => translationKey === 'bengali'

export function presetCardTitle(mode: 'masnoon' | 'duas', preset: QuranPreset, surahName: string, bangla: boolean): string {
  if (bangla && preset.titleBn) return preset.titleBn
  return mode === 'duas' ? preset.title : surahName
}
