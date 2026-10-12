import type { Surah } from '@/lib/types'
import { SelectItem } from '@/components/ui/select'
import { TwoLineOption } from './TwoLineOption'

export function SurahOption({ surah }: { surah: Surah }) {
  return (
    <SelectItem value={String(surah.number)} className="py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="grid place-items-center h-7 w-7 rounded-md bg-primary/15 text-primary text-[11px] font-mono font-semibold shrink-0">
          {surah.number}
        </span>
        <TwoLineOption
          title={surah.name}
          subtitle={`${surah.englishName} · ${surah.numberOfAyahs} ayats · ${surah.revelationType}`}
          truncateSubtitle
        />
      </div>
    </SelectItem>
  )
}
