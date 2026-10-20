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
import type { AyatSlide, Reciter, VideoSettings } from '@/lib/types'
import type { ContentMode } from '@/lib/collections/types'
import { buildImagePost } from './buildImagePost'
import { videoProps, type DailyContext, type DailyPost, type DailyVideo, type DailyVideoOptions } from './dailyContext'
import { modeTurn, pickContentMode } from './planContent'
import {
  buildPostMetadata,
  countAyatsWithinBudget,
  dhakaDateKey,
  postIndex,
  mulberry32,
  pickSceneIndex,
  pickStartAyat,
  pickSurahNumber,
} from './plan'

export type { DailyImagePost, DailyPost, DailyVideo, DailyVideoOptions } from './dailyContext'

export const dailyReciterIds = ['alafasy', 'sudais', 'abdulbasit', 'muaiqly', 'shatri', 'dosari', 'shuraim']

function baseSettings(scene: BackgroundScene): VideoSettings {
  return { ...defaultVideoSettings, backgroundImage: sceneUrl(scene.key), backgroundPreset: scene.key, ...themeColors(scene.palette) }
}

export async function buildDailyPost(opts: DailyVideoOptions = {}): Promise<DailyPost> {
  const now = opts.now ?? new Date()
  const sequence = postIndex(now, opts.postTimes ?? ['22:00'])
  const scene = backgroundScenes.find((s) => s.key === opts.sceneKey) ?? backgroundScenes[pickSceneIndex(sequence, backgroundScenes.length)] ?? backgroundScenes[0]!
  const ctx: DailyContext = {
    opts,
    now,
    sequence,
    rand: mulberry32(sequence * 2654435761),
    settings: baseSettings(scene),
    audioTools: { ffprobeBin: opts.ffprobeBin, ffmpegBin: opts.ffmpegBin },
  }
  if (opts.surahOverride) return buildQuranDailyVideo(ctx, opts.surahOverride)
  const rotation: ContentMode[] = opts.contentRotation?.length ? opts.contentRotation : ['quran']
  const mode = pickContentMode(sequence, rotation)
  if (mode === 'quran') return buildQuranDailyVideo(ctx, pickSurahNumber(sequence))
  return buildImagePost(ctx, mode, modeTurn(sequence, rotation, mode))
}

async function buildQuranDailyVideo(ctx: DailyContext, surahNumber: number): Promise<DailyVideo> {
  const range = ctx.opts.range
  const { opts, rand, audioTools, now } = ctx
  const maxMs = opts.maxDurationSec ? opts.maxDurationSec * 1000 : Infinity
  const maxAyats = opts.maxAyats ?? maxAyatsPerVideo
  const translationKey = opts.translationKey ?? 'bengali'

  const reciterPool = dailyReciterIds.map(getReciterById).filter((r): r is Reciter => Boolean(r))
  const reciter =
    opts.reciterId && opts.reciterId !== 'random'
      ? getReciterById(opts.reciterId)
      : reciterPool[Math.floor(rand() * reciterPool.length)]
  if (!reciter) {
    throw new Error(`Unknown reciter "${opts.reciterId}". Valid: ${reciters.map((r) => r.id).join(', ')}`)
  }

  const surahs = await fetchSurahs()
  const surah = surahs.find((s) => s.number === surahNumber)
  if (!surah) throw new Error(`Surah ${surahNumber} not found`)

  for (let attempt = 0; attempt < 5; attempt++) {
    const fromAyat = range?.fromAyat ?? pickStartAyat(surah.numberOfAyahs, maxAyats, rand)
    const slides: AyatSlide[] = []
    const durations: number[] = []

    for (let ayat = fromAyat; ayat <= (range?.toAyat ?? surah.numberOfAyahs) && slides.length < maxAyats; ayat++) {
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
    const durationMs = slides.reduce((sum, x) => sum + x.audioDurationMs, 0)
    return {
      kind: 'video',
      dateKey: dhakaDateKey(now),
      mode: 'quran',
      label: `Surah ${surah.number} ${surah.name}, ayat ${fromAyat}-${toAyat} · ${reciter.name} · ${(durationMs / 1000).toFixed(1)}s`,
      durationMs,
      props: videoProps(ctx, { slides, reciterName: reciter.name, surahName: surah.name, surahNameArabic: surah.arabicName, surahMeaning: surah.englishName }),
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
