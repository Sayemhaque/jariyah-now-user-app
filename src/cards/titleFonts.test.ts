import { describe, it, expect } from 'vitest'
import { arabicTitleFont, gradientText, titleFont } from './titleFonts'
import { findCardTheme } from '@/lib/cards/themes'

describe('titleFont', () => {
  it('uses calligraphic script fonts for both Bangla and English titles', () => {
    expect(titleFont('script', 'Good Manners').fontFamily).toContain('Great Vibes')
    expect(titleFont('script', 'সহীহ বুখারী').fontFamily).toContain('Galada')
    expect(arabicTitleFont('script')).toContain('Aref Ruqaa')
  })

  it('uses bold display fonts and the elegant serif by default', () => {
    expect(titleFont('display', 'Hadith').fontFamily).toContain('Playfair Display')
    expect(titleFont('display', 'হাদিস').fontFamily).toContain('Atma')
    expect(titleFont('serif', 'Hadith').fontFamily).toContain('Cormorant')
  })

  it('builds a text gradient from the theme colours', () => {
    const style = gradientText(findCardTheme('pearl-white'))
    expect(style.color).toBe('transparent')
    expect(String(style.backgroundImage)).toContain(findCardTheme('pearl-white').accent)
  })
})
