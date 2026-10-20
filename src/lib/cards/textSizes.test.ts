import { describe, it, expect } from 'vitest'
import type { CardContent } from './types'
import { cardTextParts, clampTextPercent, defaultTextSizes, isDefaultTextSizes, partsForContents, resolveTextSizes } from './textSizes'

const card = (extra: Partial<CardContent> = {}): CardContent => ({ kind: 'azkar', eyebrow: 'Dhikr', title: 'Hawqala', lines: [{ translation: 'There is no power' }], reference: 'Bukhari', ...extra })

describe('card text sizes', () => {
  it('starts every part at 100%', () => {
    expect(Object.values(defaultTextSizes).every((v) => v === 1)).toBe(true)
    expect(Object.keys(defaultTextSizes)).toHaveLength(cardTextParts.length)
    expect(isDefaultTextSizes({})).toBe(true)
    expect(isDefaultTextSizes({ title: 1.2 })).toBe(false)
  })

  it('keeps sizes between 50% and 200%', () => {
    expect(clampTextPercent(20)).toBe(50)
    expect(clampTextPercent(250)).toBe(200)
    expect(clampTextPercent(123.4)).toBe(123)
    expect(resolveTextSizes({ title: 3, arabic: 0.1, reference: 1.25 })).toMatchObject({ title: 2, arabic: 0.5, reference: 1.25, translation: 1 })
    expect(resolveTextSizes({ title: Number.NaN }).title).toBe(1)
  })

  it('only offers the parts a card actually shows', () => {
    const plain = partsForContents([card()]).map((p) => p.part)
    expect(plain).toEqual(['logo', 'eyebrow', 'title', 'translation', 'reference'])
    const rich = partsForContents([card(), card({ arabicTitle: 'لا حول', note: 'x', benefit: { text: 'b', source: 's' }, lines: [{ arabic: 'لا', translation: 't' }] })]).map((p) => p.part)
    expect(rich).toEqual(cardTextParts.map((p) => p.part))
    expect(partsForContents([])).toEqual(cardTextParts)
  })
})

describe('header height with custom sizes', () => {
  it('grows when the title, logo and benefit get bigger', async () => {
    const { cardHeaderHeight } = await import('./cardTypography')
    const content = card({ benefit: { text: 'A short benefit line', source: 'Muslim' } })
    const base = cardHeaderHeight(content)
    expect(cardHeaderHeight(content, 1, 'portrait', 'diamonds', resolveTextSizes({ title: 2 }))).toBeGreaterThan(base)
    expect(cardHeaderHeight(content, 1, 'portrait', 'diamonds', resolveTextSizes({ logo: 1.5 }))).toBe(base + 48)
    expect(cardHeaderHeight(content, 1, 'portrait', 'diamonds', resolveTextSizes({ benefit: 0.5 }))).toBeLessThan(base)
    expect(cardHeaderHeight(content, 1, 'portrait', 'diamonds', defaultTextSizes)).toBe(base)
  })
})
