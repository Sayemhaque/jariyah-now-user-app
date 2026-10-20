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
  | 'silk'
  | 'liquid'
  | 'mandala'
  | 'velvet'
  | 'lattice'
  | 'haze'
  | 'ride'
  | 'drive'
  | 'walk'
  | 'sail'
  | 'caravan'
  | 'train'
  | 'reader'
  | 'rain'
  | 'lake'

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
    label: 'সোনালি গোধূলি',
    motif: 'dusk',
    palette: { base: ['#16193f', '#5a2c5c', '#d9824c'], pattern: '#ffd27d', accent: '#ffd27d', text: '#fff6ea', translation: '#f6e6d4' },
  },
  {
    key: 'ramadan-lanterns',
    label: 'রমজানের লণ্ঠন',
    motif: 'lanterns',
    palette: { base: ['#0f3b4c', '#082331', '#030c12'], pattern: '#ffe2a8', accent: '#ffcf73', text: '#fbf4e4', translation: '#d9e6e3' },
  },
  {
    key: 'golden-bokeh',
    label: 'সোনালি আলো',
    motif: 'bokeh',
    palette: { base: ['#2b1a0c', '#150c06', '#060302'], pattern: '#f5c76b', accent: '#f5c76b', text: '#fff4df', translation: '#ead9bd' },
  },
  {
    key: 'desert-starlight',
    label: 'মরুর তারার আলো',
    motif: 'starlight',
    palette: { base: ['#141a4a', '#0a0e2c', '#03040d'], pattern: '#e9ddff', accent: '#d6c8ff', text: '#f4f1ff', translation: '#d4cdf0' },
  },
  {
    key: 'moonlit-arch',
    label: 'চাঁদনী খিলান',
    motif: 'arch',
    palette: { base: ['#1a2a55', '#0d1733', '#050913'], pattern: '#e8d3a0', accent: '#e8d3a0', text: '#f5f1e6', translation: '#d6d9e6' },
  },
  {
    key: 'heavenly-light',
    label: 'স্বর্গীয় আলো',
    motif: 'heavenly',
    palette: { base: ['#4a6fa5', '#27406d', '#0e1a33'], pattern: '#ffe1a0', accent: '#ffe1a0', text: '#ffffff', translation: '#e6edf8' },
  },
  {
    key: 'night-gold',
    label: 'রাত ও সোনালি',
    motif: 'girih',
    palette: { base: ['#121c38', '#0a1020', '#04060d'], pattern: '#e9c77b', accent: '#e9c77b', text: '#f6eedb', translation: '#e2d6bc' },
  },
  {
    key: 'emerald-sanctuary',
    label: 'পান্না রঙের মসজিদ',
    motif: 'arches',
    palette: { base: ['#0f4536', '#08281f', '#03110d'], pattern: '#d9b770', accent: '#e6c47d', text: '#f0f7f1', translation: '#cfe4d7' },
  },
  {
    key: 'royal-amethyst',
    label: 'রাজকীয় বেগুনি',
    motif: 'stars',
    palette: { base: ['#2f1a57', '#1a0f31', '#0a0616'], pattern: '#f0c987', accent: '#f3cf8e', text: '#f7f1ff', translation: '#ddd0f2' },
  },
  {
    key: 'midnight-aurora',
    label: 'মধ্যরাতের আলো',
    motif: 'aurora',
    palette: { base: ['#0b3140', '#061a26', '#02080e'], pattern: '#7fe6cf', accent: '#8ff0d6', text: '#eefcf8', translation: '#c5e9e1' },
  },
  {
    key: 'desert-dawn',
    label: 'মরুর ভোর',
    motif: 'dunes',
    palette: { base: ['#7a3b17', '#3b1a0b', '#140804'], pattern: '#ffcf8a', accent: '#ffd28f', text: '#fff5e8', translation: '#f2dcc2' },
  },
  {
    key: 'ocean-depth',
    label: 'সাগরের গভীরতা',
    motif: 'rays',
    palette: { base: ['#0a3d5e', '#06233a', '#020b14'], pattern: '#8fdcff', accent: '#8fdcff', text: '#ecf8ff', translation: '#c7e3f2' },
  },
  {
    key: 'silk-aurora',
    label: 'রেশমি আলো',
    motif: 'silk',
    palette: { base: ['#06302b', '#041d1c', '#020c0c'], pattern: '#3fd0b0', accent: '#f2cf86', text: '#f3fbf7', translation: '#cfe9e0' },
  },
  {
    key: 'liquid-gold',
    label: 'তরল সোনা',
    motif: 'liquid',
    palette: { base: ['#1a140b', '#0c0905', '#040302'], pattern: '#e8c27a', accent: '#f0cd85', text: '#fff7e6', translation: '#eadcc0' },
  },
  {
    key: 'celestial-mandala',
    label: 'আকাশি নকশা',
    motif: 'mandala',
    palette: { base: ['#101a3a', '#0a1127', '#03060f'], pattern: '#e6c47e', accent: '#ecd08c', text: '#f5f0e2', translation: '#d9d6e8' },
  },
  {
    key: 'velvet-bokeh',
    label: 'মখমলি আলো',
    motif: 'velvet',
    palette: { base: ['#3a1230', '#1e0a1c', '#0b040b'], pattern: '#f2b8a0', accent: '#f6c9a8', text: '#fff3ef', translation: '#ecd3d0' },
  },
  {
    key: 'gold-lattice',
    label: 'সোনালি জালি',
    motif: 'lattice',
    palette: { base: ['#0b2a2e', '#06181b', '#020a0b'], pattern: '#d8b56c', accent: '#e5c27a', text: '#eef8f6', translation: '#cfe3e0' },
  },
  {
    key: 'rose-haze',
    label: 'গোলাপি কুয়াশা',
    motif: 'haze',
    palette: { base: ['#6b3f6e', '#3b2147', '#140a1c'], pattern: '#ffd9b8', accent: '#ffcf9e', text: '#fff6ef', translation: '#f0dde4' },
  },
  {
    key: 'evening-ride',
    label: 'সন্ধ্যার সাইকেল যাত্রা',
    motif: 'ride',
    palette: { base: ['#2a1d4f', '#8a3f62', '#f08a5d'], pattern: '#ffd9a0', accent: '#ffd28a', text: '#fff7ee', translation: '#fbe6d6' },
  },
  {
    key: 'night-drive',
    label: 'রাতের গাড়ি যাত্রা',
    motif: 'drive',
    palette: { base: ['#0a1430', '#121f45', '#1d2b57'], pattern: '#e9e4ff', accent: '#ffd88a', text: '#f5f3ff', translation: '#d6dcf2' },
  },
  {
    key: 'masjid-walk',
    label: 'মসজিদের পথে',
    motif: 'walk',
    palette: { base: ['#0f3a3a', '#1f5a52', '#c98b4a'], pattern: '#ffe6b0', accent: '#ffd98c', text: '#f6fbf7', translation: '#e2efe8' },
  },
  {
    key: 'sunset-sail',
    label: 'সূর্যাস্তের নৌকা',
    motif: 'sail',
    palette: { base: ['#2b1f52', '#9a4766', '#f3925f'], pattern: '#ffd9a0', accent: '#ffd28a', text: '#fff7ee', translation: '#fbe6d6' },
  },
  {
    key: 'desert-caravan',
    label: 'মরুর কাফেলা',
    motif: 'caravan',
    palette: { base: ['#0b0a2a', '#1b1849', '#3a3170'], pattern: '#ece6ff', accent: '#f1d18c', text: '#f6f3ff', translation: '#dcd7f2' },
  },
  {
    key: 'desert-train',
    label: 'মরুর ট্রেন',
    motif: 'train',
    palette: { base: ['#3b2a5c', '#c4664a', '#f6b26b'], pattern: '#ffe2a2', accent: '#ffd98a', text: '#fff8ee', translation: '#fde9d4' },
  },
  {
    key: 'quran-under-tree',
    label: 'গাছের নিচে কুরআন',
    motif: 'reader',
    palette: { base: ['#1d3550', '#4d6f7a', '#e2b77e'], pattern: '#fff0c8', accent: '#ffd98c', text: '#fbfaf4', translation: '#e8efe9' },
  },
  {
    key: 'rainy-evening',
    label: 'বৃষ্টির সন্ধ্যা',
    motif: 'rain',
    palette: { base: ['#0e1426', '#1a2340', '#2b3354'], pattern: '#b9c8e8', accent: '#ffcf8a', text: '#f3f5fb', translation: '#d5dbea' },
  },
  {
    key: 'lantern-lake',
    label: 'লণ্ঠনের হ্রদ',
    motif: 'lake',
    palette: { base: ['#070d22', '#0e1a38', '#16264a'], pattern: '#e7e2ff', accent: '#ffcf7a', text: '#f5f3ff', translation: '#d8dcf0' },
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
