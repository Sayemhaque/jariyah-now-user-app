'use client'

import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useSurahRange } from '@/lib/store'
import { validateAyatRange, MAX_AYATS_PER_VIDEO } from '@/lib/validation'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function AyatRangePicker() {
  const { surahs, selectedSurahNumber, fromAyat, toAyat, setFromAyat, setToAyat } = useSurahRange()

  const surah = useMemo(
    () => surahs.find((s) => s.number === selectedSurahNumber),
    [surahs, selectedSurahNumber],
  )

  const maxAyat = surah?.numberOfAyahs ?? 0

  const fromOptions = useMemo(
    () => Array.from({ length: maxAyat }, (_, i) => i + 1),
    [maxAyat],
  )

  const toOptions = useMemo(
    () => Array.from({ length: maxAyat }, (_, i) => i + 1),
    [maxAyat],
  )

  const validation = useMemo(
    () => validateAyatRange(fromAyat, toAyat, surah),
    [fromAyat, toAyat, surah],
  )
  const count = Math.max(0, toAyat - fromAyat + 1)
  const over = count > MAX_AYATS_PER_VIDEO

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ayat range</Label>
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
          <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            From
          </Label>
          <Select
            value={String(fromAyat)}
            onValueChange={(v) => setFromAyat(Number(v))}
            disabled={!surah}
          >
            <SelectTrigger className="w-full bg-card h-9 text-sm">
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent className="max-h-[220px] bg-popover">
              {fromOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            To
          </Label>
          <Select
            value={String(toAyat)}
            onValueChange={(v) => setToAyat(Number(v))}
            disabled={!surah}
          >
            <SelectTrigger className="w-full bg-card h-9 text-sm">
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent className="max-h-[220px] bg-popover">
              {toOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
