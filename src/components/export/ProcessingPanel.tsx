import { phaseLabels, type ProcessingPhase } from '@/lib/export/phases'
import { BrandLogo } from '@/components/site/BrandLogo'
import { GlowPanel } from './GlowPanel'
import { ProgressMeter } from './ProgressMeter'

export function ProcessingPanel({ progress, phase }: { progress: number; phase: ProcessingPhase }) {
  const percent = Math.min(100, Math.max(0, Math.round(progress * 100)))
  const { title, subtitle } = phaseLabels[phase]

  return (
    <GlowPanel tone="processing" className="min-h-[320px]">
      <div className="relative mx-auto mb-6">
        <div aria-hidden className="qv-processing-glow absolute inset-0 rounded-full bg-primary/30 blur-xl" />
        <div className="qv-processing-ring absolute inset-0 rounded-full" />
        <div className="relative grid place-items-center h-20 w-20 rounded-full bg-card shadow-lg">
          <BrandLogo size={40} alt="" className="h-10 w-10" />
        </div>
      </div>
      <div className="text-center mb-5 min-h-[44px]">
        <p key={phase} className="qv-phase-label font-semibold text-base text-foreground">
          {title}
          <span className="inline-flex ml-1.5 align-middle">
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="qv-dot inline-block h-1.5 w-1.5 rounded-full bg-primary mx-0.5" />
            ))}
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <ProgressMeter percent={percent} phase={phase} />
      <p className="text-center text-[10px] text-muted-foreground/70 mt-5">Do not close this tab while processing</p>
    </GlowPanel>
  )
}
