import { cn } from '@/lib/utils'

interface TwoLineOptionProps {
  title: string
  subtitle: string
  truncateSubtitle?: boolean
  trailing?: React.ReactNode
}

export function TwoLineOption({ title, subtitle, truncateSubtitle, trailing }: TwoLineOptionProps) {
  return (
    <div className={cn('flex items-center w-full min-w-0', trailing === undefined ? 'gap-3' : 'gap-2')}>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium leading-tight truncate">{title}</span>
        <span className={cn('text-[11px] text-muted-foreground leading-tight', truncateSubtitle && 'truncate')}>
          {subtitle}
        </span>
      </div>
      {trailing}
    </div>
  )
}
