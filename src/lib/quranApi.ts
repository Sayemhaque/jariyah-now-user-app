import type { Surah, AyatData } from './types'
import { buildAyatAudioUrl } from './reciters'
import { SURAHS_FALLBACK } from './surahs-fallback'
import { fetchWithTimeout, isFetchAbort } from './fetchWithTimeout'
import { logger } from './logger'
import { env } from './env'

const UMMAHAPI_BASE = env.UMMAHAPI_BASE_URL

export function ummahHeaders(): HeadersInit {
  const apiKey = env.NEXT_PUBLIC_UMMAHAPI_KEY
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (apiKey) headers['X-API-Key'] = apiKey
  return headers
}

interface UmmahSurah {
  number?: number
  id?: number
  name?: string
  name_english?: string
  englishName?: string
  english_name?: string
  name_translation?: string
  englishNameTranslation?: string
  translated_name?: string
  name_arabic?: string
  arabicName?: string
  arabic_name?: string
  verses_count?: number
  numberOfAyahs?: number
  ayah_count?: number
  revelation_place?: string
  revelationType?: string
  revelation_type?: string
}

interface UmmahSurahsResponse {
  data?: UmmahSurah[] | { surahs?: UmmahSurah[] }
  surahs?: UmmahSurah[]
}

interface UmmahAudioItem {
  reciter_id?: number
  reciterId?: number
  reciter?: string
  style?: string
  surah_audio?: string
  ayah_audio?: string
  url?: string
  audio_url?: string
}

interface UmmahAyahResponse {
  data?: UmmahAyah | { verse?: UmmahAyah }
  verse?: UmmahAyah
}

interface UmmahAyah {
  arabic?: string
  text_uthmani?: string
  uthmani?: string
  text?: string
  translation?: string
  translated_text?: string
  translations?: Record<string, string>
  transliteration?: { text?: string; romanized?: string } | string
  romanized?: string
  audio?: UmmahAudioItem[]
  audio_urls?: UmmahAudioItem[]
}

const surahCache: { list?: Surah[]; byNumber: Map<number, Surah> } = {
  list: undefined,
  byNumber: new Map(),
}

export function parseUmmahSurahsResponse(json: UmmahSurahsResponse): Surah[] {
  const raw: UmmahSurah[] = Array.isArray(json.data)
    ? json.data
    : Array.isArray(json.surahs)
      ? json.surahs
      : Array.isArray(json.data?.surahs)
        ? json.data.surahs
        : []

  return raw.map((s) => {
    const rev = (
      s.revelation_place ??
      s.revelationType ??
      s.revelation_type ??
      ''
    )
      .toString()
      .toLowerCase()

    return {
      number: s.number ?? s.id ?? 0,
      name: s.name_english ?? s.englishName ?? s.english_name ?? s.name ?? '',
      englishName:
        s.name_translation ??
        s.englishNameTranslation ??
        s.translated_name ??
        s.name_english ??
        '',
      arabicName: s.name_arabic ?? s.arabicName ?? s.arabic_name ?? s.name ?? '',
      numberOfAyahs: s.verses_count ?? s.numberOfAyahs ?? s.ayah_count ?? 0,
      revelationType:
        rev === 'madinah' || rev === 'medinan' ? 'Medinan' : 'Meccan',
    }
  })
}

export async function fetchSurahs(): Promise<Surah[]> {
  if (surahCache.list) return surahCache.list

  const isBrowser = typeof window !== 'undefined'

  try {
    const res = await fetchWithTimeout(
      isBrowser ? '/api/surahs' : `${UMMAHAPI_BASE}/quran/surahs`,
      {
        headers: isBrowser ? { Accept: 'application/json' } : ummahHeaders(),
        cache: 'force-cache',
        next: { revalidate: 86_400 },
      },
    )
    if (!res.ok) {
      throw new Error(`Surah list request returned ${res.status}`)
    }

    if (isBrowser) {
      const json = (await res.json()) as { surahs?: Surah[] }
      const list = json.surahs ?? []
      if (!list.length) throw new Error('empty surah list')
      surahCache.list = list
      list.forEach((s) => surahCache.byNumber.set(s.number, s))
      return list
    }

    const json = (await res.json()) as UmmahSurahsResponse
    const list = parseUmmahSurahsResponse(json)
    if (!list.length) throw new Error('empty surah list')
    surahCache.list = list
    list.forEach((s) => surahCache.byNumber.set(s.number, s))
    return list
  } catch (err) {
    if (isFetchAbort(err)) {
      logger.warn('fetchSurahs timed out — using bundled fallback')
    } else {
      logger.warn('fetchSurahs failed — using bundled fallback', {
        error: err instanceof Error ? err.message : String(err),
      })
    }
    surahCache.list = SURAHS_FALLBACK
    SURAHS_FALLBACK.forEach((s) => surahCache.byNumber.set(s.number, s))
    return SURAHS_FALLBACK
  }
}

