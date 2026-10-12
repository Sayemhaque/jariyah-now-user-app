'use client'

import { useMemo, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { useSurahRange } from '@/lib/store'
import { useSurahsQuery } from '@/lib/queries/builder'
import { filterSurahs } from '@/lib/surahSearch'
import { SelectGroup, SelectLabel } from '@/components/ui/select'
import { FieldLabel } from './selection/FieldLabel'
import { PickerSelect } from './selection/PickerSelect'
import { SurahOption } from './selection/SurahOption'
import { SurahSearch } from './selection/SurahSearch'
import { SurahSummary } from './selection/SurahSummary'

export function SurahSelector() {
  const { surahs, selectedSurahNumber, setSurah } = useSurahRange()
  const surahsQuery = useSurahsQuery()
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => filterSurahs(surahs, query), [surahs, query])
  const selectedSurah = surahs.find((s) => s.number === selectedSurahNumber)
  const waiting = surahsQuery.isLoading && surahs.length === 0

  return (
    <div className="space-y-1.5">
      <FieldLabel icon={BookOpen}>Surah</FieldLabel>
      <PickerSelect
        value={selectedSurahNumber ? String(selectedSurahNumber) : ''}
        onChange={(value) => setSurah(Number(value))}
        disabled={waiting}
        placeholder={waiting ? 'Loading surahs…' : 'Choose a surah'}
        contentClassName="max-h-96"
      >
        <SurahSearch query={query} onChange={setQuery} />
        <SelectGroup>
          <SelectLabel className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground px-2 py-1.5">
            {filtered.length} surahs
          </SelectLabel>
          <div className="max-h-[260px] overflow-y-auto scrollbar-thin">
            {filtered.map((surah) => (
              <SurahOption key={surah.number} surah={surah} />
            ))}
            {!filtered.length && (
              <div className="py-6 text-center text-xs text-muted-foreground">No surah matches “{query}”.</div>
            )}
          </div>
        </SelectGroup>
      </PickerSelect>
      {surahsQuery.error && (
        <p className="text-xs text-destructive">
          {surahsQuery.error instanceof Error ? surahsQuery.error.message : 'Failed to load surahs'}
        </p>
      )}
      {selectedSurah && <SurahSummary surah={selectedSurah} />}
    </div>
  )
}
