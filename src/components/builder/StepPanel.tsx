import { cn } from '@/lib/utils'

interface StepPanelProps {
  step: number
  title: string
  className?: string
  children: React.ReactNode
}

export function StepPanel({ step, title, className, children }: StepPanelProps) {
  return (
    <section className={cn('qv-panel-premium p-3.5 sm:p-4', className)}>
      <div className="flex items-center gap-2.5">
        <span className="qv-step-modern">{step}</span>
        <h2 className="text-sm font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  )
}
