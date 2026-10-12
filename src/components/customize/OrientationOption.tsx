import type { Orientation } from '@/lib/types'
import { cn } from '@/lib/utils'

interface OrientationOptionProps {
  orientation: Orientation
  selected: boolean
  onSelect: () => void
}

export function OrientationOption({ orientation, selected, onSelect }: OrientationOptionProps) {
  const portrait = orientation === 'portrait'
  return (
    <button
      onClick={onSelect}
      className={cn(
        'group relative flex flex-col items-center gap-3 rounded-xl border-2 px-4 py-5 transition-all duration-200',
        selected
          ? 'border-primary bg-gradient-to-b from-primary/[0.07] to-primary/[0.12] shadow-lg shadow-primary/10'
          : 'border-border/80 bg-card hover:border-foreground/20 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-xl transition-all duration-200',
          selected ? 'bg-primary/10' : 'bg-muted/60 group-hover:bg-muted',
          portrait ? 'h-16 w-10' : 'h-10 w-16',
        )}
      >
        <div
          className={cn(
            'rounded-md border-2 transition-all duration-200',
            selected ? 'border-primary' : 'border-foreground/30',
            portrait ? 'h-11 w-6' : 'h-6 w-11',
          )}
        />
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span
          className={cn(
            'text-sm font-semibold capitalize tracking-tight transition-colors duration-200',
            selected ? 'text-primary' : 'text-foreground',
          )}
        >
          {orientation}
        </span>
        <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-[0.12em]">
          {portrait ? '9:16' : '16:9'}
        </span>
      </div>
    </button>
  )
}
