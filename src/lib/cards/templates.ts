import { cardThemes } from './themes'
import type { CardLayout, CardTheme, CardTitleStyle, CardVariant } from './types'
import { cardVariants, variantSpecs } from './variants'

export interface CardLayoutInfo {
  key: CardLayout
  label: string
  description: string
}

export const cardLayouts: CardLayoutInfo[] = [
  { key: 'frame', label: 'ক্লাসিক ফ্রেম', description: 'সোনালি দ্বৈত ফ্রেম ও নকশাদার কোণ' },
  { key: 'arch', label: 'মেহরাব খিলান', description: 'মেহরাবের খিলানের ভেতরে লেখা' },
  { key: 'editorial', label: 'ম্যাগাজিন', description: 'বাম পাশে সোনালি রেখাসহ ম্যাগাজিন ধাঁচ' },
  { key: 'split', label: 'দুই রঙা', description: 'উপরে গাঢ় রঙের ফিতা, নিচে হালকা পাতা' },
  { key: 'floating', label: 'ভাসমান কার্ড', description: 'নকশার উপর ভেসে থাকা কার্ড' },
  { key: 'quote', label: 'বড় উদ্ধৃতি', description: 'বড় উদ্ধৃতি চিহ্ন ও মোটা লেখা' },
  { key: 'tile', label: 'টাইল বর্ডার', description: 'ইসলামি তারকা টাইলের বর্ডার' },
  { key: 'night', label: 'রাতের আকাশ', description: 'চাঁদ, তারা ও মসজিদের ছায়া' },
  { key: 'botanical', label: 'লতাপাতা', description: 'জলপাই লতা ও গোল ফ্রেম' },
  { key: 'glass', label: 'কাচের প্যানেল', description: 'নরম আলোর উপর কাচের প্যানেল' },
  { key: 'manuscript', label: 'পাণ্ডুলিপি', description: 'শিরোনাম-ফলকসহ পাণ্ডুলিপির পাতা' },
  { key: 'minimal', label: 'মিনিমাল', description: 'শান্ত, খোলামেলা ও সরল' },
  { key: 'medallion', label: 'মেডেলিয়ন', description: 'গোল সোনালি মেডেলের ভেতরে লেখা' },
  { key: 'dome', label: 'গম্বুজ', description: 'মসজিদের গম্বুজের আকৃতির ফ্রেম' },
  { key: 'octagon', label: 'অষ্টভুজ', description: 'আট কোণা ইসলামি প্যানেল' },
  { key: 'khatam', label: 'আট তারা', description: 'পেছনে বড় আট-কোণা তারকা' },
  { key: 'scroll', label: 'গোটানো কাগজ', description: 'দুই প্রান্তে গোটানো পুরোনো কাগজ' },
  { key: 'lantern', label: 'ঝুলন্ত ফানুস', description: 'উপর থেকে ঝোলানো ফানুস' },
  { key: 'ogee', label: 'ওজি খিলান', description: 'সূক্ষ্ম চূড়ার খিলান' },
  { key: 'zellige', label: 'জেলিজ বর্ডার', description: 'চারপাশে মোজাইক বর্ডার' },
  { key: 'pillars', label: 'দুই স্তম্ভ', description: 'দুই পাশে স্তম্ভ ও খিলান' },
  { key: 'halo', label: 'আলোর বলয়', description: 'উপরে আলোর বৃত্ত' },
  { key: 'dawn', label: 'ভোরের আলো', description: 'দিগন্তে উদীয়মান সূর্য' },
  { key: 'dunes', label: 'মরুভূমি', description: 'নিচে বালির ঢেউ' },
  { key: 'ocean', label: 'ঢেউ', description: 'প্রবাহিত ঢেউয়ের রেখা' },
  { key: 'stamp', label: 'ডাকটিকিট', description: 'ছিদ্র করা কিনারার টিকিট' },
  { key: 'paper', label: 'কাগজের পাতা', description: 'রঙিন জমিনে কাগজের পাতা' },
  { key: 'angle', label: 'তির্যক', description: 'কোণে তির্যক রঙের ফিতা' },
  { key: 'capsule', label: 'ক্যাপসুল', description: 'লম্বা গোলাকার প্যানেল' },
  { key: 'lattice', label: 'মাশরাবিয়া', description: 'দুই পাশে জালির নকশা' },
  { key: 'folio', label: 'বইয়ের পাতা', description: 'ক্লাসিক বইয়ের পাতার মতো রেখা' },
  { key: 'crescent', label: 'বাঁকা চাঁদ', description: 'পেছনে বড় বাঁকা চাঁদ' },
]

export interface CardTemplate {
  id: string
  layout: CardLayout
  variant: CardVariant
  theme: CardTheme
  label: string
}

export interface CardDesign {
  layout: CardLayout
  variant: CardVariant
  label: string
}

export const cardDesigns: CardDesign[] = cardVariants.flatMap((variant) =>
  cardLayouts.map((layout) => ({ layout: layout.key, variant, label: `${layout.label} · ${variantSpecs[variant].label}` })),
)

export const templateCount = cardDesigns.length * cardThemes.length

export function templateAt(index: number): CardTemplate {
  const i = ((index % templateCount) + templateCount) % templateCount
  const design = cardDesigns[(i % cardLayouts.length) + cardLayouts.length * (Math.floor(i / cardLayouts.length) % cardVariants.length)]!
  const theme = cardThemes[(i * 37 + Math.floor(i / cardThemes.length)) % cardThemes.length]!
  return { id: `${design.layout}.${design.variant}--${theme.key}`, layout: design.layout, variant: design.variant, theme, label: `${design.label} · ${theme.label}` }
}

export function findCardTemplate(id: string): CardTemplate | undefined {
  const match = /^([a-z]+)\.([a-z]+)--(.+)$/.exec(id)
  const design = cardDesigns.find((d) => d.layout === match?.[1] && d.variant === match?.[2])
  const theme = cardThemes.find((t) => t.key === match?.[3])
  return design && theme ? { id, layout: design.layout, variant: design.variant, theme, label: `${design.label} · ${theme.label}` } : undefined
}

const titleStyles: CardTitleStyle[] = ['serif', 'script', 'display']

export const titleStyleFor = (index: number): { titleStyle: CardTitleStyle; titleGradient: boolean } => ({
  titleStyle: titleStyles[index % titleStyles.length]!,
  titleGradient: index % 4 === 1,
})
