import { describe, it, expect } from 'vitest'
import { cardDesigns, cardLayouts, findCardTemplate, templateAt, templateCount } from './templates'
import { cardThemes } from './themes'
import { resolveDecor, variantSpecs } from './variants'

describe('card templates', () => {
  it('offers 288 layouts: 32 structures in 9 decoration styles', () => {
    expect(cardLayouts).toHaveLength(32)
    expect(cardDesigns).toHaveLength(288)
    expect(new Set(cardDesigns.map((d) => `${d.layout}.${d.variant}`)).size).toBe(288)
    expect(templateCount).toBe(288 * cardThemes.length)
  })

  it('varies structure, decoration and colour from one card to the next', () => {
    const first = Array.from({ length: 12 }, (_, i) => templateAt(i))
    expect(new Set(first.map((t) => t.layout)).size).toBe(12)
    expect(new Set(first.map((t) => t.theme.key)).size).toBe(12)
    const decorations = new Set(Array.from({ length: 288 }, (_, i) => templateAt(i).variant))
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
    expect(resolveDecor('arch', 'lantern')).toEqual({ eyebrow: 'stacked', divider: 'wave', corners: 'lanterns' })
    expect(resolveDecor('arch', 'lantern', 'pill').eyebrow).toBe('pill')
    expect(Object.keys(variantSpecs)).toHaveLength(9)
  })
})
