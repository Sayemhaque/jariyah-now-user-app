import type { Reciter } from './types'

export const reciters: Reciter[] = [
  {
    id: 'alafasy',
    name: 'Mishary Alafasy',
    arabicName: 'مشاري العفاسي',
    style: 'Murattal',
    audioKey: 'Alafasy_128kbps',
    recitationId: 1,
    quranComId: 7,
    avatarColor: '#9333ea',
  },
  {
    id: 'sudais',
    name: 'Abdur-Rahman As-Sudais',
    arabicName: 'عبد الرحمن السديس',
    style: 'Murattal',
    audioKey: 'Abdurrahmaan_As-Sudais_192kbps',
    recitationId: 2,
    quranComId: 3,
    avatarColor: '#1a1a1a',
  },
  {
    id: 'abdulbasit',
    name: 'Abdul Basit',
    arabicName: 'عبد الباسط',
    style: 'Murattal',
    audioKey: 'Abdul_Basit_Murattal_192kbps',
    recitationId: 3,
    quranComId: 2,
    avatarColor: '#7c3aed',
  },
  {
    id: 'abdulbasit_mujawwad',
    name: 'Abdul Basit (Mujawwad)',
    arabicName: 'عبد الباسط مجود',
    style: 'Mujawwad',
    audioKey: 'Abdul_Basit_Mujawwad_192kbps',
    recitationId: 4,
    quranComId: 1,
    avatarColor: '#6d28d9',
  },
  {
    id: 'muaiqly',
    name: 'Maher Al-Muaiqly',
    arabicName: 'ماهر المعيقلي',
    style: 'Murattal',
    audioKey: 'MaherAlMuaiqly128kbps',
    recitationId: 5,
    avatarColor: '#5b21b6',
  },
  {
    id: 'ghamdi',
    name: 'Saad Al-Ghamdi',
    arabicName: 'سعد الغامدي',
    style: 'Murattal',
    audioKey: 'Ghamadi_40kbps',
    recitationId: 6,
    avatarColor: '#4c1d95',
  },
  {
    id: 'rifai',
    name: 'Hani Ar-Rifai',
    arabicName: 'هاني الرفاعي',
    style: 'Murattal',
    audioKey: 'Hani_Rifai_192kbps',
    recitationId: 7,
    quranComId: 5,
    avatarColor: '#a21caf',
  },
  {
    id: 'shatri',
    name: 'Abu Bakr Ash-Shatri',
    arabicName: 'أبو بكر الشاطري',
    style: 'Murattal',
    audioKey: 'Abu_Bakr_Ash-Shaatree_128kbps',
    recitationId: 8,
    quranComId: 4,
    avatarColor: '#86198f',
  },
  {
    id: 'dosari',
    name: 'Yasser Ad-Dosari',
    arabicName: 'ياسر الدوسري',
    style: 'Murattal',
    audioKey: 'Yasser_Ad-Dussary_128kbps',
    recitationId: 9,
    avatarColor: '#701a75',
  },
  {
    id: 'shuraim',
    name: 'Saud Ash-Shuraim',
    arabicName: 'سعود الشريم',
    style: 'Murattal',
    audioKey: 'Saood_ash-Shuraym_128kbps',
    recitationId: 10,
    quranComId: 10,
    avatarColor: '#581c87',
  },
  {
    id: 'juhany',
    name: 'Abdullah Al-Juhany',
    arabicName: 'عبد الله الجهني',
    style: 'Murattal',
    audioKey: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps',
    recitationId: 11,
    avatarColor: '#3b0764',
  },
  {
    id: 'baleela',
    name: 'Abdul Muhsin Al-Baleela',
    arabicName: 'عبد المحسن القاضي',
    style: 'Murattal',
    audioKey: 'Muhsin_Al_Qasim_192kbps',
    recitationId: 12,
    avatarColor: '#0f766e',
  },
  {
    id: 'bujan',
    name: 'Ali Al-Bujan',
    arabicName: 'علي البوان',
    style: 'Murattal',
    audioKey: 'Ali_Jaber_64kbps',
    recitationId: 13,
    avatarColor: '#115e59',
  },
]

export function getReciterById(id: string): Reciter | undefined {
  return reciters.find((r) => r.id === id)
}

export function getReciterByRecitationId(recitationId: number): Reciter | undefined {
  return reciters.find((r) => r.recitationId === recitationId)
}

export const defaultReciterId = 'alafasy'

export function buildAyatAudioUrl(audioKey: string, surah: number, ayat: number): string {
  const s = String(surah).padStart(3, '0')
  const a = String(ayat).padStart(3, '0')
  return `https://everyayah.com/data/${audioKey}/${s}${a}.mp3`
}
