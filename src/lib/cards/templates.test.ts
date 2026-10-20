import { describe, it, expect } from 'vitest'
import { cardLayouts, cardTemplates, findCardTemplate, interleavedTemplates } from './templates'
import { cardThemes } from './themes'

describe('card templates', () => {
  it('pairs every layout with every colour theme', () => {
    expect(cardLayouts).toHaveLength(12)
    expect(cardTemplates).toHaveLength(cardLayouts.length * cardThemes.length)
    expect(new Set(cardTemplates.map((t) => t.id)).size).toBe(cardTemplates.length)
    cardLayouts.forEach((layout) => {
      const themes = new Set(cardTemplates.filter((t) => t.layout === layout.key).map((t) => t.theme.key))
      expect(themes.size).toBe(cardThemes.length)
    })
  })

  it('varies both layout and colours from one gallery card to the next', () => {
    const first = interleavedTemplates.slice(0, 12)
    expect(new Set(first.map((t) => t.layout)).size).toBe(12)
    expect(new Set(first.map((t) => t.theme.key)).size).toBeGreaterThan(6)
    expect(new Set(interleavedTemplates.map((t) => t.id)).size).toBe(cardTemplates.length)
  })

  it('finds a template by id', () => {
    expect(findCardTemplate('arch--sage-mist')).toMatchObject({ layout: 'arch', label: 'Arch Window · Sage Mist' })
  })
})
