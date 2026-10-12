import { getAdvanceAtMs } from '@/lib/advanceTiming'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import { splitWords } from '@/lib/wordTiming'
import { orientationFontBase } from './types'

export const activeScale = 1.2
export const restScale = 0.9
export const wordBoxScale = 1.14
export const arabicLineFactor = activeScale * 1.45

export interface SlideSequence {
  slide: AyatSlide
  index: number
  durationInFrames: number
  from: number
}

export function buildSlideSequences(slides: AyatSlide[], fps: number): SlideSequence[] {
  let from = 0
  return slides.map((slide, index) => {
    const durationInFrames = Math.round((getAdvanceAtMs(slide, slide.audioDurationMs) / 1000) * fps)
    const sequence = { slide, index, durationInFrames, from }
    from += durationInFrames
    return sequence
  })
}

export function computeTextSizes(settings: VideoSettings, width: number, height: number) {
  const base = orientationFontBase[settings.orientation]!
  const minDim = Math.min(width, height)
  return {
    minDim,
    arabic: ((base.ar * settings.arabicFontSize) / base.arRef) * (width / 100),
    translation: ((base.tr * settings.translationFontSize) / base.trRef) * (width / 100),
    transliteration: Math.max(11, minDim * 0.024),
  }
}

export const arabicWidthFactors: Record<string, number> = { cairo: 1.35, kufi: 1.3, naskh: 1.08, scheherazade: 1.05 }

export const isBengaliText = (text: string) => /[ঀ-৿]/.test(text)

const arabicMarks = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g

export const arabicWordWidth = (word: string, fontSize: number) =>
  fontSize * wordBoxScale * (0.21 * word.replace(arabicMarks, '').length + 0.45)

export function arabicLineStarts(words: string[], fontSize: number, maxWidth: number): number[] {
  const starts = [0]
  let used = 0
  words.forEach((word, index) => {
    const wordWidth = arabicWordWidth(word, fontSize)
    if (used > 0 && used + wordWidth > maxWidth) {
      starts.push(index)
      used = 0
    }
    used += wordWidth
  })
  return starts
}

export const estimateArabicLines = (words: string[], fontSize: number, maxWidth: number) =>
  arabicLineStarts(words, fontSize, maxWidth).length

export function estimateTextLines(text: string, fontSize: number, maxWidth: number): number {
  return text ? Math.max(1, Math.ceil((text.length * fontSize * 0.5) / maxWidth)) : 0
}

interface FitInput {
  arabicWidthFactor?: number
  arabicWords: string[]
  translation: string
  arabicSize: number
  translationSize: number
  arabicLineHeight: number
  maxWidth: number
  availableHeight: number
}

export function fitTextScale(input: FitInput): number {
  const height = (scale: number) =>
    estimateArabicLines(input.arabicWords, input.arabicSize * scale * (input.arabicWidthFactor ?? 1), input.maxWidth) * input.arabicSize * scale * input.arabicLineHeight +
    estimateTextLines(input.translation, input.translationSize * scale, input.maxWidth) * input.translationSize * scale * 1.45 +
    input.availableHeight * 0.12
  let scale = 1
  while (scale > 0.45 && height(scale) > input.availableHeight) scale -= 0.05
  return Math.max(0.45, scale)
}
