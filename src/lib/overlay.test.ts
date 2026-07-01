import { describe, it, expect } from 'vitest'
import { overlayCssBackground, hexToRgb, rgba } from './overlay'
import type { VideoSettings } from './types'

// Build a minimal settings object — only the overlay-related fields matter
// for these tests, so we cast to satisfy the full type.
function overlaySettings(
  patch: Partial<Pick<VideoSettings, 'overlayStyle' | 'overlayColor' | 'overlayOpacity'>>,
): VideoSettings {
  return {
    backgroundImage: '',
    backgroundPreset: '',
    overlayStyle: 'solid',
    overlayColor: '#000000',
    overlayOpacity: 50,
    fontColor: '#ffffff',
    highlightColor: '#F5A623',
    arabicFontSize: 40,
    translationFontSize: 16,
    fontStyle: 'uthmani',
    showTranslation: true,
    showTransliteration: false,
    orientation: 'portrait',
    autoFitFonts: true,
    ...patch,
  } as VideoSettings
}

describe('hexToRgb', () => {
  it('parses a 6-digit hex', () => {
    expect(hexToRgb('#ff8800')).toEqual({ r: 255, g: 136, b: 0 })
  })

  it('parses uppercase hex', () => {
    expect(hexToRgb('#FF8800')).toEqual({ r: 255, g: 136, b: 0 })
  })

  it('handles black and white', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('returns zeros for an invalid hex', () => {
    expect(hexToRgb('not-a-hex')).toEqual({ r: 0, g: 0, b: 0 })
  })
})

describe('rgba', () => {
  it('formats a color + alpha as rgba()', () => {
    expect(rgba('#ff8800', 0.5)).toBe('rgba(255, 136, 0, 0.5)')
  })

  it('handles alpha = 0', () => {
    expect(rgba('#000000', 0)).toBe('rgba(0, 0, 0, 0)')
  })

  it('handles alpha = 1', () => {
    expect(rgba('#ffffff', 1)).toBe('rgba(255, 255, 255, 1)')
  })
})

describe('overlayCssBackground', () => {
  it('returns null for the "none" style', () => {
    expect(
      overlayCssBackground(overlaySettings({ overlayStyle: 'none' })),
    ).toBeNull()
  })

  it('returns null when opacity is 0', () => {
    expect(
      overlayCssBackground(
        overlaySettings({ overlayStyle: 'solid', overlayOpacity: 0 }),
      ),
    ).toBeNull()
  })

  it('returns a solid rgba color for the "solid" style', () => {
    const bg = overlayCssBackground(
      overlaySettings({
        overlayStyle: 'solid',
        overlayColor: '#000000',
        overlayOpacity: 50,
      }),
    )
    expect(bg).toBe('rgba(0, 0, 0, 0.5)')
  })

  it('returns a linear-gradient for "bottom-gradient"', () => {
    const bg = overlayCssBackground(
      overlaySettings({ overlayStyle: 'bottom-gradient' }),
    )
    expect(bg).toMatch(/^linear-gradient/)
    expect(bg).toContain('rgba(0, 0, 0, 0)')
    expect(bg).toContain('rgba(0, 0, 0, 0.5)') // opacity = 50/100
  })

  it('returns a radial-gradient for "vignette"', () => {
    const bg = overlayCssBackground(
      overlaySettings({ overlayStyle: 'vignette' }),
    )
    expect(bg).toMatch(/^radial-gradient/)
  })

  it('returns a radial-gradient for "center-focus"', () => {
    const bg = overlayCssBackground(
      overlaySettings({ overlayStyle: 'center-focus' }),
    )
    expect(bg).toMatch(/^radial-gradient/)
  })

  it('scales the alpha by opacity/100', () => {
    const bg80 = overlayCssBackground(
      overlaySettings({
        overlayStyle: 'solid',
        overlayColor: '#000000',
        overlayOpacity: 80,
      }),
    )
    expect(bg80).toBe('rgba(0, 0, 0, 0.8)')
  })
})
