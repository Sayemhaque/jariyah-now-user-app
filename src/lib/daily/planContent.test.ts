import { describe, it, expect } from 'vitest'
import { azkarCollection } from '@/lib/collections/azkar'
import { findHadithBook } from '@/lib/hadith/hadithApi'
import { presetCollections } from '@/lib/collections'
import { presetParts } from '@/lib/collections/presetParts'
import type { ContentMode } from '@/lib/collections/types'
import { isReelMode, modeTurn, pickContentMode, pickDua, pickFrom, scheduledPost, pickHadithSource, pickPreset, pickTextItem } from './planContent'
import { dailyConfig } from './dailyConfig'

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

describe('daily schedule', () => {
  const slotAt = (day: number, time: string) => new Date(Date.UTC(2026, 9, 21 + day, Number(time.slice(0, 2)) - 6, Number(time.slice(3)) + 5))
  const plan = (day: number) => dailyConfig.postTimes.map((t) => scheduledPost(slotAt(day, t), dailyConfig.postTimes))

  it('posts three reels, one of them a Quranic dua, and three image posts a day, with a reel every night', () => {
    const days = Array.from({ length: 14 }, (_, day) => plan(day).map((p) => p.mode))
    for (const modes of days) {
      expect(modes.filter(isReelMode)).toHaveLength(3)
      expect(modes.filter((m) => m === 'duaReel')).toHaveLength(1)
      expect(modes.filter((m) => !isReelMode(m))).toHaveLength(3)
      expect(modes.slice(-2)).toEqual(['duaReel', 'quran'])
    }
    expect(new Set(days.map((m) => m.indexOf('quran'))).size).toBeGreaterThan(2)
    expect(new Set(days.map((m) => m.join()))).not.toHaveProperty('size', 1)
    expect(dailyConfig.maxDurationSec).toBe(60)
  })

  it('turns Friday into Jumuah posts in Bangla: Al-Kahf, its virtue, durood and the hour of acceptance', () => {
    const friday = plan(2).map((p) => p.mode)
    expect(new Date(Date.UTC(2026, 9, 23)).getUTCDay()).toBe(5)
    expect(friday).toEqual(['kahf', 'jumuahVirtue', 'durood', 'duaHour', 'duaReel', 'quran'])
    expect(plan(1).map((p) => p.mode)).not.toContain('durood')
  })

  it('cycles through every Quranic dua before repeating one', () => {
    const ids = Array.from({ length: presetCollections.duas.length }, (_, t) => pickDua(t).id)
    expect(new Set(ids).size).toBe(presetCollections.duas.length)
  })

  it('never repeats a surah within a day', () => {
    const turns = Array.from({ length: 6 }, (_, day) => plan(day).filter((p) => p.mode === 'quran').map((p) => p.turn)).flat()
    expect(new Set(turns).size).toBe(turns.length)
  })
})
