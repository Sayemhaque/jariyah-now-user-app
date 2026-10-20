import type { CardTypeSizes } from '@/lib/cards/cardTypography'
import type { CardContent, CardFormat, CardTheme } from '@/lib/cards/types'

export interface LayoutProps {
  content: CardContent
  theme: CardTheme
  format: CardFormat
  width: number
  height: number
  sizes: CardTypeSizes
  fitKey: string
  onSettled?: () => void
  logoSrc: string
}

export const bodyProps = (p: LayoutProps) => ({ content: p.content, theme: p.theme, sizes: p.sizes, fitKey: p.fitKey, onSettled: p.onSettled })

export const panelFill = (theme: CardTheme) => (theme.light ? 'rgba(255, 255, 255, 0.66)' : 'rgba(255, 255, 255, 0.055)')

export const storyInset = (format: CardFormat, story: number, other: number) => (format === 'story' ? story : other)

export function bandTheme(theme: CardTheme): CardTheme {
  if (theme.light) {
    return { ...theme, light: false, ink: '#fffaf0', arabic: '#fff0cc', muted: 'rgba(255, 250, 240, 0.84)', accent: '#f1d9a0', background: theme.arabic }
  }
  return { ...theme, light: true, ink: '#1b140a', arabic: '#24190a', muted: 'rgba(27, 20, 10, 0.8)', accent: '#3b2a10', background: theme.accent }
}

export const column = (padding: string, gap = 36): React.CSSProperties => ({ position: 'absolute', inset: 0, padding, display: 'flex', flexDirection: 'column', alignItems: 'center', gap })

export const pick = <T,>(format: CardFormat, portrait: T, square: T, story: T): T => (format === 'story' ? story : format === 'square' ? square : portrait)

export const tint = (color: string, alpha: number) => `${color.slice(0, 7)}${Math.round(Math.min(1, Math.max(0, alpha)) * 255).toString(16).padStart(2, '0')}`

export const fullSvg = (width: number, height: number): React.SVGProps<SVGSVGElement> => ({ width, height, style: { position: 'absolute', inset: 0 } })
