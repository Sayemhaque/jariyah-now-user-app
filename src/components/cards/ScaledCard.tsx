import { QuoteCard } from '@/cards/QuoteCard'
import { useFitScale } from '@/hooks/useFitScale'
import type { CardProps } from '@/lib/cards/types'
import { cardSizes } from '@/lib/cards/types'

interface ScaledCardProps extends CardProps {
  nodeRef?: (node: HTMLDivElement | null) => void
}

export function ScaledCard({ nodeRef, ...card }: ScaledCardProps) {
  const { width, height } = cardSizes[card.format]
  const { ref, scale } = useFitScale(width, height)
  return (
    <div ref={ref} className="relative w-full overflow-hidden" style={{ aspectRatio: `${width} / ${height}` }}>
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <div ref={nodeRef} style={{ width, height }}>
          <QuoteCard {...card} logoSrc="/watermark.png" />
        </div>
      </div>
    </div>
  )
}
