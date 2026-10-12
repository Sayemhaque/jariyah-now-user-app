import type { ProcessingPhase } from '@/lib/export/phases'
import { PhaseSteps } from './PhaseSteps'

export function ProgressMeter({ percent, phase }: { percent: number; phase: ProcessingPhase }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">MP4 · Processing</span>
        <span
          className="font-mono font-bold text-lg text-primary tabular-nums"
          style={{ textShadow: '0 0 12px hsl(var(--primary) / 0.4)' }}
        >
          {percent}%
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-muted/80 overflow-hidden ring-1 ring-inset ring-border">
        <div
          className="qv-processing-bar relative h-full rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        >
          <div aria-hidden className="qv-processing-shimmer absolute inset-0 rounded-full" />
        </div>
      </div>
      <PhaseSteps phase={phase} />
    </div>
  )
}
