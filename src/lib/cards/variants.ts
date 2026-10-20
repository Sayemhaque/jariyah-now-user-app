import type { CardLayout, CardVariant, CornerStyle, DividerStyle, EyebrowStyle } from './types'

export interface CardDecor {
  eyebrow: EyebrowStyle
  divider: DividerStyle
  corners: CornerStyle
}

export const variantSpecs: Record<CardVariant, CardDecor & { label: string }> = {
  signature: { label: 'সিগনেচার', eyebrow: 'diamonds', divider: 'jewel', corners: 'none' },
  ribbon: { label: 'রিবন', eyebrow: 'ribbon', divider: 'star', corners: 'none' },
  pill: { label: 'ব্যাজ', eyebrow: 'pill', divider: 'dots', corners: 'none' },
  brackets: { label: 'আরাবেস্ক', eyebrow: 'brackets', divider: 'line', corners: 'stars' },
  seal: { label: 'সিল', eyebrow: 'seal', divider: 'jewel', corners: 'arabesque' },
  hairline: { label: 'সূক্ষ্ম রেখা', eyebrow: 'lines', divider: 'line', corners: 'none' },
  crescent: { label: 'চাঁদ', eyebrow: 'crescent', divider: 'star', corners: 'crescents' },
  lantern: { label: 'লণ্ঠন', eyebrow: 'stacked', divider: 'wave', corners: 'lanterns' },
  dots: { label: 'তারকা', eyebrow: 'dots', divider: 'dots', corners: 'stars' },
}

export const cardVariants = Object.keys(variantSpecs) as CardVariant[]

const busyCorners: CardLayout[] = [
  'frame', 'botanical', 'night', 'editorial', 'tile', 'quote',
  'carpet', 'tezhip', 'marble', 'iwan', 'multifoil', 'rosette', 'bookmark', 'letter', 'gallery', 'cover', 'gazette', 'sidebar', 'stack', 'deckle',
  'cropmarks', 'ribbonframe', 'dotgrid', 'constellation', 'tulip', 'meander', 'chevron', 'moonphase', 'garland', 'watercolor', 'prism', 'pearl', 'lace', 'garden',
]

export function resolveDecor(layout: CardLayout, variant: CardVariant, eyebrowOverride?: EyebrowStyle): CardDecor {
  const spec = variantSpecs[variant]
  return {
    eyebrow: eyebrowOverride ?? spec.eyebrow,
    divider: spec.divider,
    corners: busyCorners.includes(layout) ? 'none' : spec.corners,
  }
}

export const eyebrowStyles: { key: EyebrowStyle; label: string }[] = [
  { key: 'diamonds', label: 'ডায়মন্ড' },
  { key: 'ribbon', label: 'রিবন' },
  { key: 'pill', label: 'ব্যাজ' },
  { key: 'brackets', label: 'আরাবেস্ক' },
  { key: 'seal', label: 'সিল' },
  { key: 'lines', label: 'রেখা' },
  { key: 'crescent', label: 'চাঁদ' },
  { key: 'stacked', label: 'ঢেউ' },
  { key: 'dots', label: 'তারকা' },
]
