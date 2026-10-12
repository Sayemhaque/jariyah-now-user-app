import { describe, expect, it } from 'vitest'
import { defaultVideoSettings } from './defaultSettings'
import { getScene } from './backgroundPresets'
import { paletteFromPixels } from './imagePalette'
import { withAutoColors } from './theme'
import { hexToRgb, hslToHex, rgbToHsl } from './color'

const desert = getScene('desert-dawn')!

describe('withAutoColors', () => {
  it('applies the scene palette when the background changes', () => {
    const next = withAutoColors({ ...defaultVideoSettings, backgroundPreset: 'desert-dawn' }, { backgroundPreset: 'desert-dawn' })
    expect(next.fontColor).toBe(desert.palette.text)
    expect(next.highlightColor).toBe(desert.palette.accent)
    expect(next.translationColor).toBe(desert.palette.translation)
  })

  it('leaves colors alone when auto colors are off or the background did not change', () => {
    const manual = { ...defaultVideoSettings, autoColors: false, backgroundPreset: 'desert-dawn', fontColor: '#123456' }
    expect(withAutoColors(manual, { backgroundPreset: 'desert-dawn' }).fontColor).toBe('#123456')
    const untouched = { ...defaultVideoSettings, fontColor: '#123456' }
    expect(withAutoColors(untouched, { fontColor: '#123456' }).fontColor).toBe('#123456')
  })

  it('uses the extracted palette for a custom image', () => {
    const palette = { ...desert.palette, accent: '#00ff00' }
    const next = withAutoColors(
      { ...defaultVideoSettings, backgroundPreset: 'custom', backgroundImage: 'data:x', backgroundPalette: palette },
      { backgroundPreset: 'custom' },
    )
    expect(next.highlightColor).toBe('#00ff00')
  })
})

describe('paletteFromPixels', () => {
  const fill = (rgb: [number, number, number], n = 100) => Array.from({ length: n }, () => [...rgb, 255]).flat()

  it('picks the vivid color of the image as the accent', () => {
    const palette = paletteFromPixels([...fill([20, 30, 60], 300), ...fill([40, 160, 70], 100)])
    const { h } = rgbToHsl(...hexToRgb(palette.accent))
    expect(h).toBeGreaterThan(100)
    expect(h).toBeLessThan(160)
  })

  it('keeps text light and the base dark', () => {
    const palette = paletteFromPixels(fill([200, 80, 40]))
    expect(rgbToHsl(...hexToRgb(palette.text)).l).toBeGreaterThan(0.85)
    expect(rgbToHsl(...hexToRgb(palette.base[2])).l).toBeLessThan(0.1)
  })

  it('falls back to gold for a grayscale image', () => {
    const { h } = rgbToHsl(...hexToRgb(paletteFromPixels(fill([128, 128, 128])).accent))
    expect(h).toBeGreaterThan(30)
    expect(h).toBeLessThan(55)
  })
})

describe('color conversion', () => {
  it('round-trips hex through hsl', () => {
    for (const hex of ['#e9c77b', '#0a1020', '#8ff0d6']) expect(hslToHex(rgbToHsl(...hexToRgb(hex)))).toBe(hex)
  })
})
