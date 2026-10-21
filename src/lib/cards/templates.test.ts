import { describe, it, expect } from 'vitest'
import { cardDesigns, cardLayouts, findCardTemplate, templateAt, templateCount } from './templates'
import { cardThemes } from './themes'
import { resolveDecor, variantSpecs } from './variants'

describe('card templates', () => {
  it('offers 810 layouts: 90 structures in 9 decoration styles', () => {
    expect(cardLayouts).toHaveLength(90)
    expect(cardDesigns).toHaveLength(810)
    expect(new Set(cardDesigns.map((d) => `${d.layout}.${d.variant}`)).size).toBe(810)
    expect(templateCount).toBe(810 * cardThemes.length)
  })

  it('names every structure with a lowercase key that survives a template id', () => {
    expect(new Set(cardLayouts.map((l) => l.key)).size).toBe(cardLayouts.length)
    expect(cardLayouts.every((l) => /^[a-z]+$/.test(l.key) && l.label && l.description)).toBe(true)
    expect(findCardTemplate('ribbonframe.seal--sage-mist')).toMatchObject({ layout: 'ribbonframe', variant: 'seal' })
  })

  it('gives every layout its own name', () => {
    expect(new Set(cardLayouts.map((l) => l.label)).size).toBe(cardLayouts.length)
  })

  it('varies structure, decoration and colour from one card to the next', () => {
    const first = Array.from({ length: 12 }, (_, i) => templateAt(i))
    expect(new Set(first.map((t) => t.layout)).size).toBe(12)
    expect(new Set(first.map((t) => t.theme.key)).size).toBe(12)
    const decorations = new Set(Array.from({ length: 810 }, (_, i) => templateAt(i).variant))
    expect(decorations.size).toBe(9)
  })

  it('round-trips a template id', () => {
    const template = templateAt(250)
    expect(findCardTemplate(template.id)).toEqual(template)
    expect(findCardTemplate('arch.ribbon--sage-mist')).toMatchObject({ layout: 'arch', variant: 'ribbon', label: 'মেহরাব খিলান · রিবন · Sage Mist' })
    expect(findCardTemplate('nope')).toBeUndefined()
  })

  it('drops corner ornaments on layouts that already decorate their corners', () => {
    expect(resolveDecor('frame', 'lantern').corners).toBe('none')
    expect(resolveDecor('pearl', 'lantern').corners).toBe('none')
    expect(resolveDecor('shamsa', 'lantern').corners).toBe('lanterns')
    expect(resolveDecor('arch', 'lantern')).toEqual({ eyebrow: 'stacked', divider: 'wave', corners: 'lanterns' })
    expect(resolveDecor('arch', 'lantern', 'pill').eyebrow).toBe('pill')
    expect(Object.keys(variantSpecs)).toHaveLength(9)
  })
})
