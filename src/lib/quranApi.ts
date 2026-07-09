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
// UmmahAPI is the primary upstream for surah metadata + ayat text +
// translation + reciter audio URLs. The legacy quran.com API is still used
// for word-level timings (via our /api/timings proxy) and for optional
// Tajweed HTML when `useTajweed` is enabled.
const UMMAHAPI_BASE =
  typeof process !== 'undefined' && process.env?.UMMAHAPI_BASE_URL
    ? process.env.UMMAHAPI_BASE_URL
    : 'https://ummahapi.com/api'
const QURAN_COM_BASE =
  typeof process !== 'undefined' && process.env?.QURAN_COM_API_BASE_URL
    ? process.env.QURAN_COM_API_BASE_URL
    : 'https://api.quran.com/api/v4'

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
// We define these locally because UmmahAPI / quran.com don't publish
// TypeScript types. Keeping them narrow lets the compiler catch any drift
// if the response shape changes.

interface UmmahSurah {
  id?: number
  number?: number
  name?: string
  // Arabic name — UmmahAPI uses `name_arabic`, some forks use `arabic_name`
  name_arabic?: string
  arabic_name?: string
  arabicName?: string
  // English name — UmmahAPI uses `name_english`, some forks use `english_name`
  name_english?: string
  english_name?: string
  englishName?: string
  // English translation of the name — UmmahAPI uses `name_translation`
  name_translation?: string
  name_complex?: string
  translated_name?: string
  englishNameTranslation?: string
  // Ayah count — UmmahAPI uses `verses_count`
  verses_count?: number
  ayah_count?: number
  numberOfAyahs?: number
  // Revelation place — UmmahAPI uses `revelation_place` ("makkah"/"madinah")
  revelation_place?: 'makkah' | 'madinah' | 'Meccan' | 'Medinan' | 'meccan' | 'medinan'
  revelation_type?: 'Meccan' | 'Medinan' | 'meccan' | 'medinan'
  revelationType?: 'Meccan' | 'Medinan' | 'meccan' | 'medinan'
}

interface UmmahSurahsResponse {
  success?: boolean
  data?: UmmahSurah[] | { surahs?: UmmahSurah[]; total?: number }
  surahs?: UmmahSurah[]
}

interface UmmahAudioItem {
  reciter_id?: number
  reciterId?: number
  /** Per-ayah MP3 URL — UmmahAPI field name is `ayah_audio`. */
  ayah_audio?: string
  /** Full-surah MP3 URL — UmmahAPI field name is `surah_audio`. */
  surah_audio?: string
  /** Generic fallback field names (older API shapes). */
  url?: string
  audio_url?: string
}

interface UmmahAyahResponse {
  success?: boolean
  data?: UmmahAyah | { verse?: UmmahAyah; surah?: unknown }
  verse?: UmmahAyah
}

interface UmmahAyah {
  surah?: number
  surah_number?: number
  ayah?: number
  ayah_number?: number
  number_in_surah?: number
  verse_key?: string
  // Arabic text (Uthmani script) — UmmahAPI uses `arabic`
  arabic?: string
  text?: string
  text_uthmani?: string
  uthmani?: string
  // Transliteration (Latin) — UmmahAPI returns a plain string
  transliteration?: string | { text?: string; romanized?: string }
  romanized?: string
  // Primary translation (depends on the ?translation= query param).
  // UmmahAPI doesn't currently populate this; translations live in the map.
  translation?: string
  translated_text?: string
  // Map of translation keys → text. UmmahAPI always returns all 12 here.
  translations?: Record<string, string>
  // Reciter audio URLs (one per reciter). UmmahAPI returns an array of
  // { reciter_id, reciter, style, surah_audio, ayah_audio } objects.
  audio?: UmmahAudioItem[]
  audio_urls?: UmmahAudioItem[]
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
  text_uthmani?: string
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
 * Parse UmmahAPI surah list responses into our internal Surah shape.
 */
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

/**
 * Fetch the list of all 114 surahs from UmmahAPI. Falls back to the bundled
 * list on error so the UI never blocks — users can still pick a surah even
 * if the live API is down or the API key is missing/invalid.
 */
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
    const durationEntries = await Promise.all(
      extracted.map(async (w) => ({
        word: w,
        durMs: w.audioUrl ? await getWordAudioDurationMs(w.audioUrl) : 0,
      })),
    )

