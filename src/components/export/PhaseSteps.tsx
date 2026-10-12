import { phaseOrder, type ProcessingPhase } from '@/lib/export/phases'
import { cn } from '@/lib/utils'

export function PhaseSteps({ phase }: { phase: ProcessingPhase }) {
  const currentIndex = phaseOrder.indexOf(phase)
  return (
    <div className="flex items-center justify-between pt-1.5">
      {phaseOrder.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              'h-1.5 w-1.5 rounded-full transition-all duration-300',
              index === currentIndex
                ? 'bg-primary scale-150 shadow-[0_0_8px_var(--primary)]'
                : index < currentIndex
                  ? 'bg-primary/60'
                  : 'bg-muted-foreground/30',
            )}
          />
          {index < phaseOrder.length - 1 && (
            <div
              className={cn('h-px w-6 transition-colors duration-300', index < currentIndex ? 'bg-primary/40' : 'bg-border')}
            />
          )}
        </div>
      ))}
    </div>
  )
}
