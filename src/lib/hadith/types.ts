export type HadithLanguage = 'english' | 'bangla'
export type HadithSection = [number: number, name: string, firstHadith: number, lastHadith: number]

export interface HadithBook {
  key: string
  name: string
  bangla: boolean
  sections: HadithSection[]
}

export interface ApiHadith {
  hadithnumber: number
  text: string
  grades?: { name: string; grade: string }[]
}

export interface Hadith {
  book: string
  bookName: string
  number: number
  section: number
  chapter: string
  text: string
  grade: string
  authentic: boolean
}

export interface HadithSelection {
  book: string
  section: number
}
