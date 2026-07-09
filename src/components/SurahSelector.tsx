'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, BookOpen } from 'lucide-react'
import { useBuilderStore } from '@/lib/store'
import { useSurahsQuery } from '@/lib/queries/builder'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export function SurahSelector() {
  const surahs = useBuilderStore((s) => s.surahs)
  const setSurahs = useBuilderStore((s) => s.setSurahs)
  const selected = useBuilderStore((s) => s.selectedSurahNumber)
  const setSurah = useBuilderStore((s) => s.setSurah)
  const surahsQuery = useSurahsQuery()

  const [query, setQuery] = useState('')

  useEffect(() => {
    if (surahsQuery.data?.length) {
      setSurahs(surahsQuery.data)
    }
  }, [surahsQuery.data, setSurahs])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return surahs
    return surahs.filter(
      (s) =>
        String(s.number) === q ||
        s.name.toLowerCase().includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.arabicName.includes(query.trim()),
    )
  }, [surahs, query])

  const selectedSurah = surahs.find((s) => s.number === selected)

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        <BookOpen className="h-3.5 w-3.5 text-primary" />
        Surah
      </label>
      <Select
        value={selected ? String(selected) : ''}
        onValueChange={(v) => setSurah(Number(v))}
        disabled={surahsQuery.isLoading && surahs.length === 0}
      >
        <SelectTrigger className="w-full bg-card h-9 text-sm">
          <SelectValue
            placeholder={
              surahsQuery.isLoading && surahs.length === 0
                ? 'Loading surahs…'
                : 'Choose a surah'
            }
          />
        </SelectTrigger>
        <SelectContent className="max-h-96 bg-popover">
          <div className="p-2 sticky top-0 bg-popover z-10 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or number…"
                className="pl-9 h-9 bg-background/60"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground px-2 py-1.5">
              {filtered.length} surahs
            </SelectLabel>
            <div className="max-h-[260px] overflow-y-auto scrollbar-thin">
              {filtered.map((s) => (
                <SelectItem
                  key={s.number}
                  value={String(s.number)}
                  className="flex items-center justify-between gap-2 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid place-items-center h-7 w-7 rounded-md bg-primary/15 text-primary text-[11px] font-mono font-semibold shrink-0">
                      {s.number}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium leading-tight truncate">
                        {s.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground leading-tight truncate">
                        {s.englishName} · {s.numberOfAyahs} ayats ·{' '}
                        {s.revelationType}
                      </span>
                    </div>
                  </div>
                  <span lang="ar" className="font-arabic-uthmani text-lg text-foreground/80 shrink-0">
                    {s.arabicName}
                  </span>
                </SelectItem>
              ))}
              {!filtered.length && (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No surah matches “{query}”.
                </div>
              )}
            </div>
          </SelectGroup>
        </SelectContent>
      </Select>

      {surahsQuery.error && (
        <p className="text-xs text-destructive">
          {surahsQuery.error instanceof Error
            ? surahsQuery.error.message
            : 'Failed to load surahs'}
        </p>
      )}
      {selectedSurah && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-0.5">
          <Badge
            variant="secondary"
            className="font-mono bg-primary/10 text-primary border-primary/20"
          >
            {selectedSurah.number}
          </Badge>
          <span className="tabular-nums">
            {selectedSurah.numberOfAyahs} ayats
          </span>
          <span className="opacity-50">·</span>
          <span>{selectedSurah.revelationType}</span>
        </div>
      )}
    </div>
  )
}
