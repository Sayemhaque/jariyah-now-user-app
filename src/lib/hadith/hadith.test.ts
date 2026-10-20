import { describe, it, expect } from 'vitest'
import { editionName, findHadithBook, sectionPath, toHadiths } from './hadithApi'
import { hadithBooks } from './hadithBooks'
import { chapterTitle, cleanHadithText, hadithGrade, isShortHadith } from './hadithText'
import engBukhari from './fixtures/eng-bukhari-1.json'
import benBukhari from './fixtures/ben-bukhari-2.json'
import engTirmidhi from './fixtures/eng-tirmidhi-1.json'
import benTirmidhi from './fixtures/ben-tirmidhi-1.json'
import engAbuDawud from './fixtures/eng-abudawud-1.json'

describe('hadith books', () => {
  it('index every chapter of the nine collections with hadith ranges', () => {
    expect(hadithBooks.map((b) => b.key)).toEqual(['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik', 'nawawi', 'qudsi'])
    expect(findHadithBook('bukhari')!.sections).toHaveLength(97)
    hadithBooks.forEach((book) => book.sections.forEach(([, name, first, last]) => {
      expect(name.length).toBeGreaterThan(0)
      expect(last).toBeGreaterThanOrEqual(first)
    }))
  })

  it('builds API paths for English and Bangla editions', () => {
    expect(editionName('muslim', 'bangla')).toBe('ben-muslim')
    expect(sectionPath('bukhari', 'english', 2)).toBe('/editions/eng-bukhari/sections/2.json')
  })
})

