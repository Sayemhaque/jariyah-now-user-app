import { createContext, useContext } from 'react'
import type { CardFormat, CardTitleStyle } from '@/lib/cards/types'
import type { CardDecor } from '@/lib/cards/variants'
import { builtInFonts, defaultFonts, type CardFont, type FontSlot } from '@/lib/cards/fontLibrary'

export interface CardStyle {
  titleStyle: CardTitleStyle
  titleGradient: boolean
  format: CardFormat
  decor: CardDecor
  fonts: Record<FontSlot, CardFont>
}

const fallbackFonts = Object.fromEntries(Object.entries(defaultFonts).map(([slot, id]) => [slot, builtInFonts.find((f) => f.id === id)!])) as Record<FontSlot, CardFont>

export const CardStyleContext = createContext<CardStyle>({ titleStyle: 'serif', titleGradient: false, format: 'portrait', decor: { eyebrow: 'diamonds', divider: 'jewel', corners: 'none' }, fonts: fallbackFonts })

export const useCardStyle = () => useContext(CardStyleContext)
