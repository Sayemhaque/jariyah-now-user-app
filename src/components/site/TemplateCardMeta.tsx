import { formatTemplateRange, type TemplatePreset } from '@/lib/templatePresets'

interface TemplateCardMetaProps {
  template: TemplatePreset
  detailed?: boolean
}

export function TemplateCardMeta({ template, detailed }: TemplateCardMetaProps) {
  const { config } = template
  const font = config.arabicFont ?? 'uthmani'
  const separator = <span className="opacity-40">·</span>

  return (
    <div className="mt-auto pt-3 border-t border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
      <span className="font-mono font-semibold text-foreground/80">{formatTemplateRange(config)}</span>
      {separator}
      <span className="capitalize">{detailed ? `${font} font` : font}</span>
      {detailed && config.reciterId && (
        <>
          {separator}
          <span className="capitalize">{config.reciterId}</span>
        </>
      )}
    </div>
  )
}
