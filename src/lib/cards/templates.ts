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
  { key: 'shamsa', label: 'শামসা', description: 'পাণ্ডুলিপির সূর্য-মেডেল ও সোনালি ফ্রেম' },
  { key: 'carpet', label: 'কার্পেট পাতা', description: 'কুরআনের কার্পেট পাতার মতো চওড়া বর্ডার' },
  { key: 'cartouche', label: 'কার্তুশ', description: 'দুই প্রান্তে চূড়াসহ উসমানি কার্তুশ' },
  { key: 'tezhip', label: 'তেজহিপ', description: 'অলংকৃত শিরোনাম-ফলক ও সোনালি পাতা' },
  { key: 'marble', label: 'মার্বেল', description: 'মার্বেলের শিরা ও সোনার পাতার ফ্রেম' },
  { key: 'minaret', label: 'মিনার', description: 'দুই পাশে উঁচু মিনার' },
  { key: 'window', label: 'খিলান জানালা', description: 'আলো-ঝলমল গোল খিলানের জানালা' },
  { key: 'triplearch', label: 'ত্রিখিলান', description: 'একের ভেতর এক তিনটি খিলান' },
  { key: 'horseshoe', label: 'কর্ডোবা খিলান', description: 'দুই রঙা পাথরের অশ্বখুর খিলান' },
  { key: 'iwan', label: 'ইওয়ান', description: 'বর্ডারসহ মসজিদের প্রবেশ-তোরণ' },
  { key: 'multifoil', label: 'বহুপত্র খিলান', description: 'ঢেউ খেলানো বহুপত্র খিলান' },
  { key: 'rosette', label: 'গোলাপ নকশা', description: 'পেছনে বড় ফুলেল রোজেট' },
  { key: 'girih', label: 'গিরিহ তারা', description: 'বারো কোণা গিরিহ জ্যামিতি' },
  { key: 'hexagon', label: 'ষড়ভুজ', description: 'মৌচাক জমিনে ষড়ভুজ প্যানেল' },
  { key: 'compass', label: 'কিবলা কম্পাস', description: 'পেছনে সূক্ষ্ম কম্পাস-রোজ' },
  { key: 'eclipse', label: 'গ্রহণ', description: 'আলোর বলয়ঘেরা চাঁদ' },
  { key: 'bookmark', label: 'বুকমার্ক', description: 'বইয়ের পাতা ও রেশমি ফিতা' },
  { key: 'pennant', label: 'ঝুলন্ত পতাকা', description: 'দণ্ড থেকে ঝোলানো ব্যানার' },
  { key: 'tablet', label: 'শিলালিপি', description: 'বেদির উপর পাথরের ফলক' },
  { key: 'letter', label: 'চিঠি', description: 'এয়ারমেইল বর্ডার ও মোহর' },
  { key: 'gallery', label: 'গ্যালারি', description: 'সোনালি ফ্রেমে বাঁধানো ছবি' },
  { key: 'cover', label: 'ম্যাগাজিন কভার', description: 'বাম দিকে সাজানো কভার' },
  { key: 'gazette', label: 'সংবাদপত্র', description: 'ক্লাসিক পত্রিকার রেখা' },
  { key: 'sidebar', label: 'পাশের ফিতা', description: 'বাম পাশে তারকাখচিত রঙিন ফিতা' },
  { key: 'stack', label: 'কার্ডের স্তূপ', description: 'একের উপর এক সাজানো কার্ড' },
  { key: 'deckle', label: 'ছেঁড়া কাগজ', description: 'হাতে তৈরি কাগজের ছেঁড়া কিনারা' },
  { key: 'cropmarks', label: 'প্রিন্ট মার্ক', description: 'ছাপাখানার সূক্ষ্ম কাটিং চিহ্ন' },
  { key: 'ribbonframe', label: 'ফিতার ফ্রেম', description: 'উপরে ফিতার ফুল ও বর্ডার' },
  { key: 'spotlight', label: 'স্পটলাইট', description: 'উপর থেকে আলোর রশ্মি' },
  { key: 'aurora', label: 'অরোরা', description: 'নরম রঙের ঢেউ খেলানো আভা' },
  { key: 'dotgrid', label: 'ডট গ্রিড', description: 'আধুনিক বিন্দু-জমিন' },
  { key: 'ripple', label: 'তরঙ্গ বৃত্ত', description: 'পানিতে ছড়ানো বৃত্ত' },
  { key: 'orbit', label: 'কক্ষপথ', description: 'ঘূর্ণায়মান কক্ষপথ ও গ্রহ' },
  { key: 'constellation', label: 'নক্ষত্রমণ্ডল', description: 'কোণে তারার নকশা' },
  { key: 'mountains', label: 'পাহাড়', description: 'নিচে স্তরে স্তরে পাহাড়' },
  { key: 'palms', label: 'খেজুর গাছ', description: 'দুই পাশে খেজুর গাছ' },
  { key: 'garden', label: 'আরাবেস্ক লতা', description: 'উপরে-নিচে প্যাঁচানো লতা' },
  { key: 'laurel', label: 'পাতার মালা', description: 'নিচে জলপাই পাতার মালা' },
  { key: 'tulip', label: 'টিউলিপ', description: 'চার কোণে উসমানি টিউলিপ' },
  { key: 'rain', label: 'রহমতের বৃষ্টি', description: 'উপর থেকে ঝরা বৃষ্টির ফোঁটা' },
  { key: 'bracket', label: 'বন্ধনী', description: 'দুই পাশে অলংকৃত বন্ধনী' },
  { key: 'meander', label: 'চাবি নকশা', description: 'চারপাশে জ্যামিতিক চাবি বর্ডার' },
  { key: 'chevron', label: 'শেভরন', description: 'উপরে-নিচে আঁকাবাঁকা রেখা' },
  { key: 'sunset', label: 'অস্তরাগ', description: 'দিগন্তে ডোরাকাটা সূর্য' },
  { key: 'moonphase', label: 'চাঁদের কলা', description: 'চাঁদের ধাপে ধাপে রূপ' },
  { key: 'garland', label: 'তারার মালা', description: 'ঝুলন্ত তারা, চাঁদ ও ফানুস' },
  { key: 'watercolor', label: 'জলরং', description: 'নরম জলরঙের ছোপ' },
  { key: 'prism', label: 'প্রিজম', description: 'কোণে কাটা কাচের নকশা' },
  { key: 'pearl', label: 'মুক্তার মালা', description: 'চারপাশে মুক্তার সারি' },
  { key: 'lace', label: 'লেস', description: 'ঢেউ খেলানো লেসের কিনারা' },
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
