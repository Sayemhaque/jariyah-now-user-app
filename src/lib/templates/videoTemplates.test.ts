import { describe, it, expect } from 'vitest'
import { backgroundScenes } from '@/lib/backgroundPresets'
import { findVideoTemplate, templateFileName, templateReference, templateThumbPath, templateVideoPath, videoTemplates } from './videoTemplates'

describe('videoTemplates', () => {
  const list = videoTemplates()

  it('has one video per Quranic dua and per masnoon surah part', () => {
    expect(list.filter((t) => t.kind === 'duas')).toHaveLength(47)
    const mulk = list.filter((t) => t.presetId === 'mulk')
    expect(mulk.map((t) => t.key)).toEqual(['masnoon/mulk-part-1', 'masnoon/mulk-part-2', 'masnoon/mulk-part-3'])
    expect(mulk[0]!.partLabel).toBe('Part 1 · Ayat 1–10')
    list.forEach((t) => expect(t.toAyat - t.fromAyat).toBeLessThan(10))
  })

  it('gives every video a unique key and a real background', () => {
    expect(new Set(list.map((t) => t.key)).size).toBe(list.length)
    const scenes = new Set(backgroundScenes.map((s) => s.key))
    list.forEach((t) => expect(scenes.has(t.sceneKey)).toBe(true))
    expect(new Set(list.slice(0, 10).map((t) => t.sceneKey)).size).toBe(10)
  })

  it('builds storage paths, file names and references from the key', () => {
    const dua = findVideoTemplate('duas/dunya-akhirah')!
    expect(templateVideoPath(dua.key)).toBe('templates/videos/duas/dunya-akhirah.mp4')
    expect(templateThumbPath(dua.key)).toBe('templates/videos/duas/dunya-akhirah.jpg')
    expect(templateFileName(dua.key)).toBe('jariyah-duas-dunya-akhirah.mp4')
    expect(templateReference(dua)).toBe('2:201')
    expect(templateReference(findVideoTemplate('masnoon/baqarah-end')!)).toBe('2:285–286')
    expect(findVideoTemplate('../etc/passwd')).toBeUndefined()
  })
})
