import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  pillIcon?: LucideIcon
  pillLabel?: string
  centered?: boolean
  narrowSubtitle?: boolean
  display?: boolean
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  pillIcon: PillIcon,
  pillLabel,
  centered,
  narrowSubtitle,
  display = true,
  className,
}: SectionHeaderProps) {
  const pill = PillIcon && pillLabel && (
    <div className={centered ? 'qv-pill mb-4 mx-auto w-fit' : 'qv-pill-premium'}>
      <PillIcon className="h-3.5 w-3.5" />
      {pillLabel}
    </div>
  )
  const titleClass = centered
    ? cn('text-2xl sm:text-3xl font-bold mb-3', display ? 'font-display' : 'tracking-tight')
    : 'text-2xl sm:text-3xl font-bold tracking-tight font-display'

  return (
    <div className={cn(centered && 'text-center', className)}>
      {pill}
      <h2 className={titleClass}>{title}</h2>
      {subtitle && (
        <p className={cn('text-muted-foreground', (centered || narrowSubtitle) && 'max-w-xl mx-auto')}>{subtitle}</p>
      )}
    </div>
  )
}
