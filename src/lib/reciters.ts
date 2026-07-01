import type { Reciter } from './types'

export const RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    name: 'Mishary Alafasy',
    arabicName: 'مشاري العفاسي',
    style: 'Murattal',
    audioKey: 'Alafasy/mp3',
    recitationId: 7,
    avatarColor: '#9333ea',
  },
  {
    id: 'abdulbasit',
    name: 'Abdul Basit',
    arabicName: 'عبد الباسط',
    style: 'Mujawwad',
    audioKey: 'AbdulBasit/Mujawwad/mp3',
    recitationId: 1,
    avatarColor: '#7c3aed',
  },
  {
    id: 'minshawi',
    name: 'Al-Minshawi',
    arabicName: 'المنشاوي',
    style: 'Mujawwad',
    audioKey: 'Minshawi/Mujawwad/mp3',
    recitationId: 5,
    avatarColor: '#6d28d9',
  },
  {
    id: 'husary',
    name: 'Mahmoud Al-Husary',
    arabicName: 'محمود الحصري',
    style: 'Murattal',
    audioKey: 'Husary/mp3',
    recitationId: 2,
    avatarColor: '#5b21b6',
  },
  {
    id: 'sudais',
    name: 'Abdur-Rahman As-Sudais',
    arabicName: 'عبد الرحمن السديس',
    style: 'Murattal',
    audioKey: 'Sudais/mp3',
    recitationId: 6,
    avatarColor: '#1a1a1a',
  },
]

export function getReciterById(id: string): Reciter | undefined {
  return RECITERS.find((r) => r.id === id)
}

export function getReciterByRecitationId(recitationId: number): Reciter | undefined {
  return RECITERS.find((r) => r.recitationId === recitationId)
}

export const DEFAULT_RECITER_ID = 'alafasy'

/**
 * Build the per-ayat MP3 URL on the Quran.com CDN.
 * Example: https://verses.quran.com/Alafasy/mp3/001001.mp3
 * The path uses zero-padded 3-digit surah + zero-padded 3-digit ayat.
 */
export function buildAyatAudioUrl(audioKey: string, surah: number, ayat: number): string {
  const s = String(surah).padStart(3, '0')
  const a = String(ayat).padStart(3, '0')
  return `https://verses.quran.com/${audioKey}/${s}${a}.mp3`
}
