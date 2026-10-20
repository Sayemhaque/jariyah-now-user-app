import type { CardKind } from './types'

const banglaDigitChars = '০১২৩৪৫৬৭৮৯'

export const bnDigits = (value: number | string) => String(value).replace(/\d/g, (d) => banglaDigitChars[Number(d)]!)

export const banglaEyebrows: Record<CardKind, string> = { hadith: 'হাদিস', azkar: 'আজকার', dua: 'কুরআনের দোয়া', masnoon: 'মাসনূন সূরা' }

const sourceBooks: [string, string][] = [
  ['Sahih al-Bukhari', 'সহীহ বুখারী'],
  ['Sahih Muslim', 'সহীহ মুসলিম'],
  ["Jami' at-Tirmidhi", 'জামে আত-তিরমিজি'],
  ['Sunan Abi Dawud', 'সুনান আবু দাউদ'],
]

export const banglaSource = (source: string) => bnDigits(sourceBooks.reduce((text, [en, bn]) => text.replace(en, bn), source))

export const banglaBookNames: Record<string, string> = {
  bukhari: 'সহীহ বুখারী',
  muslim: 'সহীহ মুসলিম',
  abudawud: 'সুনান আবু দাউদ',
  tirmidhi: 'জামে আত-তিরমিজি',
  nasai: 'সুনান আন-নাসায়ী',
  ibnmajah: 'সুনান ইবনে মাজাহ',
  malik: 'মুয়াত্তা মালিক',
  nawawi: 'ইমাম নববীর চল্লিশ হাদিস',
  qudsi: 'হাদিসে কুদসি',
}

const gradeWords: [RegExp, string][] = [[/sahih/gi, 'সহীহ'], [/hasan/gi, 'হাসান'], [/gharib/gi, 'গারীব'], [/lighairihi/gi, 'লিগাইরিহি']]

export const banglaGrade = (grade: string) => gradeWords.reduce((text, [pattern, word]) => text.replace(pattern, word), grade)

const notes: Record<string, string> = {
  'Morning and evening': 'সকাল ও সন্ধ্যায়',
  'Three times morning and evening': 'সকাল-সন্ধ্যায় তিনবার',
  'Seven times morning and evening': 'সকাল-সন্ধ্যায় সাতবার',
  '100 times a day': 'দিনে ১০০ বার',
  'After salah': 'সালাতের পর',
  'Before sleep': 'ঘুমানোর আগে',
  'On waking': 'ঘুম থেকে উঠে',
  'Leaving home': 'ঘর থেকে বের হওয়ার সময়',
}

export const banglaNote = (note: string | undefined) => (note ? (notes[note] ?? note) : undefined)