export function getSurahFromCache(number: number): Surah | undefined {
  return surahCache.byNumber.get(number)
}

export function getAudioDurationMs(url: string): Promise<number> {
  return new Promise((resolve) => {
    if (typeof Audio === 'undefined') {
      resolve(0)
      return
    }
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      const d = audio.duration
      resolve(isFinite(d) ? d * 1000 : 0)
    }
    audio.onerror = () => resolve(0)
    audio.src = url
  })
}

export async function fetchAudioPauses(
  audioUrl: string,
  numBreakpoints?: number,
): Promise<{ start: number; end: number; duration: number }[]> {
  try {
    const res = await fetchWithTimeout('/api/audio-breakpoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl, numBreakpoints }),
    })
    if (!res.ok) return []

    const json = (await res.json()) as {
      breakpoints?: number[]
      duration?: number
    }
    if (!json.breakpoints?.length) return []

    return json.breakpoints.map((t) => ({
      start: t * 1000 - 100,
      end: t * 1000 + 100,
      duration: 200,
    }))
  } catch (err) {
    logger.warn('fetchAudioPauses failed', {
      audioUrl,
      error: err instanceof Error ? err.message : String(err),
    })
    return []
  }
}

function findAudioUrlForReciter(
  audio: UmmahAudioItem[] | undefined,
  reciterId: number,
): string | null {
  if (!audio || !audio.length) return null
  for (const item of audio) {
    const id = item.reciter_id ?? item.reciterId
    if (id === reciterId) {
      const url = item.ayah_audio ?? item.url ?? item.audio_url
      if (url) return url
    }
  }
  return null
}

export async function fetchAyatData(
  surah: number,
  ayat: number,
  recitationId: number,
  audioKey: string,
  surahName: string,
  surahNameArabic: string,
  translationEdition: string = 'bengali',
  _useTajweed: boolean = false,
): Promise<AyatData | null> {
  const isBrowser = typeof window !== 'undefined'
  const ayahUrl = isBrowser
    ? `/api/ayat?surah=${surah}&ayat=${ayat}&translation=${encodeURIComponent(
        translationEdition,
      )}&script=uthmani`
    : `${UMMAHAPI_BASE}/quran/surah/${surah}/ayah/${ayat}?translation=${encodeURIComponent(
        translationEdition,
      )}&script=uthmani`

  let ayahRes: Response | null = null
  try {
    ayahRes = await fetchWithTimeout(ayahUrl, {
      headers: isBrowser ? { Accept: 'application/json' } : ummahHeaders(),
      cache: 'force-cache',
      next: { revalidate: 604_800 },
    })
  } catch (err) {
    logger.warn('fetchAyatData: UmmahAPI ayah fetch failed', {
      surah,
      ayat,
      translationEdition,
      error: err instanceof Error ? err.message : String(err),
    })
    return null
  }

  if (!ayahRes || !ayahRes.ok) return null

  let json: UmmahAyahResponse
  try {
    json = (await ayahRes.json()) as UmmahAyahResponse
  } catch (err) {
    logger.warn('fetchAyatData: failed to parse UmmahAPI response', {
      surah,
      ayat,
      error: err instanceof Error ? err.message : String(err),
    })
    return null
  }

  const verse: UmmahAyah | undefined =
    json.verse ??
    (json.data && 'verse' in (json.data as object)
      ? (json.data as { verse?: UmmahAyah }).verse
      : (json.data as UmmahAyah | undefined))

  if (!verse) return null

  const arabicText =
    verse.arabic ?? verse.text_uthmani ?? verse.uthmani ?? verse.text ?? ''
  if (!arabicText) return null

  let translation = verse.translation ?? verse.translated_text ?? ''
  if (!translation && verse.translations) {
    translation = verse.translations[translationEdition] ?? ''
  }
  if (!translation && verse.translations) {
    const first = Object.values(verse.translations)[0]
    if (first) translation = first
  }

  const translitRaw = verse.transliteration
  const transliteration =
    typeof translitRaw === 'object'
      ? translitRaw?.text ?? translitRaw?.romanized ?? ''
      : (translitRaw as string | undefined) ?? verse.romanized ?? ''

  const audioItems = verse.audio ?? verse.audio_urls
  const audioUrl =
    findAudioUrlForReciter(audioItems, recitationId) ??
    buildAyatAudioUrl(audioKey, surah, ayat)

  return {
    surahNumber: surah,
    ayatNumber: ayat,
    arabicText,
    translation,
    transliteration,
    audioUrl,
    audioDurationMs: 0,
    surahName,
    surahNameArabic,
  }
}
