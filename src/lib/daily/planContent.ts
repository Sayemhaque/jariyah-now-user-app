import { presetCollections } from '@/lib/collections'
import { duaReelSchedule } from '@/lib/collections/duaReelSchedule'
import { presetParts, type PresetPart } from '@/lib/collections/presetParts'
import type { FridayPostKey } from '@/lib/collections/friday'
import { specialPassages, type SpecialPassage } from '@/lib/collections/specialPassages'
import { type ContentMode, type PresetMode, type QuranPreset, type TextItem } from '@/lib/collections/types'
import { hadithBooks } from '@/lib/hadith/hadithBooks'
import type { HadithSelection } from '@/lib/hadith/types'
import { dhakaDayIndex, mulberry32, postSlot, seededShuffle } from './plan'

export interface PresetPick {
  preset: QuranPreset
  part: PresetPart
}

export function pickContentMode(sequence: number, rotation: ContentMode[]): ContentMode {
  if (!rotation.length) return 'quran'
  return rotation[((sequence % rotation.length) + rotation.length) % rotation.length]!
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

export function pickTextItem(items: TextItem[], turn: number): TextItem {
  return cyclePick(items, turn, 0x7e47)
}

export function modeTurn(sequence: number, rotation: ContentMode[], mode: ContentMode): number {
  const perCycle = Math.max(1, rotation.filter((m) => m === mode).length)
  return Math.floor(sequence / Math.max(1, rotation.length)) * perCycle + rotation.slice(0, ((sequence % rotation.length) + rotation.length) % rotation.length).filter((m) => m === mode).length
}

export type DailyMode = ContentMode | 'duaReel' | 'kahf' | FridayPostKey

export const isReelMode = (mode: DailyMode) => mode === 'quran' || mode === 'duaReel' || mode === 'kahf'

export const isFriday = (dayIndex: number) => (dayIndex + 4) % 7 === 5

export function dailyModes(dayIndex: number): DailyMode[] {
  return isFriday(dayIndex) ? ['kahf'] : ['quran']
}

export function pickDua(turn: number): QuranPreset {
  return cyclePick(presetCollections.duas, turn, 0xd0a5)
}

export function pickSpecial(turn: number): SpecialPassage {
  return cyclePick(specialPassages, turn, 0x5e7a)
}

export function scheduledDuaFor(date: Date, scheduleFrom?: string): QuranPreset | undefined {
  if (!scheduleFrom) return undefined
  const index = dhakaDayIndex(date) - dhakaDayIndex(new Date(`${scheduleFrom}T00:00:00+06:00`))
  return index >= 0 ? duaReelSchedule[index] : undefined
}

export function scheduledPost(date: Date, postTimes: readonly string[]): { mode: DailyMode; turn: number } {
  const day = dhakaDayIndex(date)
  const modes = dailyModes(day)
  const slot = Math.min(postSlot(date, postTimes), modes.length - 1)
  const mode = modes[slot]!
  return { mode, turn: day }
}

const dailyHadithBooks = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'bukhari', 'nawawi', 'muslim', 'ibnmajah', 'nasai', 'malik']

export function pickHadithSource(turn: number, attempt: number): HadithSelection {
  const book = hadithBooks.find((b) => b.key === dailyHadithBooks[(turn + attempt) % dailyHadithBooks.length])!
  const rand = mulberry32((turn + 1) * 7919 + attempt * 104729)
  return { book: book.key, section: book.sections[Math.floor(rand() * book.sections.length)]![0] }
}

export function pickFrom<T>(items: T[], turn: number): T | undefined {
  return items.length ? items[Math.floor(mulberry32(turn * 31337 + 7)() * items.length)] : undefined
}
