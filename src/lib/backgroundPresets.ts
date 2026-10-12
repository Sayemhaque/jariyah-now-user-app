export type SceneMotif = 'girih' | 'stars' | 'aurora' | 'dunes' | 'rays' | 'arches'

export interface ScenePalette {
  base: [string, string, string]
  pattern: string
  accent: string
  text: string
  translation: string
}

export interface BackgroundScene {
  key: string
  label: string
  motif: SceneMotif
  palette: ScenePalette
}

export const scenePrefix = 'scene:'
export const customPresetKey = 'custom'

export const backgroundScenes: BackgroundScene[] = [
  {
    key: 'night-gold',
    label: 'Night & Gold',
    motif: 'girih',
    palette: { base: ['#121c38', '#0a1020', '#04060d'], pattern: '#e9c77b', accent: '#e9c77b', text: '#f6eedb', translation: '#e2d6bc' },
  },
  {
    key: 'emerald-sanctuary',
    label: 'Emerald Sanctuary',
    motif: 'arches',
    palette: { base: ['#0f4536', '#08281f', '#03110d'], pattern: '#d9b770', accent: '#e6c47d', text: '#f0f7f1', translation: '#cfe4d7' },
  },
  {
    key: 'royal-amethyst',
    label: 'Royal Amethyst',
    motif: 'stars',
    palette: { base: ['#2f1a57', '#1a0f31', '#0a0616'], pattern: '#f0c987', accent: '#f3cf8e', text: '#f7f1ff', translation: '#ddd0f2' },
  },
  {
    key: 'midnight-aurora',
    label: 'Midnight Aurora',
    motif: 'aurora',
    palette: { base: ['#0b3140', '#061a26', '#02080e'], pattern: '#7fe6cf', accent: '#8ff0d6', text: '#eefcf8', translation: '#c5e9e1' },
  },
  {
    key: 'desert-dawn',
    label: 'Desert Dawn',
    motif: 'dunes',
    palette: { base: ['#7a3b17', '#3b1a0b', '#140804'], pattern: '#ffcf8a', accent: '#ffd28f', text: '#fff5e8', translation: '#f2dcc2' },
  },
  {
    key: 'ocean-depth',
    label: 'Ocean Depth',
    motif: 'rays',
    palette: { base: ['#0a3d5e', '#06233a', '#020b14'], pattern: '#8fdcff', accent: '#8fdcff', text: '#ecf8ff', translation: '#c7e3f2' },
  },
]

export const defaultScene = backgroundScenes[0]!

export const sceneUrl = (key: string) => `${scenePrefix}${key}`

export const isSceneUrl = (url: string) => url.startsWith(scenePrefix)

export function getScene(key: string): BackgroundScene | undefined {
  return backgroundScenes.find((scene) => scene.key === key)
}

export function sceneForUrl(url: string): BackgroundScene | undefined {
  return isSceneUrl(url) ? getScene(url.slice(scenePrefix.length)) : undefined
}

export function isVideoBackgroundUrl(url: string): boolean {
  return url.endsWith('.mp4')
}
