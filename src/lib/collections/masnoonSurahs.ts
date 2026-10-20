import type { QuranPreset } from './types'

export const masnoonSurahs: QuranPreset[] = [
  { id: 'fatiha', title: 'Al-Fatiha', note: 'In every rakah of salah', surah: 1, fromAyat: 1, toAyat: 7 },
  { id: 'ayatul-kursi', title: 'Ayatul Kursi', note: 'After every salah and before sleep', surah: 2, fromAyat: 255, toAyat: 255 },
  { id: 'baqarah-end', title: 'Last two ayat of Al-Baqarah', note: 'At night, they suffice the one who recites them', surah: 2, fromAyat: 285, toAyat: 286 },
  { id: 'imran-end', title: 'End of Aal-Imran', note: 'On waking for tahajjud', surah: 3, fromAyat: 190, toAyat: 200 },
  { id: 'kahf-start', title: 'Al-Kahf — first 10 ayat', note: 'Protection from the Dajjal, on Friday', surah: 18, fromAyat: 1, toAyat: 10 },
  { id: 'kahf-end', title: 'Al-Kahf — last 10 ayat', note: 'On Friday', surah: 18, fromAyat: 101, toAyat: 110 },
  { id: 'sajdah', title: 'As-Sajdah', note: 'Before sleep', surah: 32, fromAyat: 1, toAyat: 30 },
  { id: 'yasin', title: 'Ya-Sin', note: 'The heart of the Quran', surah: 36, fromAyat: 1, toAyat: 83 },
  { id: 'waqiah', title: 'Al-Waqiah', note: 'At night', surah: 56, fromAyat: 1, toAyat: 96 },
  { id: 'hashr-end', title: 'End of Al-Hashr', note: 'Morning and evening', surah: 59, fromAyat: 22, toAyat: 24 },
  { id: 'mulk', title: 'Al-Mulk', note: 'Before sleep, protection in the grave', surah: 67, fromAyat: 1, toAyat: 30 },
  { id: 'ala', title: "Al-A'la", note: 'In Jumuah, Eid and witr', surah: 87, fromAyat: 1, toAyat: 19 },
  { id: 'ghashiyah', title: 'Al-Ghashiyah', note: 'In Jumuah and Eid', surah: 88, fromAyat: 1, toAyat: 26 },
  { id: 'kafirun', title: 'Al-Kafirun', note: 'Before sleep and in sunnah of Fajr', surah: 109, fromAyat: 1, toAyat: 6 },
  { id: 'ikhlas', title: 'Al-Ikhlas', note: 'Three times morning and evening', surah: 112, fromAyat: 1, toAyat: 4 },
  { id: 'falaq', title: 'Al-Falaq', note: 'Three times morning and evening', surah: 113, fromAyat: 1, toAyat: 5 },
  { id: 'nas', title: 'An-Nas', note: 'Three times morning and evening', surah: 114, fromAyat: 1, toAyat: 6 },
]
