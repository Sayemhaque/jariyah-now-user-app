import { cn } from '@/lib/utils'

interface SummaryRowProps {
  label: string
  value: React.ReactNode
  mono?: boolean
}

export function SummaryRow({ label, value, mono = true }: SummaryRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={cn('tabular-nums text-xs', mono && 'font-mono')}>{value}</span>
    </div>
  )
}
