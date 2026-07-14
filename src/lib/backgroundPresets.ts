import type { Orientation } from './types'

export interface BackgroundPreset {
  key: string
  label: string
  url: string
  isVideo?: boolean
  emoji?: string
  width?: number
  height?: number
  fps?: number
  durationSec?: number
  exportSafe?: boolean
}

export const BACKGROUND_VIDEO_POLICY = {
  width: 1080,
  height: 1920,
  fps: 30,
  codec: 'h264',
  pixFmt: 'yuv420p',
  keyframeInterval: 30,
} as const

export const TWILIGHT_MOSQUE_URLS: Record<Orientation, string> = {
  portrait: '/backgrounds/twilight-mosque-portrait.png',
  landscape: '/backgrounds/twilight-mosque.png',
}

const LEGACY_VIDEO_URL_ALIASES: Record<string, string> = {
  '/backgrounds/videos/15478014_2160_3840_60fps.mp4':
    '/backgrounds/videos/motion-bg-1-safe.mp4',
  '/backgrounds/videos/15870451_2160_3840_60fps.mp4':
    '/backgrounds/videos/motion-bg-2-safe.mp4',
  '/backgrounds/videos/9620654-hd_1080_1920_30fps.mp4':
    '/backgrounds/videos/motion-bg-3-safe.mp4',
}

export function normalizeBackgroundVideoUrl(url: string): string {
  return LEGACY_VIDEO_URL_ALIASES[url] ?? url
}

export const BG_PRESETS: BackgroundPreset[] = [
  { key: 'twilight-mosque', label: 'Twilight Mosque', url: '/backgrounds/twilight-mosque.png' },
  { key: 'crescent-night', label: 'Crescent Night', url: '/backgrounds/crescent-night.png' },
  { key: 'sunset-mosque', label: 'Sunset Mosque', url: '/backgrounds/sunset-mosque.png' },
  { key: 'twilight-hills', label: 'Twilight Hills', url: '/backgrounds/twilight-hills.png' },
  { key: 'mountain', label: 'Mountain Dawn', url: '/backgrounds/mountain.png' },
  { key: 'desert', label: 'Desert Dusk', url: '/backgrounds/desert.png' },
  { key: 'ocean', label: 'Deep Ocean', url: '/backgrounds/ocean.png' },
  { key: 'forest', label: 'Misty Forest', url: '/backgrounds/forest.png' },
  { key: 'night', label: 'Starlit Night', url: '/backgrounds/night.png' },
  { key: 'mosque', label: 'Mosque Gold', url: '/backgrounds/mosque.png' },
  { key: 'pattern', label: 'Arabesque', url: '/backgrounds/pattern.png' },
  { key: 'rain', label: 'Rain', url: '/backgrounds/videos/rain.mp4', isVideo: true, emoji: '🌧️', width: 720, height: 1280, fps: 24, durationSec: 10, exportSafe: true },
  { key: 'ocean-calm', label: 'Ocean Calm', url: '/backgrounds/videos/ocean-calm.mp4', isVideo: true, emoji: '🌊', width: 720, height: 1280, fps: 24, durationSec: 10, exportSafe: true },
  { key: 'sunset-glow', label: 'Sunset Glow', url: '/backgrounds/videos/sunset-glow.mp4', isVideo: true, emoji: '🌅', width: 720, height: 1280, fps: 24, durationSec: 10, exportSafe: true },
  { key: 'golden-particles', label: 'Golden Particles', url: '/backgrounds/videos/golden-particles.mp4', isVideo: true, emoji: '✨', width: 720, height: 1280, fps: 24, durationSec: 10, exportSafe: true },
  { key: 'ocean-waves', label: 'Ocean Waves', url: '/backgrounds/videos/ocean-waves.mp4', isVideo: true, emoji: '🌊', width: 720, height: 1280, fps: 24, durationSec: 10, exportSafe: true },
  { key: 'forest-mist', label: 'Forest Mist', url: '/backgrounds/videos/forest-mist.mp4', isVideo: true, emoji: '🌲', width: 720, height: 1280, fps: 24, durationSec: 10, exportSafe: true },
  { key: 'aurora', label: 'Aurora', url: '/backgrounds/videos/aurora.mp4', isVideo: true, emoji: '🌌', width: 720, height: 1280, fps: 24, durationSec: 10, exportSafe: true },
  { key: 'cloud-drift', label: 'Cloud Drift', url: '/backgrounds/videos/cloud-drift.mp4', isVideo: true, emoji: '☁️', width: 720, height: 1280, fps: 24, durationSec: 10, exportSafe: true },
  { key: 'motion-bg-1', label: 'Motion BG 1', url: '/backgrounds/videos/motion-bg-1-safe.mp4', isVideo: true, emoji: '🎬', width: 720, height: 1280, fps: 24, durationSec: 7.1, exportSafe: true },
  { key: 'motion-bg-2', label: 'Motion BG 2', url: '/backgrounds/videos/motion-bg-2-safe.mp4', isVideo: true, emoji: '🎬', width: 720, height: 1280, fps: 24, durationSec: 8.1, exportSafe: true },
  { key: 'motion-bg-3', label: 'Motion BG 3', url: '/backgrounds/videos/motion-bg-3-safe.mp4', isVideo: true, emoji: '🎬', width: 720, height: 1280, fps: 24, durationSec: 16.0, exportSafe: true },
]

export function getBackgroundPresetByKey(key: string): BackgroundPreset | undefined {
  return BG_PRESETS.find((preset) => preset.key === key)
}

export function getBackgroundPresetUrl(
  key: string,
  orientation: Orientation = 'portrait',
): string {
  if (key === 'twilight-mosque') {
    return TWILIGHT_MOSQUE_URLS[orientation] ?? TWILIGHT_MOSQUE_URLS.portrait
  }
  return getBackgroundPresetByKey(key)?.url ?? TWILIGHT_MOSQUE_URLS.portrait
}

export function isVideoBackgroundUrl(url: string): boolean {
  return normalizeBackgroundVideoUrl(url).endsWith('.mp4')
}

export function getEffectiveBackgroundUrl(
  backgroundPreset: string,
  backgroundImage: string,
  orientation: Orientation,
): string {
  if (backgroundPreset && backgroundPreset !== 'custom') {
    const preset = getBackgroundPresetByKey(backgroundPreset)
    if (preset?.isVideo) return preset.url
    if (backgroundPreset === 'twilight-mosque') {
      return getBackgroundPresetUrl(backgroundPreset, orientation)
    }
  }
  return normalizeBackgroundVideoUrl(backgroundImage)
}

export function isExportSafeBackgroundVideo(
  backgroundPreset: string,
  backgroundImage: string,
): boolean {
  const normalized = normalizeBackgroundVideoUrl(backgroundImage)
  if (!normalized.endsWith('.mp4')) return true
  const preset = getBackgroundPresetByKey(backgroundPreset)
  return Boolean(preset?.isVideo && preset.exportSafe && preset.url === normalized)
}



export function getBackgroundRenderFps(
  backgroundPreset: string,
  backgroundImage: string,
  fallbackFps: number,
): number {
  const normalized = normalizeBackgroundVideoUrl(backgroundImage)
  if (!normalized.endsWith('.mp4')) return fallbackFps
  const preset = getBackgroundPresetByKey(backgroundPreset)
  return Math.min(preset?.fps ?? fallbackFps, fallbackFps)
}
