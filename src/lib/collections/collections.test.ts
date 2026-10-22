import { describe, it, expect } from 'vitest'
import { surahsFallback } from '@/lib/surahs-fallback'
import { spokenLetters } from '@/lib/wordTiming'
import { presetCollections, textCollections } from './index'
import { presetParts } from './presetParts'

describe('preset collections', () => {
  const presets = [...presetCollections.masnoon, ...presetCollections.duas]

  it('point at real ayat of real surahs', () => {
    presets.forEach((p) => {
      const surah = surahsFallback.find((s) => s.number === p.surah)
      expect(surah, p.id).toBeDefined()
      expect(p.fromAyat).toBeGreaterThanOrEqual(1)
      expect(p.toAyat).toBeGreaterThanOrEqual(p.fromAyat)
      expect(p.toAyat, p.id).toBeLessThanOrEqual(surah!.numberOfAyahs)
    })
  })

  it('give every Quranic dua a Bangla title for its reel heading', () => {
    presetCollections.duas.forEach((d) => expect(d.titleBn, d.id).toBeTruthy())
  })

  it('have unique ids', () => {
    Object.values(presetCollections).forEach((list) => expect(new Set(list.map((p) => p.id)).size).toBe(list.length))
  })
})

describe('text collections', () => {
  const items = textCollections.azkar

  it('have Arabic, English, Bangla and a source for every item', () => {
    items.forEach((item) => {
      expect(spokenLetters(item.arabic), item.id).toBeGreaterThan(5)
      expect(item.english.length, item.id).toBeGreaterThan(10)
      expect(item.bangla, item.id).toMatch(/[ঀ-৿]/)
      expect(item.source.length, item.id).toBeGreaterThan(5)
      expect(item.id).toMatch(/^[a-z0-9-]+$/)
    })
  })

  it('have unique ids', () => {
    Object.values(textCollections).forEach((list) => expect(new Set(list.map((t) => t.id)).size).toBe(list.length))
  })
})

describe('presetParts', () => {
  const preset = (fromAyat: number, toAyat: number) => ({ id: 'x', title: 'x', note: '', surah: 1, fromAyat, toAyat })

  it('keeps a short preset in one part', () => {
    expect(presetParts(preset(285, 286))).toEqual([{ label: 'Ayat 285–286', fromAyat: 285, toAyat: 286 }])
    expect(presetParts(preset(255, 255))[0]!.label).toBe('Ayat 255')
  })

  it('splits a long surah into even reel-sized parts that cover every ayah', () => {
    const parts = presetParts(preset(1, 30), 10)
    expect(parts.map((p) => [p.fromAyat, p.toAyat])).toEqual([[1, 10], [11, 20], [21, 30]])
    expect(parts[0]!.label).toBe('Part 1 · Ayat 1–10')
    const yasin = presetParts(preset(1, 83), 10)
    expect(yasin).toHaveLength(9)
    expect(yasin[yasin.length - 1]!.toAyat).toBe(83)
    yasin.forEach((p, i) => i && expect(p.fromAyat).toBe(yasin[i - 1]!.toAyat + 1))
    yasin.forEach((p) => expect(p.toAyat - p.fromAyat + 1).toBeLessThanOrEqual(10))
  })
})
