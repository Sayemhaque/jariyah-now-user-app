import {
  Amiri,
  Cairo,
  Hind_Siliguri,
  Markazi_Text,
  Noto_Naskh_Arabic,
  Noto_Sans_Bengali,
  Noto_Serif_Bengali,
  Reem_Kufi,
  Scheherazade_New,
} from 'next/font/google'

const amiri = Amiri({ variable: '--font-amiri', subsets: ['arabic', 'latin'], weight: ['400', '700'] })
const scheherazade = Scheherazade_New({ variable: '--font-scheherazade', subsets: ['arabic', 'latin'], weight: ['400', '700'] })
const markazi = Markazi_Text({ variable: '--font-markazi-text', subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'] })
const notoNaskhArabic = Noto_Naskh_Arabic({ variable: '--font-noto-naskh-arabic', subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'] })
const reemKufi = Reem_Kufi({ variable: '--font-reem-kufi', subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'] })
const cairo = Cairo({ variable: '--font-cairo', subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'] })
const notoBengali = Noto_Sans_Bengali({ variable: '--font-noto-sans-bengali', subsets: ['bengali'], weight: ['400', '500', '600', '700'] })
const notoSerifBengali = Noto_Serif_Bengali({ variable: '--font-noto-serif-bengali', subsets: ['bengali'], weight: ['400', '500', '600', '700'] })
const hindSiliguri = Hind_Siliguri({ variable: '--font-hind-siliguri', subsets: ['bengali'], weight: ['300', '400', '500', '600', '700'] })

export const appFontVariables = [
  amiri,
  scheherazade,
  markazi,
  notoNaskhArabic,
  reemKufi,
  cairo,
  notoBengali,
  notoSerifBengali,
  hindSiliguri,
]
  .map((font) => font.variable)
  .join(' ')
