import { SelectItem } from '@/components/ui/select'
import { PickerSelect } from '@/components/selection/PickerSelect'
import type { CardFont } from '@/lib/cards/fontLibrary'

interface FontSelectProps {
  label: string
  sample: string
  value: string
  fonts: CardFont[]
  onChange: (id: string) => void
}

export function FontSelect({ label, sample, value, fonts, onChange }: FontSelectProps) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <PickerSelect value={value} onChange={onChange} placeholder="Choose a font" contentClassName="max-h-80">
        {fonts.map((font) => (
          <SelectItem key={font.id} value={font.id} className="py-2">
            <span className="flex w-full items-baseline justify-between gap-3">
              <span style={{ fontFamily: font.family, fontWeight: font.weight, fontStyle: font.style, fontSize: 20 }}>{sample}</span>
              <span className="text-[10px] text-muted-foreground">{font.label}</span>
            </span>
          </SelectItem>
        ))}
      </PickerSelect>
    </div>
  )
}
