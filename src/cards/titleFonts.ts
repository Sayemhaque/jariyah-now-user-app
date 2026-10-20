import type React from 'react'
import { isBengaliText } from '@/lib/cards/cardTypography'
import { findFont, fontsForStyle, type CardFont, type FontSlot } from '@/lib/cards/fontLibrary'
import type { CardTheme, CardTitleStyle } from '@/lib/cards/types'
import { arabicRuqaaStack } from '@/remotion/fontStacks'

export const titleSlot = (text: string): FontSlot => (isBengaliText(text) ? 'titleBangla' : 'titleLatin')

export const titleFont = (style: CardTitleStyle, text: string): CardFont => findFont(fontsForStyle[style][titleSlot(text)]!, titleSlot(text))

export const arabicTitleFont = (style: CardTitleStyle, arabic: CardFont) => (style === 'script' ? arabicRuqaaStack : arabic.family)

export const fontCss = (font: CardFont, weight = font.weight): React.CSSProperties => ({ fontFamily: font.family, fontWeight: weight, fontStyle: font.style })

export const textWeight = (font: CardFont) => (font.weight >= 600 ? 500 : font.weight)

export function gradientText(theme: CardTheme): React.CSSProperties {
  const from = theme.light ? theme.arabic : '#fff4d2'
  return { backgroundImage: `linear-gradient(172deg, ${from} 12%, ${theme.accent} 92%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
}
