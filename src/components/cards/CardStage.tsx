import { QuoteCard } from '@/cards/QuoteCard'
import { useFitScale } from '@/hooks/useFitScale'
import type { CardProps } from '@/lib/cards/types'
import { cardSizes } from '@/lib/cards/types'

export function CardStage(card: CardProps) {
  const { width, height } = cardSizes[card.format]
  const { ref, scale } = useFitScale(width, height)
  return (
    <div ref={ref} className="relative h-full w-full">
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
        style={{ width: width * scale, height: height * scale, transform: 'translate(-50%, -50%)' }}
      >
        <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <QuoteCard {...card} logoSrc="/watermark.png" />
        </div>
      </div>
    </div>
  )
}
