import { cn } from '@/lib/utils'

interface PillTabsProps<T extends string> {
  options: { key: T; label: string }[]
  active: T
  onChange: (key: T) => void
  className?: string
}

export function PillTabs<T extends string>({ options, active, onChange, className }: PillTabsProps<T>) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-2', className)}>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={cn(
            'inline-flex h-9 items-center rounded-full border px-4 text-xs font-semibold transition-all',
            active === option.key
              ? 'border-transparent text-primary-foreground shadow-md [background:var(--primary-gradient)]'
              : 'border-border bg-card/80 text-muted-foreground hover:border-primary/30 hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
