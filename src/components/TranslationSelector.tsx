'use client'

import { BookText } from 'lucide-react'
import { useSurahRange } from '@/lib/store'
import { translationEditions } from '@/lib/translations'
import { SelectItem } from '@/components/ui/select'
import { FieldLabel } from './selection/FieldLabel'
import { LicenseWarning } from './selection/LicenseWarning'
import { PickerSelect } from './selection/PickerSelect'
import { TwoLineOption } from './selection/TwoLineOption'

export function TranslationSelector() {
  const { translationKey, setTranslation } = useSurahRange()
  return (
    <div className="space-y-1.5">
      <FieldLabel icon={BookText}>Translation</FieldLabel>
      <PickerSelect value={translationKey} onChange={setTranslation} placeholder="Choose a translation">
        {translationEditions.map((edition) => (
          <SelectItem key={edition.key} value={edition.key} className="py-2.5">
            <TwoLineOption
              title={edition.label}
              subtitle={edition.rightsHolder}
              truncateSubtitle
              trailing={edition.warn ? <LicenseWarning note={edition.licenseNote} /> : null}
            />
          </SelectItem>
        ))}
      </PickerSelect>
    </div>
  )
}
