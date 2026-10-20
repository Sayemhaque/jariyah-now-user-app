import React from 'react'
import { QuoteCard } from '@/cards/QuoteCard'
import type { CardContent, CardFormat, CardLayout, CardTheme } from '@/lib/cards/types'

interface OffscreenCardsProps {
  cards: CardContent[]
  theme: CardTheme
  format: CardFormat
  layout: CardLayout
  nodes: React.MutableRefObject<(HTMLDivElement | null)[]>
}

export function OffscreenCards({ cards, theme, format, layout, nodes }: OffscreenCardsProps) {
  return (
    <div aria-hidden data-offscreen-cards style={{ position: 'fixed', left: -20000, top: 0, pointerEvents: 'none' }}>
      {cards.map((content, i) => (
        <div key={i} ref={(node) => { nodes.current[i] = node }} style={{ width: 'fit-content' }}>
          <QuoteCard content={content} theme={theme} format={format} layout={layout} logoSrc="/watermark.png" />
        </div>
      ))}
    </div>
  )
}
