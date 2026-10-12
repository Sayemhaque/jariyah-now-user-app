import { env } from './env'
import { fetchWithTimeout } from './fetchWithTimeout'
import { logger } from './logger'
import { parseVerseTimings, type VerseTimings } from './verseTimings'

export function quranComVerseUrl(baseUrl: string, surah: number, ayat: number, recitationId: number): string {
  const url = new URL(`${baseUrl}/verses/by_key/${surah}:${ayat}`)
  url.searchParams.set('words', 'true')
  url.searchParams.set('word_fields', 'text_uthmani,position,char_type_name')
  url.searchParams.set('audio', String(recitationId))
  return url.toString()
}

export async function fetchVerseTimings(surah: number, ayat: number, recitationId: number): Promise<VerseTimings | null> {
  const isBrowser = typeof window !== 'undefined'
  const url = isBrowser
    ? `/api/timings?surah=${surah}&ayat=${ayat}&recitationId=${recitationId}`
    : quranComVerseUrl(env.QURAN_COM_API_BASE_URL, surah, ayat, recitationId)
  try {
    const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    return parseVerseTimings(await res.json())
  } catch (err) {
    logger.warn('fetchVerseTimings failed', { surah, ayat, error: err instanceof Error ? err.message : String(err) })
    return null
  }
}
