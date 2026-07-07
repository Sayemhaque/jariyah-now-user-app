import type { Surah, WordTiming, AyatData } from './types'

/**
 * Structural Quran markers for a verse — sourced from the quran.com API's
 * `fields` query param. All fields are optional because some verses don't
 * have all markers (e.g. the very first verses don't have a Ruku number).
 */
export interface AyatStructuralInfo {
  juzNumber?: number
  hizbNumber?: number
  rubElHizbNumber?: number
  rukuNumber?: number
  manzilNumber?: number
  pageNumber?: number
}
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
  /** Per-word MP3 path (e.g. "wbw/001_001_001.mp3"). Used as a fallback
   *  for timing computation when the API doesn't return audio_segment. */
  audio_url?: string | null
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
  /** Some API responses embed transliteration as an object. */
  transliteration?: { text?: string } | string
}

interface QuranComVerse {
  words?: QuranComWord[]
  // Structural markers (requested via `fields=` query param).
  juz_number?: number
  hizb_number?: number
  rub_el_hizb_number?: number
  ruku_number?: number
  manzil_number?: number
  page_number?: number
}

interface QuranComResponse {
  /** /verses/by_key/{key} returns a single verse object under `verse`. */
  verse?: QuranComVerse
  /** /verses/by_keys/{keys} returns an array under `verses`. */
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
  translationEdition: string = 'en.pickthall',
): Promise<{ arabic: string; translation: string } | null> {
  const ref = `${surah}:${ayat}`
  try {
    const [arRes, enRes] = await Promise.all([
      fetchWithTimeout(
        `${ALQURAN_BASE}/ayah/${ref}/quran-uthmani`,
        { cache: 'force-cache', next: { revalidate: 604_800 } }, // 7 days
      ),
      fetchWithTimeout(`${ALQURAN_BASE}/ayah/${ref}/${translationEdition}`, {
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
      translationEdition,
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
 *
 * The quran.com API has two response shapes:
 *   - `/verses/by_key/{key}` returns `{ verse: { words: [...] } }` (singular)
 *   - `/verses/by_keys/{keys}` returns `{ verses: [{ words: [...] }] }` (plural)
 * We handle both.
 *
 * The API USED to return `audio_segment.timestamp_ms` + `duration_ms` per
 * word, but as of 2025 it no longer does. We now compute timings by
 * fetching each word's per-word MP3 (`wbw/NNN_NNN_NNN.mp3` on
 * audio.qurancdn.com), measuring its duration via the browser's <audio>
 * element, and concatenating. This is slower but reliable.
 */
export async function fetchWordTimings(
  surah: number,
  ayat: number,
  recitationId: number,
): Promise<{ words: WordTiming[]; structural: AyatStructuralInfo }> {
  const emptyResult = { words: [], structural: {} }
  try {
    const url = `/api/timings?surah=${surah}&ayat=${ayat}&recitationId=${recitationId}`
    const res = await fetchWithTimeout(url, { next: { revalidate: 86_400 } })
    if (!res.ok) return emptyResult
    const json = (await res.json()) as QuranComResponse

    // Handle BOTH response shapes: `verse.words` (by_key) and
    // `verses[0].words` (by_keys). The old code only checked `verses`,
    // which silently broke word highlighting when the proxy started
    // hitting the by_key endpoint.
    const verseObj = json?.verse ?? json?.verses?.[0] ?? undefined
    const wordsRaw = verseObj?.words
    if (!wordsRaw || !wordsRaw.length) return emptyResult

    // Extract structural markers from the verse object.
    const structural: AyatStructuralInfo = {
      juzNumber: verseObj?.juz_number,
      hizbNumber: verseObj?.hizb_number,
      rubElHizbNumber: verseObj?.rub_el_hizb_number,
      rukuNumber: verseObj?.ruku_number,
      manzilNumber: verseObj?.manzil_number,
      pageNumber: verseObj?.page_number,
    }

    // First pass: extract text + position + transliteration + any
    // embedded segment data (if the API ever brings it back).
    const extracted = wordsRaw
      .map((w): Partial<WordTiming> & { audioUrl?: string | null } => {
        const seg = w.audio_segment ?? w.segment
        const startMs = seg?.timestamp_ms ?? seg?.start_time ?? null
        const durMs = seg?.duration_ms ?? seg?.duration ?? null
        const text = w.text_uthmani ?? w.text ?? ''
        // transliteration can be either a string or { text: string }
        const translit =
          typeof w.transliteration === 'object'
            ? w.transliteration?.text
            : (w.transliteration as string | undefined)
        return {
          text,
          position: w.position ?? 0,
          startMs: typeof startMs === 'number' ? startMs : 0,
          endMs:
            typeof startMs === 'number' && typeof durMs === 'number'
              ? startMs + durMs
              : 0,
          transliteration: translit,
          audioUrl: w.audio_url ?? null,
        }
      })
      .filter((w) => Boolean(w.text))

    if (!extracted.length) return { words: [], structural }

    // If the API returned segment data, use it directly.
    const hasSegments = extracted.every(
      (w) => (w.startMs ?? 0) > 0 && (w.endMs ?? 0) > 0,
    )
    if (hasSegments) {
      return { words: extracted as WordTiming[], structural }
    }

    // Fallback: compute timings by fetching each word's per-word MP3
    // duration and concatenating. The audio_url is a relative path like
    // "wbw/001_001_001.mp3" — we resolve it against audio.qurancdn.com.
    // We do this in the BROWSER (not the API route) because:
    //   1. The browser can play the MP3s directly via <audio>
    //   2. We can parallelize the duration probes
    //   3. The durations are cached in-memory for the session
    const words: WordTiming[] = []
    let cumMs = 0
    for (const w of extracted) {
      const durMs = w.audioUrl
        ? await getWordAudioDurationMs(w.audioUrl)
        : 0
      words.push({
        text: w.text!,
        position: w.position ?? 0,
        startMs: cumMs,
        endMs: cumMs + durMs,
        transliteration: w.transliteration,
      })
      cumMs += durMs
    }

    return { words, structural }
  } catch (err) {
    logger.warn('fetchWordTimings failed', {
      surah,
      ayat,
      recitationId,
      error: err instanceof Error ? err.message : String(err),
    })
    return emptyResult
  }
}

// --- per-word audio duration cache (session-only) ----------------------
// Fetching each word's MP3 to measure duration is expensive (one network
// request per word). We cache the results in-memory for the session so
// re-loading the same ayat is instant. Cleared on page refresh.
const wordDurationCache = new Map<string, number>()

/**
 * Resolve a relative word audio URL (e.g. "wbw/001_001_001.mp3") against
 * the Quran.com audio CDN and measure its duration in milliseconds via
 * an <audio> element. Returns 0 if the duration can't be determined.
 *
 * Browsers cache the MP3 binary, so repeated calls for the same word
 * across different ayats are fast.
 */
function getWordAudioDurationMs(audioUrl: string): Promise<number> {
  // Check cache first
  const cached = wordDurationCache.get(audioUrl)
  if (cached !== undefined) return Promise.resolve(cached)

  // Resolve relative URL
  const fullUrl = audioUrl.startsWith('http')
    ? audioUrl
    : `https://audio.qurancdn.com/${audioUrl}`

  return new Promise<number>((resolve) => {
    if (typeof Audio === 'undefined') {
      resolve(0)
      return
    }
    const audio = new Audio()
    audio.preload = 'metadata'
    let settled = false
    const done = (val: number) => {
      if (settled) return
      settled = true
      wordDurationCache.set(audioUrl, val)
      resolve(val)
    }
    audio.onloadedmetadata = () => {
      const d = audio.duration
      done(isFinite(d) ? d * 1000 : 0)
    }
    audio.onerror = () => done(0)
    // Safety timeout — if the MP3 hangs (rare), don't block the render
    setTimeout(() => done(0), 5000)
    audio.src = fullUrl
  })
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
  translationEdition: string = 'en.pickthall',
): Promise<AyatData | null> {
  const [textData, timingsResult] = await Promise.all([
    fetchAyatText(surah, ayat, translationEdition),
    fetchWordTimings(surah, ayat, recitationId),
  ])
  if (!textData) return null
  const audioUrl = buildAyatAudioUrl(audioKey, surah, ayat)
  return {
    surahNumber: surah,
    ayatNumber: ayat,
    arabicText: textData.arabic,
    translation: textData.translation,
    words: timingsResult.words,
    audioUrl,
    audioDurationMs: 0, // filled in later by the store
    surahName,
    surahNameArabic,
    // Structural markers — pass through from the timings API response.
    ...timingsResult.structural,
  }
}
