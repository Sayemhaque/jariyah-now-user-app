import type { Surah, WordTiming, AyatData } from './types'
import { buildAyatAudioUrl } from './reciters'
import { SURAHS_FALLBACK } from './surahs-fallback'
import { fetchWithTimeout, isFetchAbort } from './fetchWithTimeout'
import { logger } from './logger'

// --- API base URLs -----------------------------------------------------
// These have sensible defaults and are only overridden via env on the server.
// We read them lazily so this module is safe to import from client bundles
// (the env validator only runs on the server).
const ALQURAN_BASE =
  typeof process !== 'undefined' && process.env?.ALQURAN_CLOUD_BASE_URL
    ? process.env.ALQURAN_CLOUD_BASE_URL
    : 'https://api.alquran.cloud/v1'
const QURAN_COM_BASE =
  typeof process !== 'undefined' && process.env?.QURAN_COM_API_BASE_URL
    ? process.env.QURAN_COM_API_BASE_URL
    : 'https://api.quran.com/api/v4'

// --- types for the upstream API responses ------------------------------
// We define these locally because the alquran.cloud / quran.com APIs don't
// publish TypeScript types. Keeping them narrow lets the compiler catch any
// drift if the response shape changes.

interface AlquranCloudSurah {
  number: number
  name: string
  englishName: string
  englishNameTranslation?: string
  numberOfAyahs: number
  revelationType: 'Meccan' | 'Medinan'
}

interface AlquranCloudResponse {
  data: AlquranCloudSurah[] | AlquranCloudAyah
}

interface AlquranCloudAyah {
  text: string
}

interface QuranComWord {
  text_uthmani?: string
  text?: string
  position?: number
  transliteration?: string
  audio_segment?: {
    timestamp_ms?: number
    duration_ms?: number
    start_time?: number
    duration?: number
  }
  segment?: {
    timestamp_ms?: number
    duration_ms?: number
    start_time?: number
    duration?: number
  }
}

interface QuranComVerse {
  words?: QuranComWord[]
}

interface QuranComResponse {
  verses?: QuranComVerse[]
}

// --- in-memory cache ----------------------------------------------------
const surahCache: { list?: Surah[]; byNumber: Map<number, Surah> } = {
  list: undefined,
  byNumber: new Map(),
}

/**
 * Fetch the list of all 114 surahs. Falls back to the bundled list on error
 * so the UI never blocks — users can still pick a surah even if the live API
 * is down.
 */
export async function fetchSurahs(): Promise<Surah[]> {
  if (surahCache.list) return surahCache.list

  try {
    const res = await fetchWithTimeout(`${ALQURAN_BASE}/surah`, {
      cache: 'force-cache',
      // Next.js revalidate tag — surah metadata never changes, cache for 24h.
      next: { revalidate: 86_400 },
    })
    if (!res.ok) {
      throw new Error(`alquran.cloud /surah returned ${res.status}`)
    }
    const json = (await res.json()) as AlquranCloudResponse
    const list: Surah[] = ((json.data as AlquranCloudSurah[]) ?? []).map((s) => ({
      number: s.number,
      name: s.englishName,
      englishName: s.englishNameTranslation ?? s.englishName,
      arabicName: s.name,
      numberOfAyahs: s.numberOfAyahs,
      revelationType: s.revelationType === 'Medinan' ? 'Medinan' : 'Meccan',
    }))
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
 * Fetch a single ayah's Arabic (Uthmani) text and English translation.
 * Returns null on any failure so callers can skip broken ayat gracefully —
 * the rest of the range still loads.
 */
export async function fetchAyatText(
  surah: number,
  ayat: number,
): Promise<{ arabic: string; translation: string } | null> {
  const ref = `${surah}:${ayat}`
  try {
    const [arRes, enRes] = await Promise.all([
      fetchWithTimeout(
        `${ALQURAN_BASE}/ayah/${ref}/quran-uthmani`,
        { cache: 'force-cache', next: { revalidate: 604_800 } }, // 7 days
      ),
      fetchWithTimeout(`${ALQURAN_BASE}/ayah/${ref}/en.asad`, {
        cache: 'force-cache',
        next: { revalidate: 604_800 },
      }),
    ])
    if (!arRes.ok || !enRes.ok) throw new Error('ayah fetch failed')
    const arJson = (await arRes.json()) as AlquranCloudResponse
    const enJson = (await enRes.json()) as AlquranCloudResponse
    const arabic = (arJson.data as AlquranCloudAyah)?.text ?? ''
    const translation = (enJson.data as AlquranCloudAyah)?.text ?? ''
    if (!arabic) return null
    return { arabic, translation }
  } catch (err) {
    logger.warn('fetchAyatText failed', {
      ref,
      error: err instanceof Error ? err.message : String(err),
    })
    return null
  }
}

/**
 * Fetch word-level timing data via our own /api/timings proxy (avoids CORS).
 * Returns an empty word list if the request fails — the caller can still
 * render the ayat without word-level highlighting. This is the graceful
 * degradation path called out in the production spec.
 */
export async function fetchWordTimings(
  surah: number,
  ayat: number,
  recitationId: number,
): Promise<WordTiming[]> {
  try {
    const url = `/api/timings?surah=${surah}&ayat=${ayat}&recitationId=${recitationId}`
    const res = await fetchWithTimeout(url, { next: { revalidate: 86_400 } })
    if (!res.ok) return []
    const json = (await res.json()) as QuranComResponse
    const verses = json?.verses
    if (!verses || !verses.length) return []
    const wordsRaw = verses[0]?.words
    if (!wordsRaw) return []

    const words: WordTiming[] = wordsRaw
      .map((w): WordTiming | null => {
        const seg = w.audio_segment ?? w.segment
        const startMs = seg?.timestamp_ms ?? seg?.start_time ?? null
        const durMs = seg?.duration_ms ?? seg?.duration ?? null
        const text = w.text_uthmani ?? w.text ?? ''
        if (!text) return null
        return {
          text,
          position: w.position ?? 0,
          startMs: typeof startMs === 'number' ? startMs : 0,
          endMs:
            typeof startMs === 'number' && typeof durMs === 'number'
              ? startMs + durMs
              : 0,
          transliteration: w.transliteration ?? undefined,
        }
      })
      .filter((w): w is WordTiming => w !== null)

    return words
  } catch (err) {
    logger.warn('fetchWordTimings failed', {
      surah,
      ayat,
      recitationId,
      error: err instanceof Error ? err.message : String(err),
    })
    return []
  }
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
 * Fetch full data for a single ayat: text, translation, word timings, and the
 * audio URL. Audio duration is resolved lazily by the store when the audio
 * is loaded.
 */
export async function fetchAyatData(
  surah: number,
  ayat: number,
  recitationId: number,
  audioKey: string,
  surahName: string,
  surahNameArabic: string,
): Promise<AyatData | null> {
  const [textData, words] = await Promise.all([
    fetchAyatText(surah, ayat),
    fetchWordTimings(surah, ayat, recitationId),
  ])
  if (!textData) return null
  const audioUrl = buildAyatAudioUrl(audioKey, surah, ayat)
  return {
    surahNumber: surah,
    ayatNumber: ayat,
    arabicText: textData.arabic,
    translation: textData.translation,
    words,
    audioUrl,
    audioDurationMs: 0, // filled in later by the store
    surahName,
    surahNameArabic,
  }
}
