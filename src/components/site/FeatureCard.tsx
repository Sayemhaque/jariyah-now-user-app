import type { FeatureItem } from '@/lib/content/site'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
  item: FeatureItem
  delayMs?: number
}

export function FeatureCard({ item, delayMs }: FeatureCardProps) {
  const { icon: Icon, step, title, description } = item
  const animated = delayMs !== undefined
  const iconChip = (
    <div className={cn('qv-icon-chip h-11 w-11', !step && 'mb-4')}>
      <Icon className="h-5 w-5" />
    </div>
  )

  return (
    <div
      className={cn('qv-card-premium rounded-2xl p-6 relative qv-hover-lift', animated && 'qv-scroll-fade')}
      style={animated ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {step ? (
        <div className="flex items-center gap-3 mb-4">
          {iconChip}
          <span className="text-3xl font-bold qv-gradient-text">{step}</span>
        </div>
      ) : (
        iconChip
      )}
      <h3 className="font-bold text-base mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
