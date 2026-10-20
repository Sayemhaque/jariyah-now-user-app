import { cardThemes } from './themes'
import type { CardLayout, CardTheme, CardTitleStyle, CardVariant } from './types'
import { cardVariants, variantSpecs } from './variants'

export interface CardLayoutInfo {
  key: CardLayout
  label: string
  description: string
}

export const cardLayouts: CardLayoutInfo[] = [
  { key: 'frame', label: 'Classic Frame', description: 'Gold double frame with ornamental corners' },
  { key: 'arch', label: 'Arch Window', description: 'Text set inside a mihrab arch' },
  { key: 'editorial', label: 'Editorial', description: 'Left-aligned magazine layout with a gold rule' },
  { key: 'split', label: 'Split Block', description: 'Rich colour band over a soft page' },
  { key: 'floating', label: 'Floating Card', description: 'Raised card on a patterned ground' },
  { key: 'quote', label: 'Big Quote', description: 'Oversized quote mark and bold type' },
  { key: 'tile', label: 'Tile Border', description: 'Islamic star-tile border' },
  { key: 'night', label: 'Night Sky', description: 'Crescent, stars and a masjid skyline' },
  { key: 'botanical', label: 'Botanical', description: 'Olive vines and a soft rounded frame' },
  { key: 'glass', label: 'Frosted Glass', description: 'Glass panel over soft colour light' },
  { key: 'manuscript', label: 'Illuminated', description: 'Manuscript page with a title cartouche' },
  { key: 'minimal', label: 'Minimal', description: 'Quiet, airy and typographic' },
]

export interface CardTemplate {
  id: string
  layout: CardLayout
  variant: CardVariant
  theme: CardTheme
  label: string
}

export interface CardDesign {
  layout: CardLayout
  variant: CardVariant
  label: string
}

export const cardDesigns: CardDesign[] = cardVariants.flatMap((variant) =>
  cardLayouts.map((layout) => ({ layout: layout.key, variant, label: `${layout.label} · ${variantSpecs[variant].label}` })),
)

export const templateCount = cardDesigns.length * cardThemes.length

export function templateAt(index: number): CardTemplate {
  const i = ((index % templateCount) + templateCount) % templateCount
  const design = cardDesigns[(i % cardLayouts.length) + cardLayouts.length * (Math.floor(i / cardLayouts.length) % cardVariants.length)]!
  const theme = cardThemes[(i * 37 + Math.floor(i / cardThemes.length)) % cardThemes.length]!
  return { id: `${design.layout}.${design.variant}--${theme.key}`, layout: design.layout, variant: design.variant, theme, label: `${design.label} · ${theme.label}` }
}

export function findCardTemplate(id: string): CardTemplate | undefined {
  const match = /^([a-z]+)\.([a-z]+)--(.+)$/.exec(id)
  const design = cardDesigns.find((d) => d.layout === match?.[1] && d.variant === match?.[2])
  const theme = cardThemes.find((t) => t.key === match?.[3])
  return design && theme ? { id, layout: design.layout, variant: design.variant, theme, label: `${design.label} · ${theme.label}` } : undefined
}

const titleStyles: CardTitleStyle[] = ['serif', 'script', 'display']

export const titleStyleFor = (index: number): { titleStyle: CardTitleStyle; titleGradient: boolean } => ({
  titleStyle: titleStyles[index % titleStyles.length]!,
  titleGradient: index % 4 === 1,
})
