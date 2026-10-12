import { describe, it, expect } from 'vitest'
import { filterSurahs } from './surahSearch'
import type { Surah } from './types'

const surahs: Surah[] = [
  { number: 1, name: 'Al-Fatihah', englishName: 'The Opening', arabicName: 'الفاتحة', numberOfAyahs: 7, revelationType: 'Meccan' },
  { number: 112, name: 'Al-Ikhlas', englishName: 'Sincerity', arabicName: 'الإخلاص', numberOfAyahs: 4, revelationType: 'Meccan' },
]

describe('filterSurahs', () => {
  it('returns everything for an empty query', () => {
    expect(filterSurahs(surahs, '  ')).toHaveLength(2)
  })

  it('matches by exact number, name, english name and arabic name', () => {
    expect(filterSurahs(surahs, '112').map((s) => s.number)).toEqual([112])
    expect(filterSurahs(surahs, 'fatih').map((s) => s.number)).toEqual([1])
    expect(filterSurahs(surahs, 'SINCERITY').map((s) => s.number)).toEqual([112])
    expect(filterSurahs(surahs, 'الإخلاص').map((s) => s.number)).toEqual([112])
  })

  it('does not match partial numbers', () => {
    expect(filterSurahs(surahs, '11')).toHaveLength(0)
  })
})
