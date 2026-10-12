import { EB_Garamond, Inter } from 'next/font/google'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const ebGaramond = EB_Garamond({ variable: '--font-display', subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

export const siteFontVariables = `${inter.variable} ${ebGaramond.variable}`
