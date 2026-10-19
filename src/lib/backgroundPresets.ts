export type SceneMotif =
  | 'dusk'
  | 'lanterns'
  | 'bokeh'
  | 'starlight'
  | 'arch'
  | 'heavenly'
  | 'girih'
  | 'stars'
  | 'aurora'
  | 'dunes'
  | 'rays'
  | 'arches'

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
    key: 'golden-dusk',
    label: 'Golden Dusk',
    motif: 'dusk',
    palette: { base: ['#16193f', '#5a2c5c', '#d9824c'], pattern: '#ffd27d', accent: '#ffd27d', text: '#fff6ea', translation: '#f6e6d4' },
  },
  {
    key: 'ramadan-lanterns',
    label: 'Ramadan Lanterns',
    motif: 'lanterns',
    palette: { base: ['#0f3b4c', '#082331', '#030c12'], pattern: '#ffe2a8', accent: '#ffcf73', text: '#fbf4e4', translation: '#d9e6e3' },
  },
  {
    key: 'golden-bokeh',
    label: 'Golden Bokeh',
    motif: 'bokeh',
    palette: { base: ['#2b1a0c', '#150c06', '#060302'], pattern: '#f5c76b', accent: '#f5c76b', text: '#fff4df', translation: '#ead9bd' },
  },
  {
    key: 'desert-starlight',
    label: 'Desert Starlight',
    motif: 'starlight',
    palette: { base: ['#141a4a', '#0a0e2c', '#03040d'], pattern: '#e9ddff', accent: '#d6c8ff', text: '#f4f1ff', translation: '#d4cdf0' },
  },
  {
    key: 'moonlit-arch',
    label: 'Moonlit Arch',
    motif: 'arch',
    palette: { base: ['#1a2a55', '#0d1733', '#050913'], pattern: '#e8d3a0', accent: '#e8d3a0', text: '#f5f1e6', translation: '#d6d9e6' },
  },
  {
    key: 'heavenly-light',
    label: 'Heavenly Light',
    motif: 'heavenly',
    palette: { base: ['#4a6fa5', '#27406d', '#0e1a33'], pattern: '#ffe1a0', accent: '#ffe1a0', text: '#ffffff', translation: '#e6edf8' },
  },
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

export const scenePreviewUrl = (key: string) => `/scene-previews/${key}.jpg`

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
