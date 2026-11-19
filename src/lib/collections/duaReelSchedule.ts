import { quranicDuas } from './quranicDuas'
import type { QuranPreset } from './types'

const scheduleRows = `2:127-129 আল-বাকারা
2:201 আল-বাকারা
2:250 আল-বাকারা
2:285-286 আল-বাকারা
3:8-9 আলে ইমরান
3:16 আলে ইমরান
3:26-27 আলে ইমরান
3:35-36 আলে ইমরান
3:38 আলে ইমরান
3:53 আলে ইমরান
3:147 আলে ইমরান
3:191-194 আলে ইমরান
4:75 আন-নিসা
5:83 আল-মায়িদা
5:114 আল-মায়িদা
7:23 আল-আ'রাফ
7:47 আল-আ'রাফ
7:89 আল-আ'রাফ
7:126 আল-আ'রাফ
7:143 আল-আ'রাফ
7:151 আল-আ'রাফ
7:155-156 আল-আ'রাফ
7:180 আল-আ'রাফ
10:85-86 ইউনুস
11:47 হুদ
14:35-41 ইবরাহিম
17:24 আল-ইসরা
17:80 আল-ইসরা
18:10 আল-কাহফ
19:4-6 মারইয়াম
20:25-35 ত্ব-হা
20:114 ত্ব-হা
21:83 আল-আম্বিয়া
21:87 আল-আম্বিয়া
21:89 আল-আম্বিয়া
23:97-98 আল-মুমিনুন
23:109 আল-মুমিনুন
23:118 আল-মুমিনুন
25:65-66 আল-ফুরকান
25:74 আল-ফুরকান
26:83-89 আশ-শুআরা
27:19 আন-নামল
28:16 আল-কাসাস
28:21 আল-কাসাস
28:24 আল-কাসাস
29:30 আল-আনকাবুত
37:100 আস-সাফফাত
40:7-9 গাফির
46:15 আল-আহকাফ
59:10 আল-হাশর
60:4-5 আল-মুমতাহিনা
66:8 আত-তাহরিম
71:28 নূহ
113:1-5 আল-ফালাক
114:1-6 আন-নাস`

function knownDua(surah: number, fromAyat: number, toAyat: number) {
  return quranicDuas.find((d) => d.surah === surah && d.fromAyat >= fromAyat && d.fromAyat <= toAyat)
}

function parseRow(row: string): QuranPreset {
  const [ref, ...nameParts] = row.trim().split(' ')
  const [surah, ayats] = ref!.split(':').map((part) => part.split('-').map(Number))
  const fromAyat = ayats![0]!
  const toAyat = ayats![1] ?? fromAyat
  const surahNumber = surah![0]!
  const known = knownDua(surahNumber, fromAyat, toAyat)
  return {
    id: `daily-${surahNumber}-${fromAyat}`,
    title: known?.title ?? `Quranic dua ${surahNumber}:${fromAyat}`,
    titleBn: known?.titleBn ?? `কুরআনের দোয়া — সূরা ${nameParts.join(' ')}`,
    note: known?.note ?? '',
    surah: surahNumber,
    fromAyat,
    toAyat,
  }
}

export const duaReelSchedule: QuranPreset[] = scheduleRows.split('\n').map(parseRow)
