import { useMemo } from 'react'
import { useSurahRange } from '@/lib/store'
import { useContent } from '@/lib/contentStore'
import { findPreset, presetCollections } from '@/lib/collections'
import { presetParts } from '@/lib/collections/presetParts'
import type { PresetMode } from '@/lib/collections/types'

export function usePresetSelection(mode: PresetMode) {
  const { setSurah, setFromAyat, setToAyat } = useSurahRange()
  const { presetId, partIndex, setPresetId, setPartIndex } = useContent()
  const preset = findPreset(mode, presetId)
  const parts = useMemo(() => (preset ? presetParts(preset) : []), [preset])

  const applyRange = (surah: number, fromAyat: number, toAyat: number) => {
    setSurah(surah)
    setFromAyat(fromAyat)
    setToAyat(toAyat)
  }

  const selectPreset = (id: string) => {
    const next = findPreset(mode, id)
    if (!next) return
    setPresetId(id)
    const first = presetParts(next)[0]!
    applyRange(next.surah, first.fromAyat, first.toAyat)
  }

  const selectPart = (index: number) => {
    const part = parts[index]
    if (!preset || !part) return
    setPartIndex(index)
    applyRange(preset.surah, part.fromAyat, part.toAyat)
  }

  return { presets: presetCollections[mode], preset, parts, partIndex, selectPreset, selectPart }
}
