'use client'

import { Mic2 } from 'lucide-react'
import { useSurahRange } from '@/lib/store'
import { reciters } from '@/lib/reciters'
import { SelectItem } from '@/components/ui/select'
import { FieldLabel } from './selection/FieldLabel'
import { PickerSelect } from './selection/PickerSelect'
import { TwoLineOption } from './selection/TwoLineOption'

export function ReciterSelector() {
  const { reciterId, setReciter } = useSurahRange()
  return (
    <div className="space-y-1.5">
      <FieldLabel icon={Mic2}>Reciter</FieldLabel>
      <PickerSelect value={reciterId} onChange={setReciter} placeholder="Choose a reciter">
        {reciters.map((reciter) => (
          <SelectItem key={reciter.id} value={reciter.id} className="py-2.5">
            <TwoLineOption title={reciter.name} subtitle={reciter.style} />
          </SelectItem>
        ))}
      </PickerSelect>
    </div>
  )
}
