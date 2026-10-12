/**
 * Builds the input props for today's auto-posted video: picks the surah,
 * fetches ayat text + audio, measures audio durations with ffprobe, and
 * trims the excerpt to fit the platform time limit.
 *
 * Server/CLI only (uses child_process + the filesystem).
 */
import { execFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { fetchAyatData, fetchSurahs } from '@/lib/quranApi'
import { RECITERS, getReciterById } from '@/lib/reciters'
import { BG_PRESETS } from '@/lib/backgroundPresets'
import { videoAttributionLine } from '@/lib/translations'
import { MAX_AYATS_PER_VIDEO } from '@/lib/constants'
import type { AyatSlide, Reciter, Surah, VideoSettings } from '@/lib/types'
import type { AyatVideoProps } from '@/remotion/types'
import {
  buildPostMetadata,
  countAyatsWithinBudget,
  dhakaDateKey,
  dhakaDayIndex,
  mulberry32,
  pickStartAyat,
  pickSurahNumber,
  type PostMetadata,
} from './plan'

const execFileAsync = promisify(execFile)

/** Reciters with high-bitrate, consistent audio used for the daily rotation. */
export const DAILY_RECITER_IDS = ['alafasy', 'sudais', 'abdulbasit', 'muaiqly', 'shatri', 'dosari', 'shuraim']

export interface DailyVideoOptions {
  now?: Date
  /** Force a specific surah (1–114) instead of the daily pick. */
  surahOverride?: number
  /** Reciter id from RECITERS, or 'random' for the daily rotation. */
  reciterId?: string
  /** UmmahAPI translation key, e.g. 'bengali' or 'sahiih_international'. */
  translationKey?: string
  /** Max video length. Facebook Reels cap at 90 s, so keep a margin. */
  maxDurationSec?: number
  quality?: '480p' | '720p' | '1080p'
  extraHashtags?: string[]
  ffprobeBin?: string
}

export interface DailyVideo {
  dateKey: string
  surah: Surah
  fromAyat: number
  toAyat: number
  reciter: Reciter
  durationMs: number
  props: AyatVideoProps
  meta: PostMetadata
}

export async function probeDurationMs(url: string, ffprobeBin = 'ffprobe'): Promise<number> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Audio download failed (${res.status}): ${url}`)
  const dir = await mkdtemp(join(tmpdir(), 'daily-audio-'))
  const file = join(dir, 'a.mp3')
  try {
    await writeFile(file, Buffer.from(await res.arrayBuffer()))
    const { stdout } = await execFileAsync(ffprobeBin, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      file,
    ])
    const sec = parseFloat(stdout.trim())
    if (!Number.isFinite(sec) || sec <= 0) throw new Error(`ffprobe returned no duration for ${url}`)
    return Math.round(sec * 1000)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

function baseSettings(backgroundImage: string, backgroundPreset: string): VideoSettings {
  return {
    backgroundImage,
    backgroundPreset,
    overlayStyle: 'bottom-gradient',
    overlayColor: '#000000',
    overlayOpacity: 55,
    fontColor: '#ffffff',
    highlightColor: '#9333ea',
    arabicFontSize: 30,
    translationFontSize: 14,
    fontStyle: 'uthmani',
    arabicFont: 'uthmani',
    bengaliFont: 'sans',
    useTajweed: false,
    showTranslation: true,
    showTransliteration: false,
    orientation: 'portrait',
    autoFitFonts: true,
    textWidth: 'wide',
    textSpacing: 'normal',
  }
}

export async function buildDailyVideo(opts: DailyVideoOptions = {}): Promise<DailyVideo> {
  const now = opts.now ?? new Date()
  const dayIndex = dhakaDayIndex(now)
  const rand = mulberry32(dayIndex * 2654435761)
  const maxMs = (opts.maxDurationSec ?? 85) * 1000
  const translationKey = opts.translationKey ?? 'bengali'
  const ffprobeBin = opts.ffprobeBin ?? 'ffprobe'

  const reciterPool = DAILY_RECITER_IDS.map(getReciterById).filter((r): r is Reciter => Boolean(r))
  const reciter =
    opts.reciterId && opts.reciterId !== 'random'
      ? getReciterById(opts.reciterId)
      : reciterPool[Math.floor(rand() * reciterPool.length)]
  if (!reciter) {
    throw new Error(`Unknown reciter "${opts.reciterId}". Valid: ${RECITERS.map((r) => r.id).join(', ')}`)
  }

  const videoBgs = BG_PRESETS.filter((p) => p.isVideo && p.exportSafe)
  const bg = videoBgs[Math.floor(rand() * videoBgs.length)] ?? BG_PRESETS[0]!

  const surahs = await fetchSurahs()
  const surahNumber = opts.surahOverride ?? pickSurahNumber(dayIndex)
  const surah = surahs.find((s) => s.number === surahNumber)
  if (!surah) throw new Error(`Surah ${surahNumber} not found`)

  // Try a few start points — a single very long ayat (e.g. 2:282) can
  // exceed the time limit on its own.
  for (let attempt = 0; attempt < 5; attempt++) {
    const fromAyat = pickStartAyat(surah.numberOfAyahs, MAX_AYATS_PER_VIDEO, rand)
    const slides: AyatSlide[] = []
    const durations: number[] = []

    for (let ayat = fromAyat; ayat <= surah.numberOfAyahs && slides.length < MAX_AYATS_PER_VIDEO; ayat++) {
      const data = await fetchAyatData(
        surah.number,
        ayat,
        reciter.recitationId,
        reciter.audioKey,
        surah.name,
        surah.arabicName,
        translationKey,
      )
      if (!data) throw new Error(`Failed to fetch ayat ${surah.number}:${ayat}`)
      const audioDurationMs = await probeDurationMs(data.audioUrl, ffprobeBin)
      durations.push(audioDurationMs)
      if (countAyatsWithinBudget(durations, maxMs, MAX_AYATS_PER_VIDEO) < durations.length) break
      slides.push({
        arabicText: data.arabicText,
        translation: data.translation,
        transliteration: data.transliteration || '',
        surahName: surah.name,
        surahNameArabic: surah.arabicName,
        ayatNumber: data.ayatNumber,
        surahNumber: surah.number,
        audioUrl: data.audioUrl,
        audioDurationMs,
      })
    }

    if (slides.length === 0) continue

    const toAyat = slides[slides.length - 1]!.ayatNumber
    const settings = baseSettings(bg.url, bg.key)
    return {
      dateKey: dhakaDateKey(now),
      surah,
      fromAyat,
      toAyat,
      reciter,
      durationMs: slides.reduce((s, x) => s + x.audioDurationMs, 0),
      props: {
        slides,
        settings,
        orientation: 'portrait',
        reciterName: reciter.name,
        attributionLine: videoAttributionLine(translationKey),
        surahName: surah.name,
        surahNameArabic: surah.arabicName,
        totalAyats: slides.length,
        quality: opts.quality ?? '1080p',
        isExport: true,
      },
      meta: buildPostMetadata({
        surah,
        fromAyat,
        toAyat,
        reciterName: reciter.name,
        extraHashtags: opts.extraHashtags,
      }),
    }
  }

  throw new Error(`Could not find an excerpt of surah ${surah.number} that fits in ${maxMs / 1000}s`)
}
