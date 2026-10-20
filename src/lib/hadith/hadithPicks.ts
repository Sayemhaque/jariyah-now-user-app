import { isShortHadith } from './hadithText'
import type { Hadith } from './types'

export const shareableHadiths = (hadiths: Hadith[], shortOnly = true) => hadiths.filter((h) => h.authentic && (!shortOnly || isShortHadith(h.text)))

export const defaultHadithSelection = { book: 'bukhari', section: 78 }
