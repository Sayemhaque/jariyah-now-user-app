import { BookOpenCheck, Layers } from 'lucide-react'
import { SelectItem } from '@/components/ui/select'
import { FieldLabel } from '@/components/selection/FieldLabel'
import { PickerSelect } from '@/components/selection/PickerSelect'
import { TwoLineOption } from '@/components/selection/TwoLineOption'
import { usePresetSelection } from '@/hooks/usePresetSelection'
import { contentModeLabels } from '@/lib/collections'
import type { PresetMode } from '@/lib/collections/types'

export function PresetPicker({ mode }: { mode: PresetMode }) {
  const { presets, preset, parts, partIndex, selectPreset, selectPart } = usePresetSelection(mode)
  return (
    <div className="space-y-2.5">
      <div className="space-y-1.5">
        <FieldLabel icon={BookOpenCheck}>{contentModeLabels[mode]}</FieldLabel>
        <PickerSelect value={preset?.id ?? ''} onChange={selectPreset} placeholder="Choose one">
          {presets.map((p) => (
            <SelectItem key={p.id} value={p.id} className="py-2.5">
              <TwoLineOption title={p.title} subtitle={`${p.surah}:${p.fromAyat}${p.toAyat > p.fromAyat ? `–${p.toAyat}` : ''} · ${p.note}`} truncateSubtitle />
            </SelectItem>
          ))}
        </PickerSelect>
      </div>
      {parts.length > 1 && (
        <div className="space-y-1.5">
          <FieldLabel icon={Layers}>Part</FieldLabel>
          <PickerSelect value={String(partIndex)} onChange={(v) => selectPart(Number(v))} placeholder="Choose a part">
            {parts.map((part, index) => (
              <SelectItem key={part.label} value={String(index)}>
                {part.label}
              </SelectItem>
            ))}
          </PickerSelect>
        </div>
      )}
    </div>
  )
}
