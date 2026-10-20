import { describe, it, expect } from 'vitest'
import { alternatingCardThemes, cardThemes, darkCardThemes, lightCardThemes } from './themes'

const hexColors = (css: string) => [...css.matchAll(/#([0-9a-f]{6})/gi)].map((m) => [0, 2, 4].map((i) => parseInt(m[1]!.slice(i, i + 2), 16)))

function parseColor(css: string, over: number[]): number[] {
  const rgba = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/.exec(css)
  if (!rgba) return hexColors(css)[0]!
  const alpha = Number(rgba[4])
  return [1, 2, 3].map((i, c) => Number(rgba[i]) * alpha + over[c]! * (1 - alpha))
}

const luminance = (rgb: number[]) => {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

describe('card themes', () => {
  it('offer plenty of light designs as well as dark ones', () => {
    expect(cardThemes.length).toBeGreaterThanOrEqual(18)
    expect(lightCardThemes.length).toBeGreaterThanOrEqual(10)
    expect(darkCardThemes.length).toBeGreaterThanOrEqual(8)
    expect(new Set(cardThemes.map((t) => t.key)).size).toBe(cardThemes.length)
  })

  it('match every text colour to its background with readable contrast on every gradient stop', () => {
    cardThemes.forEach((theme) => {
      hexColors(theme.background).forEach((stop) => {
        expect(contrast(parseColor(theme.ink, stop), stop), `${theme.key} ink`).toBeGreaterThanOrEqual(7)
        expect(contrast(parseColor(theme.arabic, stop), stop), `${theme.key} arabic`).toBeGreaterThanOrEqual(4.5)
        expect(contrast(parseColor(theme.muted, stop), stop), `${theme.key} muted`).toBeGreaterThanOrEqual(4.5)
        expect(contrast(parseColor(theme.accent, stop), stop), `${theme.key} accent`).toBeGreaterThanOrEqual(3)
      })
    })
  })

  it('flags light backgrounds as light so the logo turns dark on them', () => {
    cardThemes.forEach((theme) => {
      const average = luminance(hexColors(theme.background)[1]!)
      expect(theme.light, theme.key).toBe(average > 0.4)
    })
  })

  it('alternate light and dark in the gallery', () => {
    expect(alternatingCardThemes[0]!.light).toBe(true)
    expect(alternatingCardThemes[1]!.light).toBe(false)
    expect(new Set(alternatingCardThemes.map((t) => t.key)).size).toBe(cardThemes.length)
  })
})
