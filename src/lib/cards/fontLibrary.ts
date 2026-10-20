import type { CardTitleStyle } from './types'

export type FontSlot = 'titleLatin' | 'titleBangla' | 'textLatin' | 'textBangla' | 'arabic'

export interface CardFont {
  id: string
  label: string
  family: string
  weight: number
  style: 'normal' | 'italic'
  scale: number
  lineHeight: number
  slots: FontSlot[]
}

export type CardFontChoice = Record<FontSlot, string>

const stack = (variable: string, family: string, fallback: string) => `var(${variable}, '${family}'), ${fallback}`
const font = (id: string, label: string, family: string, slots: FontSlot[], weight = 400, extra: Partial<CardFont> = {}): CardFont => ({ id, label, family, weight, style: 'normal', scale: 1, lineHeight: 1.15, slots, ...extra })

const T = 'titleLatin' as const
const X = 'textLatin' as const
const TB = 'titleBangla' as const
const XB = 'textBangla' as const

export const builtInFonts: CardFont[] = [
  font('cormorant', 'Cormorant Garamond', stack('--font-cormorant', 'Cormorant Garamond', 'Georgia, serif'), [T, X], 600),
  font('playfair', 'Playfair Display', stack('--font-playfair', 'Playfair Display', 'Georgia, serif'), [T, X], 800, { style: 'italic', scale: 0.95 }),
  font('cinzel-decorative', 'Cinzel Decorative', stack('--font-cinzel-decorative', 'Cinzel Decorative', 'serif'), [T], 700, { scale: 0.78 }),
  font('marcellus', 'Marcellus', stack('--font-marcellus', 'Marcellus', 'serif'), [T, X], 400, { scale: 0.9 }),
  font('italiana', 'Italiana', stack('--font-italiana', 'Italiana', 'serif'), [T], 400, { scale: 1.05 }),
  font('dm-serif', 'DM Serif Display', stack('--font-dm-serif', 'DM Serif Display', 'serif'), [T, X], 400, { scale: 0.95 }),
  font('bodoni', 'Bodoni Moda', stack('--font-bodoni', 'Bodoni Moda', 'serif'), [T], 700, { style: 'italic', scale: 0.92 }),
  font('great-vibes', 'Great Vibes', stack('--font-great-vibes', 'Great Vibes', 'cursive'), [T], 400, { scale: 1.4, lineHeight: 1.05 }),
  font('pinyon', 'Pinyon Script', stack('--font-pinyon', 'Pinyon Script', 'cursive'), [T], 400, { scale: 1.2, lineHeight: 1.1 }),
  font('allura', 'Allura', stack('--font-allura', 'Allura', 'cursive'), [T], 400, { scale: 1.45, lineHeight: 1.05 }),
  font('eb-garamond', 'EB Garamond', stack('--font-display', 'EB Garamond', 'Georgia, serif'), [X], 500),
  font('lora', 'Lora', stack('--font-lora', 'Lora', 'Georgia, serif'), [X], 500, { scale: 0.92 }),
  font('inter', 'Inter', stack('--font-inter', 'Inter', 'system-ui, sans-serif'), [X], 500, { scale: 0.9 }),
  font('galada', 'Galada (calligraphy)', stack('--font-galada', 'Galada', 'serif'), [TB], 400, { scale: 1.08, lineHeight: 1.3 }),
  font('atma', 'Atma', stack('--font-atma', 'Atma', 'sans-serif'), [TB], 700, { scale: 0.92, lineHeight: 1.3 }),
  font('mina', 'Mina', stack('--font-mina', 'Mina', 'sans-serif'), [TB, XB], 700, { scale: 0.9, lineHeight: 1.35 }),
  font('baloo-da', 'Baloo Da 2', stack('--font-baloo-da', 'Baloo Da 2', 'sans-serif'), [TB, XB], 700, { scale: 0.9, lineHeight: 1.35 }),
  font('tiro-bangla', 'Tiro Bangla', stack('--font-tiro-bangla', 'Tiro Bangla', 'serif'), [TB, XB], 400, { scale: 0.9, lineHeight: 1.4 }),
  font('noto-serif-bengali', 'Noto Serif Bengali', stack('--font-noto-serif-bengali', 'Noto Serif Bengali', 'serif'), [TB, XB], 600, { scale: 0.86, lineHeight: 1.4 }),
  font('anek-bangla', 'Anek Bangla', stack('--font-anek-bangla', 'Anek Bangla', 'sans-serif'), [TB, XB], 600, { scale: 0.9, lineHeight: 1.35 }),
  font('hind-siliguri', 'Hind Siliguri', stack('--font-hind-siliguri', 'Hind Siliguri', 'sans-serif'), [TB, XB], 600, { scale: 0.88, lineHeight: 1.4 }),
  font('noto-sans-bengali', 'Noto Sans Bengali', stack('--font-noto-sans-bengali', 'Noto Sans Bengali', 'sans-serif'), [XB], 500, { scale: 0.88, lineHeight: 1.45 }),
  font('amiri-quran', 'Amiri Quran', stack('--font-amiri-quran', 'Amiri Quran', 'serif'), ['arabic']),
  font('amiri', 'Amiri', stack('--font-amiri', 'Amiri', 'serif'), ['arabic']),
  font('scheherazade', 'Scheherazade New', stack('--font-scheherazade', 'Scheherazade New', 'serif'), ['arabic']),
  font('aref-ruqaa', 'Aref Ruqaa (calligraphy)', stack('--font-aref-ruqaa', 'Aref Ruqaa', 'serif'), ['arabic']),
  font('reem-kufi', 'Reem Kufi', stack('--font-reem-kufi', 'Reem Kufi', 'sans-serif'), ['arabic']),
  font('markazi', 'Markazi Text', stack('--font-markazi-text', 'Markazi Text', 'serif'), ['arabic']),
  font('noto-naskh', 'Noto Naskh Arabic', stack('--font-noto-naskh-arabic', 'Noto Naskh Arabic', 'serif'), ['arabic']),
]

export const defaultFonts: CardFontChoice = { titleLatin: 'cormorant', titleBangla: 'noto-serif-bengali', textLatin: 'cormorant', textBangla: 'noto-serif-bengali', arabic: 'amiri-quran' }

export const fontsForStyle: Record<CardTitleStyle, Partial<CardFontChoice>> = {
  serif: { titleLatin: 'cormorant', titleBangla: 'noto-serif-bengali' },
  script: { titleLatin: 'great-vibes', titleBangla: 'galada' },
  display: { titleLatin: 'playfair', titleBangla: 'atma' },
}

export const fontsForSlot = (slot: FontSlot, custom: CardFont[] = []) => [...builtInFonts, ...custom].filter((f) => f.slots.includes(slot))

export function findFont(id: string, slot: FontSlot, custom: CardFont[] = []): CardFont {
  return [...custom, ...builtInFonts].find((f) => f.id === id && f.slots.includes(slot)) ?? builtInFonts.find((f) => f.id === defaultFonts[slot])!
}
