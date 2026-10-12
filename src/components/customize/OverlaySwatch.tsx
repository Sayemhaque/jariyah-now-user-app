import { cn } from '@/lib/utils'

interface OverlaySwatchProps {
  label: string
  swatch: string
  selected: boolean
  onSelect: () => void
}

export function OverlaySwatch({ label, swatch, selected, onSelect }: OverlaySwatchProps) {
  return (
    <button
      onClick={onSelect}
      title={label}
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg border p-1.5 w-[68px] shrink-0 snap-start transition',
        selected ? 'border-primary bg-primary/10' : 'border-border bg-card/40 hover:border-foreground/30 hover:bg-card/70',
      )}
    >
      <span className="block h-6 w-full rounded-md ring-1 ring-inset ring-white/10" style={{ background: swatch }} />
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  )
}
