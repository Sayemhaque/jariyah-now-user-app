import { hadithBooks } from './hadithBooks'
import { chapterTitle, cleanHadithText, hadithGrade } from './hadithText'
import type { ApiHadith, Hadith, HadithLanguage } from './types'

const mirrors = ['https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1', 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1']

export const findHadithBook = (key: string) => hadithBooks.find((b) => b.key === key)
export const editionName = (book: string, language: HadithLanguage) => `${language === 'bangla' ? 'ben' : 'eng'}-${book}`
export const sectionPath = (book: string, language: HadithLanguage, section: number) => `/editions/${editionName(book, language)}/sections/${section}.json`

async function fetchJson(path: string): Promise<unknown> {
  let lastError: unknown
  for (const mirror of mirrors) {
    try {
      const res = await fetch(mirror + path)
      if (res.ok) return await res.json()
      lastError = new Error(`Hadith API returned ${res.status}`)
    } catch (err) {
      lastError = err
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Hadith API unavailable')
}

export function toHadiths(json: unknown, book: string, language: HadithLanguage, section: number): Hadith[] {
  const meta = findHadithBook(book)
  const chapter = chapterTitle(meta?.sections.find((s) => s[0] === section)?.[1] ?? '')
  const hadiths = ((json as { hadiths?: ApiHadith[] })?.hadiths ?? []).filter((h) => typeof h.text === 'string' && h.text.trim())
  return hadiths.map((h) => ({
    book,
    bookName: meta?.name ?? book,
    number: h.hadithnumber,
    section,
    chapter,
    text: cleanHadithText(h.text, language),
    ...hadithGrade(book, h.grades),
  }))
}

export async function fetchHadithSection(book: string, language: HadithLanguage, section: number): Promise<Hadith[]> {
  const meta = findHadithBook(book)
  const lang = language === 'bangla' && !meta?.bangla ? 'english' : language
  return toHadiths(await fetchJson(sectionPath(book, lang, section)), book, lang, section)
}
