import type { Surah, AyatData } from './types'
import { buildAyatAudioUrl } from './reciters'
import { SURAHS_FALLBACK } from './surahs-fallback'
import { fetchWithTimeout, isFetchAbort } from './fetchWithTimeout'
import { logger } from './logger'

// --- API base URLs -----------------------------------------------------
// UmmahAPI is the primary upstream for surah metadata + ayat text +
// translation + reciter audio URLs.
const UMMAHAPI_BASE =
  typeof process !== 'undefined' && process.env?.UMMAHAPI_BASE_URL
    ? process.env.UMMAHAPI_BASE_URL
    : 'https://ummahapi.com/api'

/**
 * Build the standard headers for an UmmahAPI request. The X-API-Key is
 * required for every endpoint and is exposed to the client via the
 * `NEXT_PUBLIC_UMMAHAPI_KEY` env var (so it must be prefixed with
 * NEXT_PUBLIC_ for the bundler to inline it into client bundles).
 */
export function ummahHeaders(): HeadersInit {
  const apiKey =
    typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_UMMAHAPI_KEY
      ? process.env.NEXT_PUBLIC_UMMAHAPI_KEY
      : ''
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (apiKey) headers['X-API-Key'] = apiKey
  return headers
}

// --- types for the upstream API responses ------------------------------
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
  // Reciter audio URLs (one per reciter). UmmahAPI returns an array of
  // { reciter_id, reciter, style, surah_audio, ayah_audio } objects.
  audio?: UmmahAudioItem[]
  audio_urls?: UmmahAudioItem[]
}

// --- in-memory cache ----------------------------------------------------
const surahCache: { list?: Surah[]; byNumber: Map<number, Surah> } = {
  list: undefined,
  byNumber: new Map(),
}

/**
 * Fetch the list of all 114 surahs from UmmahAPI. Falls back to the bundled
 * list on error so the UI never blocks — users can still pick a surah even
 * if the live API is down or the API key is missing/invalid.
 */
export async function fetchSurahs(): Promise<Surah[]> {
  if (surahCache.list) return surahCache.list

  try {
    const res = await fetchWithTimeout(`${UMMAHAPI_BASE}/quran/surahs`, {
      headers: ummahHeaders(),
      cache: 'force-cache',
      // Next.js revalidate tag — surah metadata never changes, cache for 24h.
      next: { revalidate: 86_400 },
    })
    if (!res.ok) {
      throw new Error(`UmmahAPI /quran/surahs returned ${res.status}`)
    }
    const json = (await res.json()) as UmmahSurahsResponse

    // Defensive: handle multiple response shapes — top-level array, nested
    // `data` array, or `data.surahs` array.
    const raw: UmmahSurah[] = Array.isArray(json.data)
      ? (json.data as UmmahSurah[])
      : Array.isArray(json.surahs)
        ? json.surahs
        : Array.isArray(json.data?.surahs)
          ? json.data.surahs
          : []

    const list: Surah[] = raw.map((s) => {
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
    if (!list.length) throw new Error('empty surah list')
    surahCache.list = list
    list.forEach((s) => surahCache.byNumber.set(s.number, s))
    return list
  } catch (err) {
    // Graceful degradation: fall back to the bundled list rather than
    // breaking the whole UI. Log the failure so we know about it.
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

/**
 * Resolve audio duration by loading the MP3 metadata via an <audio> element
 * in the browser. Returns 0 if the duration can't be determined (the caller
 * treats 0 as "unknown" and the seek bar still works, just without a precise
 * total).
 */
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

/**
 * Extract the per-ayah audio URL from UmmahAPI's `audio` array. Matches on
 * the `reciter_id` field (UmmahAPI's identifier for each reciter — 1..13 in
 * the default reciter set) and prefers the `ayah_audio` field (per-ayah MP3
 * on everyayah.com). Returns null if no match is found so the caller can
 * fall back to the everyayah.com URL constructed from the audio key.
 */
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

/**
 * Fetch full data for a single ayat: Arabic text, translation,
 * transliteration, and audio URL. All from UmmahAPI.
 *
 * @param surah            Surah number (1..114)
 * @param ayat             Ayat number within the surah
 * @param recitationId     UmmahAPI reciter ID (1..13) — used to pick the
 *                         right audio URL from the response's audio array.
 * @param audioKey         everyayah.com audio key (e.g. "Alafasy_128kbps")
 *                         used as a fallback if UmmahAPI doesn't return an
 *                         audio URL for this reciter.
 * @param surahName        English surah name (denormalized onto the slide)
 * @param surahNameArabic  Arabic surah name (denormalized onto the slide)
 * @param translationEdition  UmmahAPI translation key (e.g. "bengali")
 */
export async function fetchAyatData(
  surah: number,
  ayat: number,
  recitationId: number,
  audioKey: string,
  surahName: string,
  surahNameArabic: string,
  translationEdition: string = 'bengali',
): Promise<AyatData | null> {
  const ayahUrl = `${UMMAHAPI_BASE}/quran/surah/${surah}/ayah/${ayat}?translation=${encodeURIComponent(
    translationEdition,
  )}&script=uthmani`

  let ayahRes: Response | null = null
  try {
    ayahRes = await fetchWithTimeout(ayahUrl, {
      headers: ummahHeaders(),
      cache: 'force-cache',
      next: { revalidate: 604_800 }, // 7 days — verse text + translation are stable
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

  if (!ayahRes || !ayahRes.ok) {
    return null
  }

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

  // The verse can live under `data`, `data.verse`, or `verse` depending
  // on the response envelope. Handle all three.
  const verse: UmmahAyah | undefined =
    json.verse ??
    (json.data && 'verse' in (json.data as object)
      ? (json.data as { verse?: UmmahAyah }).verse
      : (json.data as UmmahAyah | undefined))

  if (!verse) return null

  // Arabic text — try every plausible field name.
  const arabicText =
    verse.arabic ?? verse.text_uthmani ?? verse.uthmani ?? verse.text ?? ''
  if (!arabicText) return null

  // Translation — primary `translation` field, with a fallback to the
  // `translations` object keyed by the requested edition.
  let translation =
    verse.translation ?? verse.translated_text ?? ''
  if (!translation && verse.translations) {
    translation = verse.translations[translationEdition] ?? ''
  }
  // Final fallback: pick the first available translation if the requested
  // edition isn't in the map. This keeps the UI populated even when
  // UmmahAPI's translation key set drifts from ours.
  if (!translation && verse.translations) {
    const first = Object.values(verse.translations)[0]
    if (first) translation = first
  }

  // Transliteration — can be a string or an object with `.text`.
  const translitRaw = verse.transliteration
  const transliteration =
    typeof translitRaw === 'object'
      ? translitRaw?.text ?? translitRaw?.romanized ?? ''
      : (translitRaw as string | undefined) ?? verse.romanized ?? ''

  // Audio URL — find the reciter's entry in the audio array. Fall back
  // to the everyayah.com CDN URL constructed from the audio key.
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
    audioDurationMs: 0, // filled in later by the store
    surahName,
    surahNameArabic,
  }
}
