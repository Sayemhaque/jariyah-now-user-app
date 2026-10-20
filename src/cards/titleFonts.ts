import type React from 'react'
import { isBengaliText } from '@/lib/cards/cardTypography'
import type { CardTheme, CardTitleStyle } from '@/lib/cards/types'
import { arabicRuqaaStack, banglaDisplayStack, banglaScriptStack, bengaliFontStacks, cardDisplayStack, cardLuxeStack, cardScriptStack, headerArabicStack } from '@/remotion/fontStacks'

export interface TitleFont {
  fontFamily: string
  fontWeight: number
  fontStyle: 'normal' | 'italic'
  scale: number
  lineHeight: number
}

const latinFonts: Record<CardTitleStyle, TitleFont> = {
  serif: { fontFamily: cardDisplayStack, fontWeight: 600, fontStyle: 'normal', scale: 1, lineHeight: 1.1 },
  script: { fontFamily: cardScriptStack, fontWeight: 400, fontStyle: 'normal', scale: 1.4, lineHeight: 1.05 },
  display: { fontFamily: cardLuxeStack, fontWeight: 800, fontStyle: 'italic', scale: 0.95, lineHeight: 1.1 },
}

const banglaFonts: Record<CardTitleStyle, TitleFont> = {
  serif: { fontFamily: bengaliFontStacks.serif!, fontWeight: 600, fontStyle: 'normal', scale: 0.86, lineHeight: 1.35 },
  script: { fontFamily: banglaScriptStack, fontWeight: 400, fontStyle: 'normal', scale: 1.08, lineHeight: 1.3 },
  display: { fontFamily: banglaDisplayStack, fontWeight: 700, fontStyle: 'normal', scale: 0.92, lineHeight: 1.3 },
}

export const titleFont = (style: CardTitleStyle, text: string): TitleFont => (isBengaliText(text) ? banglaFonts : latinFonts)[style]

export const arabicTitleFont = (style: CardTitleStyle) => (style === 'script' ? arabicRuqaaStack : headerArabicStack)

export function gradientText(theme: CardTheme): React.CSSProperties {
  const from = theme.light ? theme.arabic : '#fff4d2'
  return { backgroundImage: `linear-gradient(172deg, ${from} 12%, ${theme.accent} 92%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
}
