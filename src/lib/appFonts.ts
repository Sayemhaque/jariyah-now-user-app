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
  Cinzel_Decorative,
  Marcellus,
  Italiana,
  DM_Serif_Display,
  Bodoni_Moda,
  Pinyon_Script,
  Allura,
  Lora,
  Mina,
  Baloo_Da_2,
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
const cinzelDecorative = Cinzel_Decorative({ variable: '--font-cinzel-decorative', subsets: ['latin'], weight: ['400', '700'] })
const marcellus = Marcellus({ variable: '--font-marcellus', subsets: ['latin'], weight: ['400'] })
const italiana = Italiana({ variable: '--font-italiana', subsets: ['latin'], weight: ['400'] })
const dmSerif = DM_Serif_Display({ variable: '--font-dm-serif', subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'] })
const bodoni = Bodoni_Moda({ variable: '--font-bodoni', subsets: ['latin'], weight: ['500', '700'], style: ['normal', 'italic'] })
const pinyon = Pinyon_Script({ variable: '--font-pinyon', subsets: ['latin'], weight: ['400'] })
const allura = Allura({ variable: '--font-allura', subsets: ['latin'], weight: ['400'] })
const lora = Lora({ variable: '--font-lora', subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'] })
const mina = Mina({ variable: '--font-mina', subsets: ['bengali', 'latin'], weight: ['400', '700'] })
const balooDa = Baloo_Da_2({ variable: '--font-baloo-da', subsets: ['bengali', 'latin'], weight: ['500', '600', '700'] })
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
  cinzelDecorative,
  marcellus,
  italiana,
  dmSerif,
  bodoni,
  pinyon,
  allura,
  lora,
  mina,
  balooDa,
  anekBangla,
  tiroBangla,
  notoBengali,
  notoSerifBengali,
  hindSiliguri,
]
  .map((font) => font.variable)
  .join(' ')
