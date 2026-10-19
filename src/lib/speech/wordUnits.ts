import { spokenLetters } from '@/lib/wordTiming'

export interface WordUnit {
  tokens: number[]
  weight: number
  waqf: boolean
}

const waqfMarks = /[ۖ-ۛ]/

export function toWordUnits(words: string[]): WordUnit[] {
  const units: WordUnit[] = []
  words.forEach((word, index) => {
    const letters = spokenLetters(word)
    const last = units[units.length - 1]
    if (letters === 0 && last) {
      last.tokens.push(index)
      last.waqf ||= waqfMarks.test(word)
      return
    }
    units.push({ tokens: [index], weight: Math.max(1, letters), waqf: waqfMarks.test(word) })
  })
  return units
}
