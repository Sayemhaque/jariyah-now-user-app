'use client'

import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBuilderStore } from '@/lib/store'
import { validateAyatRange, MAX_AYATS_PER_VIDEO } from '@/lib/validation'
import { cn } from '@/lib/utils'

export function AyatRangePicker() {
  const fromAyat = useBuilderStore((s) => s.fromAyat)
  const toAyat = useBuilderStore((s) => s.toAyat)
  const setFromAyat = useBuilderStore((s) => s.setFromAyat)
  const setToAyat = useBuilderStore((s) => s.setToAyat)
  const surahs = useBuilderStore((s) => s.surahs)
  const selectedSurahNumber = useBuilderStore((s) => s.selectedSurahNumber)

  const surah = useMemo(
    () => surahs.find((s) => s.number === selectedSurahNumber),
    [surahs, selectedSurahNumber],
  )

  const onBlurFrom = () => {
    if (fromAyat < 1) setFromAyat(1)
    if (surah && fromAyat > surah.numberOfAyahs) setFromAyat(surah.numberOfAyahs)
  }
  const onBlurTo = () => {
    if (toAyat < 1) setToAyat(1)
    if (surah && toAyat > surah.numberOfAyahs) setToAyat(surah.numberOfAyahs)
  }

  const validation = useMemo(
    () => validateAyatRange(fromAyat, toAyat, surah),
    [fromAyat, toAyat, surah],
  )
  const count = Math.max(0, toAyat - fromAyat + 1)
  const over = count > MAX_AYATS_PER_VIDEO

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Ayat range</Label>
        <span
          className={cn(
            'text-[11px] font-mono px-2 py-0.5 rounded-full tabular-nums border',
            over
              ? 'bg-destructive/15 text-destructive border-destructive/30'
              : 'bg-primary/10 text-primary border-primary/25',
          )}
        >
          {count} / {MAX_AYATS_PER_VIDEO}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="from-ayat"
            className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
          >
            From
          </Label>
          <Input
            id="from-ayat"
            type="number"
            min={1}
            max={surah?.numberOfAyahs ?? undefined}
            value={Number.isFinite(fromAyat) ? fromAyat : ''}
            onChange={(e) => setFromAyat(Number(e.target.value))}
            onBlur={onBlurFrom}
            className="bg-card/60 h-10 tabular-nums"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="to-ayat"
            className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
          >
            To
          </Label>
          <Input
            id="to-ayat"
            type="number"
            min={1}
            max={surah?.numberOfAyahs ?? undefined}
            value={Number.isFinite(toAyat) ? toAyat : ''}
            onChange={(e) => setToAyat(Number(e.target.value))}
            onBlur={onBlurTo}
            className="bg-card/60 h-10 tabular-nums"
          />
        </div>
      </div>

      {surah && (
        <p className="text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground/70">{surah.name}</span>{' '}
          has <span className="tabular-nums">{surah.numberOfAyahs}</span> ayats.
        </p>
      )}

      {!validation.ok && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="leading-relaxed">{validation.error}</span>
        </div>
      )}
    </div>
  )
}
