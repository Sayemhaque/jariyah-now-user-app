import { cardThemes } from './themes'
import type { CardLayout, CardTheme } from './types'

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
  theme: CardTheme
  label: string
}

export const cardTemplates: CardTemplate[] = cardLayouts.flatMap((layout, l) =>
  cardThemes.map((_, t) => {
    const theme = cardThemes[(t + l * 5) % cardThemes.length]!
    return { id: `${layout.key}--${theme.key}`, layout: layout.key, theme, label: `${layout.label} · ${theme.label}` }
  }),
)

export const interleavedTemplates: CardTemplate[] = cardThemes.flatMap((_, round) => cardLayouts.map((_, l) => cardTemplates[l * cardThemes.length + round]!))

export const findCardTemplate = (id: string) => cardTemplates.find((t) => t.id === id)
