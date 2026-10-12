import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

const sizes = {
  large: {
    section: 'py-16 sm:py-20 border-y',
    grid: 'opacity-60',
    chip: 'h-14 w-14 mb-6',
    heart: 'h-7 w-7',
    title: 'text-2xl sm:text-3xl mb-4 font-display',
    text: 'text-base sm:text-lg',
  },
  medium: {
    section: 'py-12 sm:py-16 border-b',
    grid: 'opacity-50',
    chip: 'h-12 w-12 mb-4',
    heart: 'h-6 w-6',
    title: 'text-xl sm:text-2xl mb-3',
    text: 'text-sm sm:text-base',
  },
}

interface MissionBannerProps {
  title: string
  size: keyof typeof sizes
  children: React.ReactNode
}

export function MissionBanner({ title, size, children }: MissionBannerProps) {
  const style = sizes[size]
  return (
    <section className={cn('relative px-4 sm:px-6 overflow-hidden border-primary/10', style.section)}>
      <div className="absolute inset-0 bg-primary/5" aria-hidden />
      <div className={cn('absolute inset-0 qv-grid-bg', style.grid)} aria-hidden />
      <div className="relative max-w-3xl mx-auto text-center">
        <div className={cn('qv-icon-chip mx-auto', style.chip)}>
          <Heart className={style.heart} />
        </div>
        <h2 className={cn('font-bold tracking-tight', style.title)}>{title}</h2>
        <p className={cn(style.text, 'text-muted-foreground leading-relaxed')}>{children}</p>
      </div>
    </section>
  )
}
