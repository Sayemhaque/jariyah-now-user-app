import type { ApiHadith, HadithLanguage } from './types'

const englishCommentary = /\s*\[(Abu\s*['`’]?\s*Eisa|Abu Dawud said|This hadith|Al-Albani|\d+\])[\s\S]*$/i
const bengaliGradeTail = /\s*—\s*(সহীহ|হাসান|যঈফ|দুর্বল|মাওযূ)[\s\S]*$/
const arabicRun = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿][؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿\sً-ٟ().:,!?«»"'’‘\-]*/g
const bengaliRefParens = /\s*\([^()]*[০-৯][^()]*\)/g
const bengaliChapterNumbers = /[০-৯]+\s*[\/—-]\s*\(?[০-৯]+\)?\.?/g
const bengaliCommentaryMarks = [/আব[ূু] ঈসা বলেন/, /\[[\d০-৯]+\]/, /\(?\s*আধুনিক প্রকাশনী/, /(সহীহ|হাসান|যঈফ|দুর্বল|শায|মুনকার)(\s+(সহীহ|গারীব))?\s*[ঃ:]/, /[^।]*এ অনুচ্ছেদে/]
const bengaliTrailingGrade = /[।\s]*(হাসান|সহীহ|গারীব)(\s+(হাসান|সহীহ|গারীব))*\s*।?\s*$/
const narrationMark = /(হতে|থেকে)\s+বর্ণিত/
const authenticGrade = /sahih|hasan/i
const weakGrade = /da'?if|daif|da‘if|mawdu|munkar|shadh|maudu/i
const alwaysAuthentic = new Set(['bukhari', 'muslim'])

const tidy = (text: string) => text.replace(/\s+/g, ' ').replace(/\s*:\s*(?=\S)/g, ': ').replace(/^[\s।.,;:]+/, '').trim()

function dropBengaliHeading(text: string): string {
  const mark = text.search(narrationMark)
  if (mark <= 0) return text
  const before = text.slice(0, mark)
  const cut = Math.max(before.lastIndexOf('।'), before.lastIndexOf('. '))
  return cut >= 0 ? text.slice(cut + 1) : text
}

function cutBengaliCommentary(text: string): string {
  const starts = bengaliCommentaryMarks.map((mark) => text.search(mark)).filter((index) => index > 0)
  const cut = starts.length ? text.slice(0, Math.min(...starts)) : text
  return cut.replace(bengaliTrailingGrade, '।').replace(/।\s*।$/, '।')
}

export function cleanHadithText(text: string, language: HadithLanguage): string {
  if (language === 'english') return tidy(text.replace(englishCommentary, ''))
  const withoutArabic = cutBengaliCommentary(text.replace(bengaliGradeTail, '')).replace(arabicRun, ' ').replace(bengaliRefParens, '').replace(bengaliChapterNumbers, ' ')
  return tidy(dropBengaliHeading(tidy(withoutArabic)))
}

export function hadithGrade(book: string, grades: ApiHadith['grades']): { grade: string; authentic: boolean } {
  if (alwaysAuthentic.has(book)) return { grade: 'Sahih', authentic: true }
  if (!grades?.length) return { grade: '', authentic: true }
  const chosen = grades.find((g) => g.name === 'Al-Albani') ?? grades[0]!
  const grade = chosen.grade.trim()
  return { grade, authentic: authenticGrade.test(grade) && !weakGrade.test(grade) }
}

export const chapterTitle = (name: string) => name.replace(/^The Book (of|on)\s+/i, '').replace(/^Chapters on\s+/i, '').replace(/\s*\((Kitab|Book)[^)]*\)/i, '').trim()

export const isShortHadith = (text: string, maxLength = 420) => text.length >= 40 && text.length <= maxLength
