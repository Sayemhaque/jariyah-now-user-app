import { OptionButton } from '@/components/common/OptionButton'
import { cn } from '@/lib/utils'

interface StyleOptionProps {
  styleKey: string
  label: string
  description: string
  selected: boolean
  onSelect: () => void
}

export function StyleOption({ styleKey, label, description, selected, onSelect }: StyleOptionProps) {
  return (
    <OptionButton selected={selected} onSelect={onSelect} glow className="flex flex-col overflow-hidden rounded-xl text-left">
      <img src={`/style-previews/${styleKey}.jpg`} alt="" className="aspect-[9/16] w-full object-cover" loading="lazy" />
      <span className="px-2.5 pb-2.5 pt-2">
        <span className={cn('block text-xs font-semibold leading-tight', selected ? 'text-primary' : 'text-foreground')}>{label}</span>
        <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">{description}</span>
      </span>
    </OptionButton>
  )
}
