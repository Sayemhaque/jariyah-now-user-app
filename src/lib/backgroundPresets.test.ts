import { describe, expect, it } from 'vitest'
import {
  getBackgroundPresetUrl,
  getEffectiveBackgroundUrl,
  getBackgroundRenderFps,
  isExportSafeBackgroundVideo,
  normalizeBackgroundVideoUrl,
} from './backgroundPresets'

describe('backgroundPresets', () => {
  it('normalizes legacy heavy motion background URLs to safe variants', () => {
    expect(
      normalizeBackgroundVideoUrl('/backgrounds/videos/15478014_2160_3840_60fps.mp4'),
    ).toBe('/backgrounds/videos/motion-bg-1-safe.mp4')
  })

  it('returns orientation-aware twilight mosque background', () => {
    expect(getBackgroundPresetUrl('twilight-mosque', 'portrait')).toBe(
      '/backgrounds/twilight-mosque-portrait.png',
    )
    expect(getBackgroundPresetUrl('twilight-mosque', 'landscape')).toBe(
      '/backgrounds/twilight-mosque.png',
    )
  })

  it('resolves motion preset selections to normalized safe assets', () => {
    expect(
      getEffectiveBackgroundUrl(
        'motion-bg-2',
        '/backgrounds/videos/15870451_2160_3840_60fps.mp4',
        'portrait',
      ),
    ).toBe('/backgrounds/videos/motion-bg-2-safe.mp4')
  })

  it('marks normalized motion backgrounds as export-safe', () => {
    expect(
      isExportSafeBackgroundVideo(
        'motion-bg-3',
        '/backgrounds/videos/motion-bg-3-safe.mp4',
      ),
    ).toBe(true)
  })

  it('caps video background renders to their preset fps', () => {
    expect(
      getBackgroundRenderFps(
        'motion-bg-1',
        '/backgrounds/videos/motion-bg-1-safe.mp4',
        30,
      ),
    ).toBe(24)
    expect(
      getBackgroundRenderFps(
        'forest',
        '/backgrounds/forest.png',
        30,
      ),
    ).toBe(30)
  })
})
