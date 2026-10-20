import { QuoteCard } from '@/cards/QuoteCard'
import { useFitScale } from '@/hooks/useFitScale'
import { useInView } from '@/hooks/useInView'
import type { CardProps } from '@/lib/cards/types'
import { cardSizes } from '@/lib/cards/types'

interface ScaledCardProps extends CardProps {
  nodeRef?: (node: HTMLDivElement | null) => void
  lazy?: boolean
}

export function ScaledCard({ nodeRef, lazy = false, ...card }: ScaledCardProps) {
  const { width, height } = cardSizes[card.format]
  const { ref, scale } = useFitScale(width, height)
  const visible = useInView(ref, lazy)
  return (
    <div ref={ref} className="relative w-full overflow-hidden" style={{ aspectRatio: `${width} / ${height}`, background: card.theme.background }}>
      {visible ? (
        <div style={{ position: 'absolute', top: 0, left: 0, width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <div ref={nodeRef} style={{ width, height }}>
            <QuoteCard {...card} logoSrc="/watermark.png" />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 animate-pulse bg-white/10" />
      )}
    </div>
  )
}
