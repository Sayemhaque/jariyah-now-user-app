import type { Surah, WordTiming, AyatData } from './types'
import { buildAyatAudioUrl } from './reciters'

/**
 * Static fallback list of all 114 surahs (name + ayah count + revelation type).
 * Used when the live API is unreachable, so the UI never breaks.
 * Format matches the alquran.cloud /surah endpoint.
 */
import { SURAHS_FALLBACK } from './surahs-fallback'

const ALQURAN_BASE = 'https://api.alquran.cloud/v1'

// --- in-memory cache ----------------------------------------------------
const surahCache: { list?: Surah[]; byNumber: Map<number, Surah> } = {
  list: undefined,
  byNumber: new Map(),
}

/**
 * Fetch the list of all 114 surahs. Falls back to the bundled list on error.
 */
export async function fetchSurahs(): Promise<Surah[]> {
  if (surahCache.list) return surahCache.list
  try {
    const res = await fetch(`${ALQURAN_BASE}/surah`, { cache: 'force-cache' })
    if (!res.ok) throw new Error(`alquran.cloud /surah returned ${res.status}`)
    const json = await res.json()
    const list: Surah[] = (json?.data ?? []).map((s: any) => ({
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
    // fall back to bundled list
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
 * Returns null on failure so callers can skip broken ayat gracefully.
 */
export async function fetchAyatText(
  surah: number,
  ayat: number,
): Promise<{ arabic: string; translation: string } | null> {
  try {
    const ref = `${surah}:${ayat}`
    const [arRes, enRes] = await Promise.all([
      fetch(`${ALQURAN_BASE}/ayah/${ref}/quran-uthmani`, { cache: 'force-cache' }),
      fetch(`${ALQURAN_BASE}/ayah/${ref}/en.asad`, { cache: 'force-cache' }),
    ])
    if (!arRes.ok || !enRes.ok) throw new Error('ayah fetch failed')
    const arJson = await arRes.json()
    const enJson = await enRes.json()
    const arabic = arJson?.data?.text ?? ''
    const translation = enJson?.data?.text ?? ''
    if (!arabic) return null
    return { arabic, translation }
  } catch {
    return null
  }
}

/**
 * Fetch word-level timing data via our own /api/timings proxy (avoids CORS).
 * Returns an empty word list if the request fails — caller can still render
 * the ayah with no word-level highlight.
 */
export async function fetchWordTimings(
  surah: number,
  ayat: number,
  recitationId: number,
): Promise<WordTiming[]> {
  try {
    const url = `/api/timings?surah=${surah}&ayat=${ayat}&recitationId=${recitationId}`
    const res = await fetch(url)
    if (!res.ok) return []
    const json = await res.json()
    const verses = json?.verses as any[] | undefined
    if (!verses || !verses.length) return []
    const v = verses[0]
    const wordsRaw = v?.words as any[] | undefined
    if (!wordsRaw) return []
    const words: WordTiming[] = wordsRaw
      .map((w) => {
        const seg = w.audio_segment ?? w.segment ?? {}
        const startMs = seg.timestamp_ms ?? seg.start_time ?? null
        const durMs = seg.duration_ms ?? seg.duration ?? null
        const text = w.text_uthmani ?? w.text ?? ''
        return {
          text,
          position: w.position ?? 0,
          startMs: typeof startMs === 'number' ? startMs : 0,
          endMs: typeof startMs === 'number' && typeof durMs === 'number' ? startMs + durMs : 0,
          transliteration: w.transliteration ?? undefined,
        }
      })
      .filter((w) => w.text)
    return words
  } catch {
    return []
  }
}

/**
 * Fetch audio duration by loading the MP3 metadata via an <audio> element
 * in the browser, or HEAD-probing the URL on the server. We use the
 * browser-side approach in the client store.
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
 * Fetch full data for a single ayat (text + translation + word timings + audio url).
 * Audio duration is resolved lazily by the store when the audio is loaded.
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
  }
}
