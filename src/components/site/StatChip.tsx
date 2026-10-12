import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatChipProps {
  icon: LucideIcon
  label: string
  className?: string
}

export function StatChip({ icon: Icon, label, className }: StatChipProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-card/80 border border-border/80 text-sm text-muted-foreground shadow-sm',
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
      {label}
    </div>
  )
}
