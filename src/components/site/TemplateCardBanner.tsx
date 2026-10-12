import { templateTypeLabels, type TemplatePreset } from '@/lib/templatePresets'
import { cn } from '@/lib/utils'

interface TemplateCardBannerProps {
  template: TemplatePreset
  tall?: boolean
}

export function TemplateCardBanner({ template, tall }: TemplateCardBannerProps) {
  return (
    <div
      className={cn(
        'relative bg-gradient-to-br flex items-center justify-center overflow-hidden',
        tall ? 'h-32' : 'h-28',
        template.gradient,
      )}
    >
      <span
        className="text-5xl filter drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
        aria-hidden
      >
        {template.icon}
      </span>
      <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-white/15 blur-xl" />
      <div className="absolute -bottom-6 -left-4 h-20 w-20 rounded-full bg-black/15 blur-xl" />
      <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/30 text-white backdrop-blur-sm">
        {templateTypeLabels[template.type]}
      </span>
    </div>
  )
}
