import React from 'react'
import { QuoteCard } from '@/cards/QuoteCard'
import type { CardContent, CardFormat, CardTheme } from '@/lib/cards/types'

interface OffscreenCardsProps {
  cards: CardContent[]
  theme: CardTheme
  format: CardFormat
  nodes: React.MutableRefObject<(HTMLDivElement | null)[]>
}

export function OffscreenCards({ cards, theme, format, nodes }: OffscreenCardsProps) {
  return (
    <div aria-hidden style={{ position: 'fixed', left: -20000, top: 0, pointerEvents: 'none' }}>
      {cards.map((content, i) => (
        <div key={i} ref={(node) => { nodes.current[i] = node }} style={{ width: 'fit-content' }}>
          <QuoteCard content={content} theme={theme} format={format} logoSrc="/watermark.png" />
        </div>
      ))}
    </div>
  )
}
