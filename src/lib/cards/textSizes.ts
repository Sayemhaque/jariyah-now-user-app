import type { CardContent } from './types'

export type CardTextPart = 'logo' | 'eyebrow' | 'arabicTitle' | 'title' | 'benefit' | 'arabic' | 'translation' | 'reference' | 'note'

export type CardTextSizes = Record<CardTextPart, number>

export const minTextSize = 50
export const maxTextSize = 200

export const cardTextParts: { part: CardTextPart; label: string; shownFor: (content: CardContent) => boolean }[] = [
  { part: 'logo', label: 'লোগো', shownFor: () => true },
  { part: 'eyebrow', label: 'সেকশনের নাম', shownFor: (c) => Boolean(c.eyebrow) },
  { part: 'arabicTitle', label: 'আরবি শিরোনাম', shownFor: (c) => Boolean(c.arabicTitle) },
  { part: 'title', label: 'শিরোনাম', shownFor: (c) => Boolean(c.title) },
  { part: 'benefit', label: 'ফজিলতের বাক্স', shownFor: (c) => Boolean(c.benefit) },
  { part: 'arabic', label: 'আরবি লেখা', shownFor: (c) => c.lines.some((l) => l.arabic) },
  { part: 'translation', label: 'অনুবাদ / মূল লেখা', shownFor: (c) => c.lines.length > 0 },
  { part: 'reference', label: 'রেফারেন্স', shownFor: (c) => Boolean(c.reference) },
  { part: 'note', label: 'নোট', shownFor: (c) => Boolean(c.note) },
]

export const defaultTextSizes: CardTextSizes = Object.fromEntries(cardTextParts.map(({ part }) => [part, 1])) as CardTextSizes

export const clampTextPercent = (percent: number) => Math.round(Math.min(maxTextSize, Math.max(minTextSize, percent)))

export function resolveTextSizes(sizes: Partial<Record<CardTextPart, number>> = {}): CardTextSizes {
  const resolved = { ...defaultTextSizes }
  for (const { part } of cardTextParts) {
    const value = sizes[part]
    if (typeof value === 'number' && Number.isFinite(value)) resolved[part] = clampTextPercent(value * 100) / 100
  }
  return resolved
}

export const partsForContents = (contents: CardContent[]) => (contents.length ? cardTextParts.filter(({ shownFor }) => contents.some(shownFor)) : cardTextParts)

export const isDefaultTextSizes = (sizes: Partial<Record<CardTextPart, number>>) => cardTextParts.every(({ part }) => (sizes[part] ?? 1) === 1)
