import { describe, it, expect } from 'vitest'
import { arabicTitleFont, gradientText, titleFont } from './titleFonts'
import { findCardTheme } from '@/lib/cards/themes'

describe('titleFont', () => {
  it('uses calligraphic script fonts for both Bangla and English titles', () => {
    expect(titleFont('script', 'Good Manners').family).toContain('Great Vibes')
    expect(titleFont('script', 'সহীহ বুখারী').family).toContain('Galada')
    expect(arabicTitleFont('script', titleFont('serif', 'x'))).toContain('Aref Ruqaa')
  })

  it('uses bold display fonts and the elegant serif by default', () => {
    expect(titleFont('display', 'Hadith').family).toContain('Playfair Display')
    expect(titleFont('display', 'হাদিস').family).toContain('Atma')
    expect(titleFont('serif', 'Hadith').family).toContain('Cormorant')
  })

  it('builds a text gradient from the theme colours', () => {
    const style = gradientText(findCardTheme('pearl-white'))
    expect(style.color).toBe('transparent')
    expect(String(style.backgroundImage)).toContain(findCardTheme('pearl-white').accent)
  })
})
