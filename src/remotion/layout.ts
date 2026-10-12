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

export const isBengaliText = (text: string) => /[ঀ-৿]/.test(text)

const arabicMarks = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g

export function estimateArabicLines(words: string[], fontSize: number, maxWidth: number): number {
  let lines = 1
  let used = 0
  for (const word of words) {
    const wordWidth = fontSize * wordBoxScale * (0.34 * word.replace(arabicMarks, '').length + 0.5)
    if (used > 0 && used + wordWidth > maxWidth) {
      lines++
      used = 0
    }
    used += wordWidth
  }
  return lines
}

export function estimateTextLines(text: string, fontSize: number, maxWidth: number): number {
  return text ? Math.max(1, Math.ceil((text.length * fontSize * 0.5) / maxWidth)) : 0
}

interface FitInput {
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
    estimateArabicLines(input.arabicWords, input.arabicSize * scale, input.maxWidth) * input.arabicSize * scale * input.arabicLineHeight +
    estimateTextLines(input.translation, input.translationSize * scale, input.maxWidth) * input.translationSize * scale * 1.45 +
    input.availableHeight * 0.12
  let scale = 1
  while (scale > 0.45 && height(scale) > input.availableHeight) scale -= 0.05
  return Math.max(0.45, scale)
}

export function fittedSizes(
  slide: AyatSlide,
  settings: VideoSettings,
  sizes: ReturnType<typeof computeTextSizes>,
  maxWidth: number,
  availableHeight: number,
) {
  const scale = fitTextScale({
    arabicWords: slide.words?.map((w) => w.text) ?? splitWords(slide.arabicText),
    translation: settings.showTranslation ? slide.translation : '',
    arabicSize: sizes.arabic,
    translationSize: sizes.translation,
    arabicLineHeight: (settings.wordHighlight ?? true) ? arabicLineFactor : 1.5,
    maxWidth,
    availableHeight,
  })
  return { ...sizes, arabic: sizes.arabic * scale, translation: sizes.translation * scale, transliteration: sizes.transliteration * scale }
}