describe('toHadiths', () => {
  it('reads Bukhari as sahih with its chapter name', () => {
    const [first] = toHadiths(engBukhari, 'bukhari', 'english', 1)
    expect(first).toMatchObject({ number: 1, chapter: 'Revelation', grade: 'Sahih', authentic: true, bookName: 'Sahih al-Bukhari' })
    expect(first!.text.startsWith("Narrated 'Umar bin Al-Khattab: I heard Allah's Messenger")).toBe(true)
  })

  it('strips the chapter heading, Arabic and cross references from Bangla text', () => {
    const hadiths = toHadiths(benBukhari, 'bukhari', 'bangla', 2)
    expect(hadiths[0]!.text.startsWith('ইবন ‘উমার (রাঃ) হতে বর্ণিত।')).toBe(true)
    hadiths.forEach((h) => {
      expect(h.text).not.toMatch(/[\u0600-\u06FF]/)
      expect(h.text).not.toMatch(/আধুনিক প্রকাশনী|\([^)]*[০-৯]{3}/)
    })
    expect(hadiths[2]!.text.endsWith('যে ত্যাগ করে।')).toBe(true)
  })

  it("drops Abu 'Eisa's commentary and the grade notes from Tirmidhi", () => {
    toHadiths(engTirmidhi, 'tirmidhi', 'english', 1).forEach((h) => expect(h.text).not.toMatch(/Abu `Eisa said/))
    toHadiths(benTirmidhi, 'tirmidhi', 'bangla', 1).forEach((h) => expect(h.text).not.toMatch(/—সহীহ|আবু ঈসা বলেন/))
  })

  it('marks weak narrations so they are never offered for sharing', () => {
    const hadiths = toHadiths(engAbuDawud, 'abudawud', 'english', 1)
    expect(hadiths.find((h) => h.number === 3)).toMatchObject({ grade: 'Daif', authentic: false })
    expect(hadiths.find((h) => h.number === 5)).toMatchObject({ grade: 'Shadh', authentic: false })
    expect(hadiths.find((h) => h.number === 2)).toMatchObject({ grade: 'Sahih', authentic: true })
    expect(hadiths[0]!.chapter).toBe('Purification')
  })
})

describe('shareableHadiths', () => {
  const make = (length: number, authentic = true) => ({ book: 'bukhari', bookName: 'b', number: length, section: 1, chapter: 'c', text: 'x'.repeat(length), grade: 'Sahih', authentic, language: 'english' as const })

  it('keeps every hadith to one card, even with short-only off', async () => {
    const { shareableHadiths } = await import('./hadithPicks')
    const list = [make(300), make(700), make(1500), make(300, false)]
    expect(shareableHadiths(list).map((h) => h.number)).toEqual([300])
    expect(shareableHadiths(list, false).map((h) => h.number)).toEqual([300, 700])
  })
})

describe('hadith helpers', () => {
  it("prefers Al-Albani's grade and rejects weak or fabricated ones", () => {
    expect(hadithGrade('tirmidhi', [{ name: 'Zubair Ali Zai', grade: 'Daif' }, { name: 'Al-Albani', grade: 'Hasan Sahih' }])).toEqual({ grade: 'Hasan Sahih', authentic: true })
    expect(hadithGrade('ibnmajah', [{ name: 'Al-Albani', grade: "Da'if" }]).authentic).toBe(false)
    expect(hadithGrade('nasai', [{ name: 'Al-Albani', grade: 'Mawdu' }]).authentic).toBe(false)
    expect(hadithGrade('muslim', [])).toEqual({ grade: 'Sahih', authentic: true })
  })

  it('cuts the grade notes and commentary that end Bangla Sunan texts', () => {
    const clean = (text: string) => cleanHadithText(text, 'bangla')
    expect(clean('তিনি বললেনঃ লোকটি সফলকাম হয়ে গেল। [1] সহীহ : বুখারী ও মুসলিম।')).toBe('তিনি বললেনঃ লোকটি সফলকাম হয়ে গেল।')
    expect(clean('তিনি বলতে শিখিয়েছেন। হাসানঃ মিশকাত (৪৭৪৪), ইরওয়াহ (৩/২৪৫)। আবূ ঈসা বলেন, এ হাদীসটি গারীব।')).toBe('তিনি বলতে শিখিয়েছেন।')
    expect(clean('তিনি বলেছেনঃ একই সময়ে মাগরিবের সালাত আদায় করলেন। হাসান।')).toBe('তিনি বলেছেনঃ একই সময়ে মাগরিবের সালাত আদায় করলেন।')
    expect(clean('তিনি বললেন, সত্য। আলী (রাযিঃ) হতেও এ অনুচ্ছেদে হাদীস বর্ণিত রয়েছে। আবূ ঈসা বলেন, এ হাদীসটি হাসান সহীহ।')).toBe('তিনি বললেন, সত্য।')
  })

  it('cuts footnotes and publisher references', () => {
    expect(cleanHadithText('he said: "Water is not made impure by anything." [1] [1] See the following versions', 'english')).toBe('he said: "Water is not made impure by anything."')
    expect(cleanHadithText('তোমার মায়ের সঙ্গে উত্তম ব্যবহার করো। [২৬২০] (আধুনিক প্রকাশনী- অনুচ্ছেদ)', 'bangla')).toBe('তোমার মায়ের সঙ্গে উত্তম ব্যবহার করো।')
    expect(cleanHadithText('আমি তাকে সংরক্ষণ করব। আধুনিক প্রকাশনী- ৫৫৫৪, ইসলামিক ফাউন্ডেশন', 'bangla')).toBe('আমি তাকে সংরক্ষণ করব।')
  })

  it('tidies chapter names and spacing', () => {
    expect(chapterTitle('The Book of Faith')).toBe('Faith')
    expect(chapterTitle('Chapters on Supplication')).toBe('Supplication')
    expect(cleanHadithText('Ali narrated that :the Prophet said', 'english')).toBe('Ali narrated that: the Prophet said')
  })

  it('treats a hadith as short enough for a card only within the length limits', () => {
    expect(isShortHadith('x'.repeat(30))).toBe(false)
    expect(isShortHadith('x'.repeat(300))).toBe(true)
    expect(isShortHadith('x'.repeat(600))).toBe(false)
  })
})
