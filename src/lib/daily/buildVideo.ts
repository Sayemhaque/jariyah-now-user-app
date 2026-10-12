import { execFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { fetchAyatData, fetchSurahs } from '@/lib/quranApi'
import { fetchVerseTimings } from '@/lib/fetchVerseTimings'
import { reciters, getReciterById } from '@/lib/reciters'
import { bgPresets } from '@/lib/backgroundPresets'
import { videoAttributionLine } from '@/lib/translations'
import { maxAyatsPerVideo } from '@/lib/constants'
import { defaultVideoSettings } from '@/lib/defaultSettings'
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

export const dailyReciterIds = ['alafasy', 'sudais', 'abdulbasit', 'muaiqly', 'shatri', 'dosari', 'shuraim']

export interface DailyVideoOptions {
  now?: Date
  surahOverride?: number
  reciterId?: string
  translationKey?: string
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
  return { ...defaultVideoSettings, backgroundImage, backgroundPreset }
}

export async function buildDailyVideo(opts: DailyVideoOptions = {}): Promise<DailyVideo> {
  const now = opts.now ?? new Date()
  const dayIndex = dhakaDayIndex(now)
  const rand = mulberry32(dayIndex * 2654435761)
  const maxMs = (opts.maxDurationSec ?? 85) * 1000
  const translationKey = opts.translationKey ?? 'bengali'
  const ffprobeBin = opts.ffprobeBin ?? 'ffprobe'

  const reciterPool = dailyReciterIds.map(getReciterById).filter((r): r is Reciter => Boolean(r))
  const reciter =
    opts.reciterId && opts.reciterId !== 'random'
      ? getReciterById(opts.reciterId)
      : reciterPool[Math.floor(rand() * reciterPool.length)]
  if (!reciter) {
    throw new Error(`Unknown reciter "${opts.reciterId}". Valid: ${reciters.map((r) => r.id).join(', ')}`)
  }

  const videoBgs = bgPresets.filter((p) => p.isVideo && p.exportSafe)
  const bg = videoBgs[Math.floor(rand() * videoBgs.length)] ?? bgPresets[0]!

  const surahs = await fetchSurahs()
  const surahNumber = opts.surahOverride ?? pickSurahNumber(dayIndex)
  const surah = surahs.find((s) => s.number === surahNumber)
  if (!surah) throw new Error(`Surah ${surahNumber} not found`)

  for (let attempt = 0; attempt < 5; attempt++) {
    const fromAyat = pickStartAyat(surah.numberOfAyahs, maxAyatsPerVideo, rand)
    const slides: AyatSlide[] = []
    const durations: number[] = []

    for (let ayat = fromAyat; ayat <= surah.numberOfAyahs && slides.length < maxAyatsPerVideo; ayat++) {
      const [fetched, timings] = await Promise.all([
        fetchAyatData(surah.number, ayat, reciter.recitationId, reciter.audioKey, surah.name, surah.arabicName, translationKey),
        reciter.quranComId ? fetchVerseTimings(surah.number, ayat, reciter.quranComId) : Promise.resolve(null),
      ])
      if (!fetched) throw new Error(`Failed to fetch ayat ${surah.number}:${ayat}`)
      const data = timings ? { ...fetched, audioUrl: timings.audioUrl, words: timings.words } : fetched
      const audioDurationMs = await probeDurationMs(data.audioUrl, ffprobeBin)
      durations.push(audioDurationMs)
      if (countAyatsWithinBudget(durations, maxMs, maxAyatsPerVideo) < durations.length) break
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
        ...(data.words ? { words: data.words } : {}),
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
