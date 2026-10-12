import React from 'react'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import { arabicLineFactor, arabicWidthFactors, estimateTextLines, type computeTextSizes } from './layout'
import { linesPerPage, planPages } from './pages'
import { pageState, pageSwitchTimes } from './pageTiming'
import { useTimedWords } from './useTimedWords'

interface PageArea {
  maxWidth: number
  availableHeight: number
}

export function useAyahPages(slide: AyatSlide, settings: VideoSettings, sizes: ReturnType<typeof computeTextSizes>, area: PageArea, timeMs: number) {
  const words = useTimedWords(slide.arabicText, slide.words, slide.audioDurationMs)
  const highlight = settings.wordHighlight ?? true
  const plan = React.useMemo(
    () =>
      planPages({
        words: words.map((word) => word.text),
        translation: settings.showTranslation ? slide.translation : '',
        transliteration: settings.showTransliteration ? slide.transliteration ?? '' : '',
        arabicSize: sizes.arabic,
        translationSize: sizes.translation,
        arabicLineHeight: highlight ? arabicLineFactor : 1.5,
        arabicWidthFactor: arabicWidthFactors[settings.arabicFont] ?? 1,
        ...area,
      }),
    [words, slide, settings.showTranslation, settings.showTransliteration, sizes, highlight, settings.arabicFont, area.maxWidth, area.availableHeight],
  )
  const switches = React.useMemo(() => pageSwitchTimes(words, plan.pages), [words, plan])
  const state = pageState(switches, timeMs)
  const fitted = { ...sizes, arabic: sizes.arabic * plan.scale, translation: sizes.translation * plan.scale, transliteration: sizes.transliteration * plan.scale }

  const paged = plan.pages.length > 1
  const lineHeight = highlight ? arabicLineFactor : 1.5
  const translationLines = Math.max(...plan.pages.map((p) => estimateTextLines(p.translation, fitted.translation, area.maxWidth)))
  const minHeights = {
    arabic: paged ? linesPerPage * fitted.arabic * lineHeight : 0,
    translation: paged ? translationLines * fitted.translation * 1.45 : 0,
  }

  return { words, page: plan.pages[state.index]!, isLastPage: state.index === plan.pages.length - 1, state, fitted, minHeights }
}
