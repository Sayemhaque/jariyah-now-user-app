export type CardFormat = 'portrait' | 'square' | 'story'
export type CardKind = 'hadith' | 'azkar' | 'dua' | 'masnoon'
export type CardPattern = 'stars' | 'arch' | 'lattice' | 'rays' | 'marble' | 'rosette' | 'waves' | 'none'

export interface CardSize {
  width: number
  height: number
  label: string
}

export const cardSizes: Record<CardFormat, CardSize> = {
  portrait: { width: 1080, height: 1350, label: '4:5 Feed' },
  square: { width: 1080, height: 1080, label: '1:1 Square' },
  story: { width: 1080, height: 1920, label: '9:16 Story' },
}

export interface CardLine {
  arabic?: string
  translation: string
  ayah?: number
}

export interface CardContent {
  kind: CardKind
  eyebrow: string
  title: string
  arabicTitle?: string
  lines: CardLine[]
  reference: string
  note?: string
  slide?: { index: number; count: number }
}

export interface CardTheme {
  key: string
  label: string
  light: boolean
  background: string
  glow: string
  ink: string
  arabic: string
  muted: string
  accent: string
  pattern: CardPattern
  patternOpacity: number
  grain: number
}

export interface CardProps {
  content: CardContent
  theme: CardTheme
  format: CardFormat
}
