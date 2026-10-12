import type { FeatureItem } from '@/lib/content/site'
import { FeatureCard } from './FeatureCard'

interface FeatureGridProps {
  items: FeatureItem[]
  className: string
  delayStepMs?: number
}

export function FeatureGrid({ items, className, delayStepMs }: FeatureGridProps) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <FeatureCard
          key={item.title}
          item={item}
          delayMs={delayStepMs === undefined ? undefined : index * delayStepMs}
        />
      ))}
    </div>
  )
}