    const words: WordTiming[] = []
    let cumMs = 0
    for (const { word: w, durMs } of durationEntries) {
      words.push({
        text: w.text ?? '',
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
 * Detect natural phrase boundaries in the actual audio file using
 * energy-based analysis (server-side via /api/audio-breakpoints).
 *
 * Unlike silence detection (which looks for ABSOLUTE silence and
 * fails on continuous recitation), this finds RELATIVE energy dips
 * — the slight quiet moments between phrases that every reciter
 * has, even in Murattal style.
 *
 * Returns boundary timestamps in MILLISECONDS. Empty array on failure.
 */
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
    if (!json.breakpoints || !json.breakpoints.length) return []

    // Convert breakpoint timestamps (seconds) → pause objects (ms).
    // Each breakpoint is a single timestamp (the dip's center). We
    // create a small synthetic pause window around it (±100ms) so
    // the snapping logic has a range to work with.
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

/**
 * Fetch Tajweed HTML for a single ayah from the legacy quran.com API.
 * Used when `useTajweed` is enabled — the response's `text_uthmani` field
 * contains the full Uthmani text with embedded Tajweed diacritics which
 * the client can color-code using the quran.com Tajweed rules palette.
 *
 * Returns null if the request fails so the caller can fall back to the
 * plain Arabic text from UmmahAPI.
 */
async function fetchTajweedHtml(
  surah: number,
  ayat: number,
): Promise<string | null> {
  const verseKey = `${surah}:${ayat}`
  try {
    const url = `${QURAN_COM_BASE}/verses/by_key/${verseKey}?fields=text_uthmani&words=true&word_fields=text_uthmani`
    const res = await fetchWithTimeout(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 604_800 }, // 7 days — Tajweed markup is stable
    })
    if (!res.ok) return null
    const json = (await res.json()) as QuranComResponse
    const verseObj = json?.verse ?? json?.verses?.[0]
    return verseObj?.text_uthmani ?? null
  } catch (err) {
    if (!isFetchAbort(err)) {
      logger.warn('fetchTajweedHtml failed', {
        verseKey,
        error: err instanceof Error ? err.message : String(err),
      })
    }
    return null
  }
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
 * transliteration, audio URL, and (optionally) Tajweed HTML + word-level
 * timings. All upstream calls happen in parallel where possible.
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
 * @param useTajweed       When true, also fetch Tajweed HTML from the
 *                         legacy quran.com API and stash it on the result
 *                         (under `tajweedHtml`). Default false.
 */
export async function fetchAyatData(
  surah: number,
  ayat: number,
  recitationId: number,
  audioKey: string,
  surahName: string,
  surahNameArabic: string,
  translationEdition: string = 'bengali',
  useTajweed: boolean = false,
): Promise<AyatData | null> {
  const isBrowser = typeof window !== 'undefined'
  const ayahUrl = isBrowser
    ? `/api/ayat?surah=${surah}&ayat=${ayat}&translation=${encodeURIComponent(
        translationEdition,
      )}&script=uthmani`
    : `${UMMAHAPI_BASE}/quran/surah/${surah}/ayah/${ayat}?translation=${encodeURIComponent(
        translationEdition,
      )}&script=uthmani`

  const [ayahRes, timingsResult, tajweedHtml] = await Promise.all([
    fetchWithTimeout(ayahUrl, {
      headers: isBrowser ? { Accept: 'application/json' } : ummahHeaders(),
      cache: 'force-cache',
      next: { revalidate: 604_800 },
    }).catch((err) => {
      logger.warn('fetchAyatData: UmmahAPI ayah fetch failed', {
        surah,
        ayat,
        translationEdition,
        error: err instanceof Error ? err.message : String(err),
      })
      return null
    }),
    fetchWordTimings(surah, ayat, recitationId),
    useTajweed ? fetchTajweedHtml(surah, ayat) : Promise.resolve(null),
  ])

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
    words: timingsResult.words,
    audioUrl,
    audioDurationMs: 0, // filled in later by the store
    surahName,
    surahNameArabic,
    // Optional Tajweed HTML — only populated when useTajweed is true.
    ...(tajweedHtml ? { tajweedHtml } : {}),
    // Structural markers — pass through from the timings API response.
    ...timingsResult.structural,
  }
}
