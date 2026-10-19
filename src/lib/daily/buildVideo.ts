import { fetchAyatData, fetchSurahs } from '@/lib/quranApi'
import { fetchVerseTimings } from '@/lib/fetchVerseTimings'
import { syncWords } from '@/lib/speech/syncWords'
import { analyzeAudio } from './audioAnalysis'
import { reciters, getReciterById } from '@/lib/reciters'
import { backgroundScenes, sceneUrl, type BackgroundScene } from '@/lib/backgroundPresets'
import { themeColors } from '@/lib/theme'
import { translationCredit } from '@/lib/translations'
import { maxAyatsPerVideo } from '@/lib/constants'
import { defaultVideoSettings } from '@/lib/defaultSettings'
import type { AyatSlide, Reciter, Surah, VideoSettings } from '@/lib/types'
import type { AyatVideoProps } from '@/remotion/types'
import {
  buildPostMetadata,
  countAyatsWithinBudget,
  dhakaDateKey,
  postIndex,
  mulberry32,
  pickSceneIndex,
  pickStartAyat,
  pickSurahNumber,
  type PostMetadata,
} from './plan'

export const dailyReciterIds = ['alafasy', 'sudais', 'abdulbasit', 'muaiqly', 'shatri', 'dosari', 'shuraim']

export interface DailyVideoOptions {
  now?: Date
  surahOverride?: number
  reciterId?: string
  translationKey?: string
  maxDurationSec?: number
  maxAyats?: number
  quality?: '480p' | '720p' | '1080p'
  extraHashtags?: string[]
  ffprobeBin?: string
  ffmpegBin?: string
  postTimes?: string[]
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

function baseSettings(scene: BackgroundScene): VideoSettings {
  return { ...defaultVideoSettings, backgroundImage: sceneUrl(scene.key), backgroundPreset: scene.key, ...themeColors(scene.palette) }
}

export async function buildDailyVideo(opts: DailyVideoOptions = {}): Promise<DailyVideo> {
  const now = opts.now ?? new Date()
  const sequence = postIndex(now, opts.postTimes ?? ['22:00'])
  const rand = mulberry32(sequence * 2654435761)
  const maxMs = opts.maxDurationSec ? opts.maxDurationSec * 1000 : Infinity
  const maxAyats = opts.maxAyats ?? maxAyatsPerVideo
  const translationKey = opts.translationKey ?? 'bengali'
  const audioTools = { ffprobeBin: opts.ffprobeBin, ffmpegBin: opts.ffmpegBin }

  const reciterPool = dailyReciterIds.map(getReciterById).filter((r): r is Reciter => Boolean(r))
  const reciter =
    opts.reciterId && opts.reciterId !== 'random'
      ? getReciterById(opts.reciterId)
      : reciterPool[Math.floor(rand() * reciterPool.length)]
  if (!reciter) {
    throw new Error(`Unknown reciter "${opts.reciterId}". Valid: ${reciters.map((r) => r.id).join(', ')}`)
  }

  const scene = backgroundScenes[pickSceneIndex(sequence, backgroundScenes.length)] ?? backgroundScenes[0]!

  const surahs = await fetchSurahs()
  const surahNumber = opts.surahOverride ?? pickSurahNumber(sequence)
  const surah = surahs.find((s) => s.number === surahNumber)
  if (!surah) throw new Error(`Surah ${surahNumber} not found`)

  for (let attempt = 0; attempt < 5; attempt++) {
    const fromAyat = pickStartAyat(surah.numberOfAyahs, maxAyats, rand)
    const slides: AyatSlide[] = []
    const durations: number[] = []

    for (let ayat = fromAyat; ayat <= surah.numberOfAyahs && slides.length < maxAyats; ayat++) {
      const [fetched, timings] = await Promise.all([
        fetchAyatData(surah.number, ayat, reciter.recitationId, reciter.audioKey, surah.name, surah.arabicName, translationKey),
        reciter.quranComId ? fetchVerseTimings(surah.number, ayat, reciter.quranComId) : Promise.resolve(null),
      ])
      if (!fetched) throw new Error(`Failed to fetch ayat ${surah.number}:${ayat}`)
      const data = timings ? { ...fetched, audioUrl: timings.audioUrl, words: timings.words } : fetched
      const { durationMs: audioDurationMs, speech } = await analyzeAudio(data.audioUrl, audioTools)
      const words = syncWords({ arabicText: data.arabicText, timedWords: data.words, durationMs: audioDurationMs, speech })
      durations.push(audioDurationMs)
      if (countAyatsWithinBudget(durations, maxMs, maxAyats) < durations.length) break
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
        ...(words ? { words } : {}),
      })
    }

    if (slides.length === 0) continue

    const toAyat = slides[slides.length - 1]!.ayatNumber
    const settings = baseSettings(scene)
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
        attributionLine: '',
        surahName: surah.name,
        surahNameArabic: surah.arabicName,
        surahMeaning: surah.englishName,
        totalAyats: slides.length,
        quality: opts.quality ?? '1080p',
        isExport: true,
      },
      meta: buildPostMetadata({
        surah,
        fromAyat,
        toAyat,
        reciterName: reciter.name,
        translationCredit: translationCredit(translationKey),
        extraHashtags: opts.extraHashtags,
      }),
    }
  }

  throw new Error(`Could not find an excerpt of surah ${surah.number} that fits in ${maxMs / 1000}s`)
}
