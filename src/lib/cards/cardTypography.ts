import type { CardContent, CardFormat, EyebrowStyle } from './types'
import { defaultTextSizes, type CardTextSizes } from './textSizes'
import { cardSizes } from './types'

export interface CardTypeSizes {
  arabic: number
  translation: number
  title: number
  scale: number
}

export const cardPadding: Record<CardFormat, { top: number; bottom: number; side: number }> = {
  portrait: { top: 104, bottom: 96, side: 128 },
  square: { top: 92, bottom: 84, side: 128 },
  story: { top: 250, bottom: 300, side: 128 },
}

const bengaliPattern = /[ঀ-৿]/
const arabicCharWidth = 0.34
const latinCharWidth = 0.44
const bengaliCharWidth = 0.52
const arabicLineHeight = 1.9
const translationLineHeight = 1.5
const minScale = 0.4
const sectionGap = 36
const lineGap = 44

export const isBengaliText = (text: string) => bengaliPattern.test(text)
export const isParagraphCard = (content: CardContent) => (content.kind === 'dua' || content.kind === 'masnoon') && content.lines.length > 1

export function paragraphLine(content: CardContent): CardContent['lines'][number] {
  return {
    arabic: content.lines.map((l) => `${l.arabic ?? ''} ﴿${l.ayah ?? ''}﴾`).join(' '),
    translation: content.lines.map((l) => `(${l.ayah ?? ''}) ${l.translation}`).join(' '),
  }
}
export const cardTitleSize = (title: string) => (title.length > 30 ? 48 : 58)

function linesFor(text: string, size: number, width: number, charWidth: number): number {
  return text ? Math.max(1, Math.ceil((text.length * size * charWidth) / width)) : 0
}

function benefitHeight(content: CardContent, format: CardFormat, scale = 1): number {
  if (!content.benefit) return 0
  const compact = format === 'square'
  const text = compact ? `${content.benefit.text} — ${content.benefit.source}` : content.benefit.text
  const size = (compact ? 25 : 29) * scale
  return 18 + (compact ? 20 : 40) + linesFor(text, size, 712, isBengaliText(text) ? 0.5 : 0.42) * size * 1.35 + (compact ? 0 : 30)
}

const eyebrowExtra: Partial<Record<EyebrowStyle, number>> = { seal: 54, ribbon: 30, pill: 22, stacked: 26, brackets: 18 }

export function cardHeaderHeight(content: CardContent, titleScale = 1, format: CardFormat = 'portrait', eyebrow: EyebrowStyle = 'diamonds', parts: CardTextSizes = defaultTextSizes): number {
  const compact = format === 'square'
  const size = cardTitleSize(content.title) * titleScale * (compact ? 0.86 : 1) * parts.title
  const gap = compact ? 12 : 18
  return (compact ? 72 : 96) * parts.logo + gap + 30 * parts.eyebrow + (eyebrowExtra[eyebrow] ?? 0) + gap + linesFor(content.title, size, 820, 0.42) * size * 1.1 + (content.arabicTitle ? (compact ? 72 : 98) * parts.arabicTitle + gap : 0) + benefitHeight(content, format, parts.benefit)
}

function footerHeight(content: CardContent): number {
  return 24 + 16 + linesFor(content.reference, 22, 824, 0.9) * 30 + (content.note ? 16 + 36 : 0) + (content.slide ? 16 + 24 : 0)
}

export function availableBodyHeight(content: CardContent, format: CardFormat): number {
  const padding = cardPadding[format]
  return cardSizes[format].height - padding.top - padding.bottom - cardHeaderHeight(content, 1, format) - footerHeight(content) - sectionGap * 2
}

type BaseSizes = Omit<CardTypeSizes, 'scale'>

function baseSizes(content: CardContent): BaseSizes {
  const translationOnly = content.lines.every((l) => !l.arabic)
  if (isParagraphCard(content)) return { arabic: 72, translation: 44, title: 60 }
  return { arabic: 66, translation: translationOnly ? 60 : 38, title: 60 }
}

export function contentHeight(content: CardContent, sizes: BaseSizes, width: number, gap: number): number {
  const quote = content.kind === 'hadith' ? sizes.translation * 1.3 + gap : 0
  const lines = isParagraphCard(content) ? [paragraphLine(content)] : content.lines
  return lines.reduce((total, line, index) => {
    const charWidth = isBengaliText(line.translation) ? bengaliCharWidth : latinCharWidth
    const arabic = line.arabic ? linesFor(line.arabic, sizes.arabic, width, arabicCharWidth) * sizes.arabic * arabicLineHeight + sizes.translation * 0.7 : 0
    const translation = linesFor(line.translation, sizes.translation, width, charWidth) * sizes.translation * translationLineHeight
    return total + arabic + translation + (index ? gap * 2 + 6 : 0)
  }, quote)
}

export function fitCardType(content: CardContent, format: CardFormat): CardTypeSizes {
  const textWidth = cardSizes[format].width - cardPadding[format].side * 2
  const available = availableBodyHeight(content, format)
  const base = baseSizes(content)
  const scaled = (s: number): BaseSizes => ({ arabic: base.arabic * s, translation: base.translation * s, title: base.title })
  let scale = 1
  while (scale > minScale && contentHeight(content, scaled(scale), textWidth, lineGap * scale) > available) scale *= 0.95
  return { ...scaled(scale), scale }
}
