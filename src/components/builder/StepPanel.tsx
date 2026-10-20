import { cn } from '@/lib/utils'
import { bnDigits } from '@/lib/cards/bangla'

interface StepPanelProps {
  step: number
  title: string
  hint?: string
  className?: string
  children: React.ReactNode
}

export function StepPanel({ step, title, hint, className, children }: StepPanelProps) {
  return (
    <section className={cn('qv-panel-premium p-4 sm:p-5', className)}>
      <div className="flex items-start gap-3">
        <span className="qv-step-modern shrink-0">{bnDigits(step)}</span>
        <div className="space-y-0.5">
          <h2 className="text-base font-bold tracking-tight sm:text-lg">{title}</h2>
          {hint && <p className="text-sm leading-snug text-muted-foreground">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}
