import { Loader2, ScrollText } from 'lucide-react'
import { SelectItem } from '@/components/ui/select'
import { FieldLabel } from '@/components/selection/FieldLabel'
import { PickerSelect } from '@/components/selection/PickerSelect'
import type { Hadith } from '@/lib/hadith/types'

interface HadithPickerProps {
  hadiths: Hadith[]
  value: number
  onChange: (number: number) => void
  isLoading: boolean
  failed: boolean
}

const preview = (text: string) => (text.length > 90 ? `${text.slice(0, 90)}…` : text)

export function HadithPicker({ hadiths, value, onChange, isLoading, failed }: HadithPickerProps) {
  return (
    <div className="space-y-1.5">
      <FieldLabel icon={ScrollText}>Hadith {hadiths.length > 0 && <span className="normal-case text-muted-foreground">· {hadiths.length}</span>}</FieldLabel>
      {isLoading ? (
        <div className="flex h-12 items-center justify-center rounded-md border border-border"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
      ) : failed ? (
        <p className="text-xs text-destructive">Could not load this chapter. Check your connection and try again.</p>
      ) : hadiths.length === 0 ? (
        <p className="text-xs text-muted-foreground">No short authentic hadith in this chapter. Turn off “Short hadith only” or pick another chapter.</p>
      ) : (
        <PickerSelect value={value ? String(value) : ''} onChange={(v) => onChange(Number(v))} placeholder="Choose a hadith" contentClassName="max-h-96 max-w-[min(92vw,28rem)]">
          {hadiths.map((h) => (
            <SelectItem key={h.number} value={String(h.number)} className="py-2">
              <span className="block whitespace-normal text-xs leading-snug"><b>#{h.number}</b>{h.grade && h.book !== 'bukhari' && h.book !== 'muslim' ? ` · ${h.grade}` : ''} — {preview(h.text)}</span>
            </SelectItem>
          ))}
        </PickerSelect>
      )}
    </div>
  )
}
