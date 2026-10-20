import { estimateTextLines } from './layout'

const growth = 1.7
const shrinkStep = 0.92
const lineHeight = 1.45
const heightShare = 0.85

export function fitTranslationOnlySize(text: string, baseSize: number, maxWidth: number, availableHeight: number): number {
  let size = baseSize * growth
  while (size > baseSize * 0.6 && estimateTextLines(text, size, maxWidth) * size * lineHeight > availableHeight * heightShare) size *= shrinkStep
  return size
}
