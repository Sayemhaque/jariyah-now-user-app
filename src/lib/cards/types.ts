export type CardFormat = 'portrait' | 'square' | 'story'
export type CardKind = 'hadith' | 'azkar' | 'dua' | 'masnoon'
export type CardPattern = 'stars' | 'arch' | 'lattice' | 'rays' | 'marble' | 'rosette' | 'waves' | 'none'

export interface CardSize {
  width: number
  height: number
  label: string
}

export const cardSizes: Record<CardFormat, CardSize> = {
  portrait: { width: 1080, height: 1350, label: '৪:৫ ফিড' },
  square: { width: 1080, height: 1080, label: '১:১ বর্গ' },
  story: { width: 1080, height: 1920, label: '৯:১৬ স্টোরি' },
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
  benefit?: { text: string; source: string }
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

export type CardLayout = 'frame' | 'arch' | 'editorial' | 'split' | 'floating' | 'quote' | 'tile' | 'night' | 'botanical' | 'glass' | 'manuscript' | 'minimal'
  | 'medallion' | 'dome' | 'octagon' | 'khatam' | 'scroll' | 'lantern' | 'ogee' | 'zellige' | 'pillars' | 'halo' | 'dawn' | 'dunes' | 'ocean' | 'stamp' | 'paper' | 'angle' | 'capsule' | 'lattice' | 'folio' | 'crescent' | 'sunlit' | 'texture' | 'blinds' | 'monstera' | 'jali' | 'archlight' | 'olive' | 'curtain'
  | PremiumCardLayout

export type PremiumCardLayout = 'shamsa' | 'carpet' | 'cartouche' | 'tezhip' | 'marble' | 'minaret' | 'window' | 'triplearch' | 'horseshoe' | 'iwan' | 'multifoil' | 'rosette' | 'girih' | 'hexagon' | 'compass' | 'eclipse' | 'bookmark' | 'pennant' | 'tablet' | 'letter' | 'gallery' | 'cover' | 'gazette' | 'sidebar' | 'stack' | 'deckle' | 'cropmarks' | 'ribbonframe' | 'spotlight' | 'aurora' | 'dotgrid' | 'ripple' | 'orbit' | 'constellation' | 'mountains' | 'palms' | 'garden' | 'laurel' | 'tulip' | 'rain' | 'bracket' | 'meander' | 'chevron' | 'sunset' | 'moonphase' | 'garland' | 'watercolor' | 'prism' | 'pearl' | 'lace'

export type CardAlign = 'center' | 'left'

export type CardTitleStyle = 'serif' | 'script' | 'display'

export type CardVariant = 'signature' | 'ribbon' | 'pill' | 'brackets' | 'seal' | 'hairline' | 'crescent' | 'lantern' | 'dots'
export type EyebrowStyle = 'diamonds' | 'ribbon' | 'pill' | 'brackets' | 'seal' | 'lines' | 'crescent' | 'stacked' | 'dots'
export type DividerStyle = 'jewel' | 'star' | 'dots' | 'wave' | 'line'
export type CornerStyle = 'none' | 'stars' | 'crescents' | 'lanterns' | 'arabesque'

export interface CardProps {
  content: CardContent
  theme: CardTheme
  format: CardFormat
  layout?: CardLayout
  variant?: CardVariant
  eyebrowStyle?: EyebrowStyle
  titleStyle?: CardTitleStyle
  titleGradient?: boolean
  fonts?: Partial<import('./fontLibrary').CardFontChoice>
  customFonts?: import('./fontLibrary').CardFont[]
  textSizes?: Partial<import('./textSizes').CardTextSizes>
}
