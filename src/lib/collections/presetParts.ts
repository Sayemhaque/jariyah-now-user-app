import { maxAyatsPerVideo } from '@/lib/constants'
import type { QuranPreset } from './types'

export interface PresetPart {
  label: string
  fromAyat: number
  toAyat: number
}

const rangeLabel = (from: number, to: number) => (from === to ? `Ayat ${from}` : `Ayat ${from}–${to}`)

export function presetParts(preset: QuranPreset, maxAyats = maxAyatsPerVideo): PresetPart[] {
  const total = preset.toAyat - preset.fromAyat + 1
  const count = Math.ceil(total / maxAyats)
  const size = Math.ceil(total / count)
  return Array.from({ length: count }, (_, i) => {
    const fromAyat = preset.fromAyat + i * size
    const toAyat = Math.min(preset.toAyat, fromAyat + size - 1)
    const label = count === 1 ? rangeLabel(fromAyat, toAyat) : `Part ${i + 1} · ${rangeLabel(fromAyat, toAyat)}`
    return { label, fromAyat, toAyat }
  })
}
