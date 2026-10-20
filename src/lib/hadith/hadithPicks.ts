import { isShortHadith } from './hadithText'
import type { Hadith } from './types'

export const shortHadithLength = 420
export const oneCardHadithLength = 900

export const shareableHadiths = (hadiths: Hadith[], shortOnly = true) =>
  hadiths.filter((h) => h.authentic && isShortHadith(h.text, shortOnly ? shortHadithLength : oneCardHadithLength))

export const defaultHadithSelection = { book: 'bukhari', section: 78 }
