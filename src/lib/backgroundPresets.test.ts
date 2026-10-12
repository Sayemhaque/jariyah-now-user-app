import { describe, expect, it } from 'vitest'
import { backgroundScenes, getScene, isSceneUrl, sceneForUrl, sceneUrl } from './backgroundPresets'

const hex = /^#[0-9a-f]{6}$/

describe('background scenes', () => {
  it('have unique keys and complete hex palettes', () => {
    expect(new Set(backgroundScenes.map((s) => s.key)).size).toBe(backgroundScenes.length)
    for (const scene of backgroundScenes) {
      const { base, pattern, accent, text, translation } = scene.palette
      for (const color of [...base, pattern, accent, text, translation]) expect(color).toMatch(hex)
    }
  })

  it('round-trips scene urls', () => {
    expect(sceneUrl('night-gold')).toBe('scene:night-gold')
    expect(isSceneUrl('scene:night-gold')).toBe(true)
    expect(isSceneUrl('data:image/png;base64,abc')).toBe(false)
    expect(sceneForUrl('scene:ocean-depth')?.label).toBe('Ocean Depth')
    expect(sceneForUrl('scene:missing')).toBeUndefined()
    expect(getScene('desert-dawn')?.motif).toBe('dunes')
  })
})
