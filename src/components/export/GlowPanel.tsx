import { cn } from '@/lib/utils'

const tones = {
  processing: ['-top-12 -left-12 h-40 w-40 bg-primary/20', '-bottom-16 -right-12 h-48 w-48 bg-primary/15'],
  success: ['-top-12 -right-12 h-40 w-40 bg-emerald-500/15', '-bottom-12 -left-12 h-40 w-40 bg-primary/15'],
}

interface GlowPanelProps {
  tone: keyof typeof tones
  className: string
  children: React.ReactNode
}

export function GlowPanel({ tone, className, children }: GlowPanelProps) {
  return (
    <div
      className={cn(
        'qv-processing-panel relative rounded-2xl border border-primary/20 overflow-hidden flex flex-col justify-center p-6 sm:p-8',
        className,
      )}
    >
      {tones[tone].map((orb) => (
        <div key={orb} aria-hidden className={cn('absolute rounded-full blur-3xl', orb)} />
      ))}
      {children}
    </div>
  )
}
