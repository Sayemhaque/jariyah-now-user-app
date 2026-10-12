import { getScene, sceneForUrl, type ScenePalette } from './backgroundPresets'
import type { VideoSettings } from './types'

export function paletteFor(settings: Pick<VideoSettings, 'backgroundPreset' | 'backgroundImage' | 'backgroundPalette'>): ScenePalette | undefined {
  return (getScene(settings.backgroundPreset) ?? sceneForUrl(settings.backgroundImage))?.palette ?? settings.backgroundPalette
}

export function themeColors(palette: ScenePalette) {
  return { fontColor: palette.text, highlightColor: palette.accent, translationColor: palette.translation }
}

const backgroundKeys: (keyof VideoSettings)[] = ['backgroundPreset', 'backgroundImage', 'backgroundPalette']

export function withAutoColors(next: VideoSettings, patch: Partial<VideoSettings>): VideoSettings {
  if (next.autoColors === false) return next
  const backgroundChanged = backgroundKeys.some((key) => key in patch)
  if (!backgroundChanged && patch.autoColors !== true) return next
  const palette = paletteFor(next)
  return palette ? { ...next, ...themeColors(palette) } : next
}
