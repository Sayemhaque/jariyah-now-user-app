import { backgroundScenes } from '@/lib/backgroundPresets'
import { presetCollections } from '@/lib/collections'
import { presetParts } from '@/lib/collections/presetParts'
import type { PresetMode } from '@/lib/collections/types'

export const templateReciterId = 'alafasy'
export const templateManifestPath = 'templates/manifest.json'

export interface VideoTemplate {
  key: string
  kind: PresetMode
  presetId: string
  title: string
  note: string
  surah: number
  fromAyat: number
  toAyat: number
  partLabel: string
  sceneKey: string
}

export interface TemplateManifestEntry {
  key: string
  durationMs: number
  reciterName: string
  renderedAt: string
}

const kinds: PresetMode[] = ['duas', 'masnoon']
const scenePool = backgroundScenes.filter((s) => s.key !== 'golden-dusk').map((s) => s.key)

export function videoTemplates(): VideoTemplate[] {
  const list = kinds.flatMap((kind) =>
    presetCollections[kind].flatMap((preset) => {
      const parts = presetParts(preset)
      return parts.map((part, index) => ({
        key: `${kind}/${preset.id}${parts.length > 1 ? `-part-${index + 1}` : ''}`,
        kind,
        presetId: preset.id,
        title: preset.title,
        note: preset.note,
        surah: preset.surah,
        fromAyat: part.fromAyat,
        toAyat: part.toAyat,
        partLabel: parts.length > 1 ? part.label : '',
      }))
    }),
  )
  return list.map((t, i) => ({ ...t, sceneKey: scenePool[i % scenePool.length]! }))
}

export const findVideoTemplate = (key: string) => videoTemplates().find((t) => t.key === key)
export const templateVideoPath = (key: string) => `templates/videos/${key}.mp4`
export const templateThumbPath = (key: string) => `templates/videos/${key}.jpg`
export const templateFileName = (key: string) => `jariyah-${key.replace('/', '-')}.mp4`
export const templateReference = (t: VideoTemplate) => `${t.surah}:${t.fromAyat}${t.toAyat > t.fromAyat ? `–${t.toAyat}` : ''}`
