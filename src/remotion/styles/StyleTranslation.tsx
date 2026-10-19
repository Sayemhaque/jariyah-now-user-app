import React from 'react'
import type { useAyahPages } from '../useAyahPages'
import { pageMotionStyle } from './useStyleSlide'

interface StyleTranslationProps {
  pages: ReturnType<typeof useAyahPages>
  color: string
  fontFamily: string
  opacity: number
  italic?: boolean
  scale?: number
}

export const StyleTranslation: React.FC<StyleTranslationProps> = ({ pages, color, fontFamily, opacity, italic, scale = 1 }) =>
  pages.page.translation ? (
    <p
      style={{
        ...pageMotionStyle(pages),
        opacity: opacity * pages.state.opacity,
        minHeight: pages.minHeights.translation,
        textAlign: 'center',
        fontFamily,
        fontStyle: italic ? 'italic' : 'normal',
        fontWeight: 500,
        fontSize: pages.fitted.translation * scale,
        lineHeight: 1.4,
        color,
      }}
    >
      {pages.page.translation}
    </p>
  ) : null
