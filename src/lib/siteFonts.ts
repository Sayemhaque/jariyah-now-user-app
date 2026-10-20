import { Anek_Bangla, EB_Garamond, Hind_Siliguri, Inter } from 'next/font/google'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const ebGaramond = EB_Garamond({ variable: '--font-display', subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })
const uiBangla = Hind_Siliguri({ variable: '--font-ui-bangla', subsets: ['bengali', 'latin'], weight: ['400', '500', '600', '700'] })
const displayBangla = Anek_Bangla({ variable: '--font-display-bangla', subsets: ['bengali', 'latin'], weight: ['500', '600', '700'] })

export const siteFontVariables = `${inter.variable} ${ebGaramond.variable} ${uiBangla.variable} ${displayBangla.variable}`
