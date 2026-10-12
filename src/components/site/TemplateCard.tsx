import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { TemplatePreset } from '@/lib/templatePresets'
import { cn } from '@/lib/utils'
import { TemplateCardBanner } from './TemplateCardBanner'
import { TemplateCardMeta } from './TemplateCardMeta'

interface TemplateCardProps {
  template: TemplatePreset
  href?: string
  onSelect?: (templateId: string) => void
}

export function TemplateCard({ template, href, onSelect }: TemplateCardProps) {
  const detailed = Boolean(onSelect)
  const body = (
    <>
      <TemplateCardBanner template={template} tall={detailed} />
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-base mb-1.5 flex items-center gap-2">
          {template.title}
          <ArrowRight className="h-4 w-4 text-primary opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0" />
        </h3>
        <p className={cn('text-sm text-muted-foreground leading-relaxed mb-3', detailed ? 'line-clamp-3' : 'line-clamp-2')}>
          {template.description}
        </p>
        <TemplateCardMeta template={template} detailed={detailed} />
      </div>
    </>
  )
  const cardClass = 'group rounded-2xl p-0 overflow-hidden qv-hover-lift flex flex-col'

  if (onSelect) {
    return (
      <button onClick={() => onSelect(template.id)} className={cn(cardClass, 'qv-card-premium text-left')}>
        {body}
      </button>
    )
  }
  return (
    <Link href={href ?? '/templates'} className={cn(cardClass, 'qv-card qv-gradient-border')}>
      {body}
    </Link>
  )
}
