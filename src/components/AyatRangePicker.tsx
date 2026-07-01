'use client'

import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBuilderStore } from '@/lib/store'
import { validateAyatRange, MAX_AYATS_PER_VIDEO } from '@/lib/validation'

export function AyatRangePicker() {
  const fromAyat = useBuilderStore((s) => s.fromAyat)
  const toAyat = useBuilderStore((s) => s.toAyat)
  const setFromAyat = useBuilderStore((s) => s.setFromAyat)
  const setToAyat = useBuilderStore((s) => s.setToAyat)
  const surahs = useBuilderStore((s) => s.surahs)
  const selectedSurahNumber = useBuilderStore((s) => s.selectedSurahNumber)

  // Derive the selected surah with a stable reference.
  const surah = useMemo(
    () => surahs.find((s) => s.number === selectedSurahNumber),
    [surahs, selectedSurahNumber],
  )

  // Keep the range valid as the user types. We don't mutate during typing
  // (annoying), but we do clamp on blur.
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Ayat range</Label>
        <span
          className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
            count > MAX_AYATS_PER_VIDEO
              ? 'bg-destructive/15 text-destructive'
              : 'bg-primary/15 text-primary'
          }`}
        >
          {count} / {MAX_AYATS_PER_VIDEO}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="from-ayat"
            className="text-[11px] uppercase tracking-wide text-muted-foreground"
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
            className="bg-card/60"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="to-ayat"
            className="text-[11px] uppercase tracking-wide text-muted-foreground"
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
            className="bg-card/60"
          />
        </div>
      </div>

      {surah && (
        <p className="text-[11px] text-muted-foreground">
          {surah.name} has {surah.numberOfAyahs} ayats.
        </p>
      )}

      {!validation.ok && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{validation.error}</span>
        </div>
      )}
    </div>
  )
}
