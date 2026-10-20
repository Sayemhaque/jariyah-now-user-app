import { describe, it, expect } from 'vitest'
import { azkarCollection } from '@/lib/collections/azkar'
import { findHadithBook } from '@/lib/hadith/hadithApi'
import { presetCollections } from '@/lib/collections'
import { presetParts } from '@/lib/collections/presetParts'
import type { ContentMode } from '@/lib/collections/types'
import { modeTurn, pickContentMode, pickFrom, pickHadithSource, pickPreset, pickTextItem } from './planContent'

const rotation: ContentMode[] = ['quran', 'masnoon', 'hadith', 'duas', 'azkar']

describe('pickContentMode', () => {
  it('walks through the rotation, one type per post', () => {
    const picks = [0, 1, 2, 3, 4, 5].map((s) => pickContentMode(s, rotation))
    expect(picks).toEqual(['quran', 'masnoon', 'hadith', 'duas', 'azkar', 'quran'])
  })

  it('falls back to Quran for an empty rotation', () => {
    expect(pickContentMode(3, [])).toBe('quran')
  })
})

describe('modeTurn', () => {
  it('counts how many times a type has come up before this post', () => {
    expect([1, 6, 11, 16].map((s) => modeTurn(s, rotation, 'masnoon'))).toEqual([0, 1, 2, 3])
  })
})

describe('pickPreset', () => {
  it('shows every masnoon part once before repeating', () => {
    const total = presetCollections.masnoon.reduce((sum, p) => sum + presetParts(p).length, 0)
    const seen = new Set(Array.from({ length: total }, (_, t) => { const pick = pickPreset('masnoon', t); return `${pick.preset.id}:${pick.part.fromAyat}` }))
    expect(seen.size).toBe(total)
  })

  it('returns a range of at most ten ayat inside the preset', () => {
    for (let t = 0; t < 40; t++) {
      const { preset, part } = pickPreset('duas', t)
      expect(part.fromAyat).toBeGreaterThanOrEqual(preset.fromAyat)
      expect(part.toAyat).toBeLessThanOrEqual(preset.toAyat)
      expect(part.toAyat - part.fromAyat).toBeLessThan(10)
    }
  })
})

describe('pickTextItem', () => {
  it('shows every zikr once before repeating', () => {
    const seen = new Set(azkarCollection.map((_, t) => pickTextItem(azkarCollection, t).id))
    expect(seen.size).toBe(azkarCollection.length)
  })
})

describe('pickHadithSource', () => {
  it('rotates collections and always points at a real chapter', () => {
    const picks = Array.from({ length: 30 }, (_, t) => pickHadithSource(t, 0))
    expect(new Set(picks.map((p) => p.book)).size).toBeGreaterThanOrEqual(7)
    picks.forEach((p) => expect(findHadithBook(p.book)!.sections.some((s) => s[0] === p.section)).toBe(true))
  })

  it('tries a different chapter on each retry and stays the same for the same post', () => {
    expect(pickHadithSource(4, 0)).toEqual(pickHadithSource(4, 0))
    expect(pickHadithSource(4, 1)).not.toEqual(pickHadithSource(4, 0))
  })

  it('picks deterministically from a list and handles an empty one', () => {
    expect(pickFrom([1, 2, 3], 5)).toBe(pickFrom([1, 2, 3], 5))
    expect(pickFrom([], 5)).toBeUndefined()
  })
})
