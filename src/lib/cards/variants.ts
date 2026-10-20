import type { CardLayout, CardVariant, CornerStyle, DividerStyle, EyebrowStyle } from './types'

export interface CardDecor {
  eyebrow: EyebrowStyle
  divider: DividerStyle
  corners: CornerStyle
}

export const variantSpecs: Record<CardVariant, CardDecor & { label: string }> = {
  signature: { label: 'Signature', eyebrow: 'diamonds', divider: 'jewel', corners: 'none' },
  ribbon: { label: 'Ribbon', eyebrow: 'ribbon', divider: 'star', corners: 'none' },
  pill: { label: 'Badge', eyebrow: 'pill', divider: 'dots', corners: 'none' },
  brackets: { label: 'Arabesque', eyebrow: 'brackets', divider: 'line', corners: 'stars' },
  seal: { label: 'Seal', eyebrow: 'seal', divider: 'jewel', corners: 'arabesque' },
  hairline: { label: 'Hairline', eyebrow: 'lines', divider: 'line', corners: 'none' },
  crescent: { label: 'Crescent', eyebrow: 'crescent', divider: 'star', corners: 'crescents' },
  lantern: { label: 'Lantern', eyebrow: 'stacked', divider: 'wave', corners: 'lanterns' },
  dots: { label: 'Starlit', eyebrow: 'dots', divider: 'dots', corners: 'stars' },
}

export const cardVariants = Object.keys(variantSpecs) as CardVariant[]

const busyCorners: CardLayout[] = ['frame', 'botanical', 'night', 'editorial', 'tile', 'quote']

export function resolveDecor(layout: CardLayout, variant: CardVariant, eyebrowOverride?: EyebrowStyle): CardDecor {
  const spec = variantSpecs[variant]
  return {
    eyebrow: eyebrowOverride ?? spec.eyebrow,
    divider: spec.divider,
    corners: busyCorners.includes(layout) ? 'none' : spec.corners,
  }
}

export const eyebrowStyles: { key: EyebrowStyle; label: string }[] = [
  { key: 'diamonds', label: 'Diamonds' },
  { key: 'ribbon', label: 'Ribbon' },
  { key: 'pill', label: 'Badge' },
  { key: 'brackets', label: 'Arabesque' },
  { key: 'seal', label: 'Seal' },
  { key: 'lines', label: 'Hairlines' },
  { key: 'crescent', label: 'Crescent' },
  { key: 'stacked', label: 'Swash' },
  { key: 'dots', label: 'Starlit' },
]
