import React from 'react'
import { QuoteCard } from '@/cards/QuoteCard'
import type { CardContent, CardProps } from '@/lib/cards/types'

interface OffscreenCardsProps {
  cards: CardContent[]
  design: Omit<CardProps, 'content'>
  nodes: React.MutableRefObject<(HTMLDivElement | null)[]>
}

export function OffscreenCards({ cards, design, nodes }: OffscreenCardsProps) {
  return (
    <div aria-hidden data-offscreen-cards style={{ position: 'fixed', left: -20000, top: 0, pointerEvents: 'none' }}>
      {cards.map((content, i) => (
        <div key={i} ref={(node) => { nodes.current[i] = node }} style={{ width: 'fit-content' }}>
          <QuoteCard {...design} content={content} logoSrc="/watermark.png" />
        </div>
      ))}
    </div>
  )
}
