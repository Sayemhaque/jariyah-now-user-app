import { cn } from '@/lib/utils'

interface OptionButtonProps {
  selected: boolean
  onSelect: () => void
  glow?: boolean
  className?: string
  children: React.ReactNode
}

export function OptionButton({ selected, onSelect, glow, className, children }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'border transition',
        selected
          ? cn('border-primary bg-primary/10 text-primary', glow && 'shadow-sm shadow-primary/20')
          : 'border-border bg-card hover:border-foreground/30',
        className,
      )}
    >
      {children}
    </button>
  )
}
