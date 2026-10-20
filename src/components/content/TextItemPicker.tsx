import { CheckCircle2, ScrollText } from 'lucide-react'
import { SelectItem } from '@/components/ui/select'
import { FieldLabel } from '@/components/selection/FieldLabel'
import { PickerSelect } from '@/components/selection/PickerSelect'
import { TwoLineOption } from '@/components/selection/TwoLineOption'
import { useContent } from '@/lib/contentStore'
import { contentModeLabels, textCollections } from '@/lib/collections'
import type { TextMode } from '@/lib/collections/types'

export function TextItemPicker({ mode, recordedIds }: { mode: TextMode; recordedIds: Set<string> }) {
  const { textItemId, setTextItemId } = useContent()
  return (
    <div className="space-y-1.5">
      <FieldLabel icon={ScrollText}>{contentModeLabels[mode]}</FieldLabel>
      <PickerSelect value={textItemId} onChange={setTextItemId} placeholder="Choose one">
        {textCollections[mode].map((item) => (
          <SelectItem key={item.id} value={item.id} className="py-2.5">
            <TwoLineOption
              title={item.title}
              subtitle={item.source}
              truncateSubtitle
              trailing={recordedIds.has(item.id) ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
            />
          </SelectItem>
        ))}
      </PickerSelect>
    </div>
  )
}
