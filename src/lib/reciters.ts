import type { Reciter } from './types'

/**
 * 13 reciters available via UmmahAPI. The `recitationId` field matches
 * UmmahAPI's reciter_id (1..13) — used to look up the audio URL in the
 * `audio` array of an UmmahAPI ayah response.
 *
 * The `audioKey` field is the everyayah.com directory name (e.g.
 * "Alafasy_128kbps") used to construct the fallback audio URL when
 * UmmahAPI doesn't return a direct audio URL for a given reciter.
 *
 * Source: everyayah.com/data/{audioKey}/{sss}{aaa}.mp3
 *   where {sss} = zero-padded 3-digit surah, {aaa} = zero-padded 3-digit ayat.
 */
export const RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    name: 'Mishary Alafasy',
    arabicName: 'مشاري العفاسي',
    style: 'Murattal',
    audioKey: 'Alafasy_128kbps',
    recitationId: 1,
    avatarColor: '#9333ea',
  },
  {
    id: 'sudais',
    name: 'Abdur-Rahman As-Sudais',
    arabicName: 'عبد الرحمن السديس',
    style: 'Murattal',
    audioKey: 'Abdurrahmaan_As-Sudais_192kbps',
    recitationId: 2,
    avatarColor: '#1a1a1a',
  },
  {
    id: 'abdulbasit',
    name: 'Abdul Basit',
    arabicName: 'عبد الباسط',
    style: 'Murattal',
    audioKey: 'Abdul_Basit_Murattal_192kbps',
    recitationId: 3,
    avatarColor: '#7c3aed',
  },
  {
    id: 'abdulbasit_mujawwad',
    name: 'Abdul Basit (Mujawwad)',
    arabicName: 'عبد الباسط مجود',
    style: 'Mujawwad',
    audioKey: 'Abdul_Basit_Mujawwad_192kbps',
    recitationId: 4,
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
    audioKey: 'Saood_ash-Shuraym_128kbps',
    recitationId: 6,
    avatarColor: '#4c1d95',
  },
  {
    id: 'rifai',
    name: 'Hani Ar-Rifai',
    arabicName: 'هاني الرفاعي',
    style: 'Murattal',
    audioKey: 'Husary_128kbps',
    recitationId: 7,
    avatarColor: '#a21caf',
  },
  {
    id: 'shatri',
    name: 'Abu Bakr Ash-Shatri',
    arabicName: 'أبو بكر الشاطري',
    style: 'Murattal',
    audioKey: 'Abu_Bakr_Ash-Shaatree_128kbps',
    recitationId: 8,
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
    avatarColor: '#581c87',
  },
  {
    id: 'juhany',
    name: 'Abdullah Al-Juhany',
    arabicName: 'عبد الله الجهني',
    style: 'Murattal',
    audioKey: 'Abdullah_Basfar_192kbps',
    recitationId: 11,
    avatarColor: '#3b0764',
  },
  {
    id: 'baleela',
    name: 'Abdul Muhsin Al-Baleela',
    arabicName: 'عبد المحسن القاضي',
    style: 'Murattal',
    audioKey: 'AbdulMuhsinAlQasim128kbps',
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
  return RECITERS.find((r) => r.id === id)
}

export function getReciterByRecitationId(recitationId: number): Reciter | undefined {
  return RECITERS.find((r) => r.recitationId === recitationId)
}

export const DEFAULT_RECITER_ID = 'alafasy'

/**
 * Build the per-ayat MP3 URL on the everyayah.com CDN.
 * Example: https://everyayah.com/data/Alafasy_128kbps/001001.mp3
 * The path uses zero-padded 3-digit surah + zero-padded 3-digit ayat.
 */
export function buildAyatAudioUrl(audioKey: string, surah: number, ayat: number): string {
  const s = String(surah).padStart(3, '0')
  const a = String(ayat).padStart(3, '0')
  return `https://everyayah.com/data/${audioKey}/${s}${a}.mp3`
}
