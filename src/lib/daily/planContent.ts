import { presetCollections } from '@/lib/collections'
import { presetParts, type PresetPart } from '@/lib/collections/presetParts'
import { isTextMode, type ContentMode, type PresetMode, type QuranPreset, type TextItem } from '@/lib/collections/types'
import { seededShuffle } from './plan'

export interface PresetPick {
  preset: QuranPreset
  part: PresetPart
}

export function pickContentMode(sequence: number, rotation: ContentMode[], hasRecordings: (mode: ContentMode) => boolean): ContentMode {
  const usable = rotation.filter((mode) => !isTextMode(mode) || hasRecordings(mode))
  if (!usable.length) return 'quran'
  const wanted = rotation[((sequence % rotation.length) + rotation.length) % rotation.length]!
  if (usable.includes(wanted)) return wanted
  return usable[((sequence % usable.length) + usable.length) % usable.length]!
}

function cyclePick<T>(items: T[], turn: number, seed: number): T {
  const cycle = Math.floor(turn / items.length)
  const order = seededShuffle(items, seed + cycle)
  return order[((turn % items.length) + items.length) % items.length]!
}

export function pickPreset(mode: PresetMode, turn: number): PresetPick {
  const choices = presetCollections[mode].flatMap((preset) => presetParts(preset).map((part) => ({ preset, part })))
  return cyclePick(choices, turn, mode === 'masnoon' ? 0x3a5 : 0xd0a)
}

export function pickTextItem(items: TextItem[], recordedIds: Set<string>, turn: number): TextItem | null {
  const recorded = items.filter((item) => recordedIds.has(item.id))
  return recorded.length ? cyclePick(recorded, turn, 0x7e47) : null
}

export function modeTurn(sequence: number, rotation: ContentMode[], mode: ContentMode): number {
  const perCycle = Math.max(1, rotation.filter((m) => m === mode).length)
  return Math.floor(sequence / Math.max(1, rotation.length)) * perCycle + rotation.slice(0, ((sequence % rotation.length) + rotation.length) % rotation.length).filter((m) => m === mode).length
}
