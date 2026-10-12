import type { Surah } from './types'

export function filterSurahs(surahs: Surah[], query: string): Surah[] {
  const trimmed = query.trim()
  const lower = trimmed.toLowerCase()
  if (!lower) return surahs
  return surahs.filter(
    (s) =>
      String(s.number) === lower ||
      s.name.toLowerCase().includes(lower) ||
      s.englishName.toLowerCase().includes(lower) ||
      s.arabicName.includes(trimmed),
  )
}
