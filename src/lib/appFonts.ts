import {
  Amiri,
  Anek_Bangla,
  Tiro_Bangla,
  Amiri_Quran,
  Cairo,
  Cinzel,
  Galada,
  Atma,
  Great_Vibes,
  Playfair_Display,
  Aref_Ruqaa,
  Cormorant_Garamond,
  Hind_Siliguri,
  Markazi_Text,
  Noto_Naskh_Arabic,
  Noto_Sans_Bengali,
  Noto_Serif_Bengali,
  Reem_Kufi,
  Scheherazade_New,
} from 'next/font/google'

const amiriQuran = Amiri_Quran({ variable: '--font-amiri-quran', subsets: ['arabic', 'latin'], weight: ['400'] })
const amiri = Amiri({ variable: '--font-amiri', subsets: ['arabic', 'latin'], weight: ['400', '700'] })
const scheherazade = Scheherazade_New({ variable: '--font-scheherazade', subsets: ['arabic', 'latin'], weight: ['400', '700'] })
const markazi = Markazi_Text({ variable: '--font-markazi-text', subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'] })
const notoNaskhArabic = Noto_Naskh_Arabic({ variable: '--font-noto-naskh-arabic', subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'] })
const reemKufi = Reem_Kufi({ variable: '--font-reem-kufi', subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'] })
const cairo = Cairo({ variable: '--font-cairo', subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'] })
const cormorant = Cormorant_Garamond({ variable: '--font-cormorant', subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'] })
const cinzel = Cinzel({ variable: '--font-cinzel', subsets: ['latin'], weight: ['400', '500', '600'] })
const galada = Galada({ variable: '--font-galada', subsets: ['bengali', 'latin'], weight: ['400'] })
const atma = Atma({ variable: '--font-atma', subsets: ['bengali', 'latin'], weight: ['500', '600', '700'] })
const greatVibes = Great_Vibes({ variable: '--font-great-vibes', subsets: ['latin'], weight: ['400'] })
const playfair = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'], weight: ['600', '700', '800'], style: ['normal', 'italic'] })
const arefRuqaa = Aref_Ruqaa({ variable: '--font-aref-ruqaa', subsets: ['arabic', 'latin'], weight: ['400', '700'] })
const anekBangla = Anek_Bangla({ variable: '--font-anek-bangla', subsets: ['bengali'], weight: ['400', '500', '600'] })
const tiroBangla = Tiro_Bangla({ variable: '--font-tiro-bangla', subsets: ['bengali'], weight: ['400'] })
const notoBengali = Noto_Sans_Bengali({ variable: '--font-noto-sans-bengali', subsets: ['bengali'], weight: ['400', '500', '600', '700'] })
const notoSerifBengali = Noto_Serif_Bengali({ variable: '--font-noto-serif-bengali', subsets: ['bengali'], weight: ['400', '500', '600', '700'] })
const hindSiliguri = Hind_Siliguri({ variable: '--font-hind-siliguri', subsets: ['bengali'], weight: ['300', '400', '500', '600', '700'] })

export const appFontVariables = [
  amiriQuran,
  amiri,
  scheherazade,
  markazi,
  notoNaskhArabic,
  reemKufi,
  cairo,
  cormorant,
  cinzel,
  galada,
  atma,
  greatVibes,
  playfair,
  arefRuqaa,
  anekBangla,
  tiroBangla,
  notoBengali,
  notoSerifBengali,
  hindSiliguri,
]
  .map((font) => font.variable)
  .join(' ')
