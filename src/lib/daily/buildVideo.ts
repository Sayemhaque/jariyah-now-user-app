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
import { presetHeadline, textCollections } from '@/lib/collections'
import { isPresetMode, isTextMode, type ContentMode, type PresetMode } from '@/lib/collections/types'
import { listRecordings, type StoredRecording } from '@/lib/recordings/blobRecordings'
import { buildTextDailyVideo } from './buildTextVideo'
import { videoProps, type DailyContext, type DailyVideo, type DailyVideoOptions } from './dailyContext'
import { modeTurn, pickContentMode, pickPreset, pickTextItem } from './planContent'
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

export type { DailyVideo, DailyVideoOptions } from './dailyContext'

export const dailyReciterIds = ['alafasy', 'sudais', 'abdulbasit', 'muaiqly', 'shatri', 'dosari', 'shuraim']

function baseSettings(scene: BackgroundScene): VideoSettings {
  return { ...defaultVideoSettings, backgroundImage: sceneUrl(scene.key), backgroundPreset: scene.key, ...themeColors(scene.palette) }
}

interface QuranPick {
  surahNumber: number
  range?: { fromAyat: number; toAyat: number }
  headline?: string
  hashtags?: string[]
}

const presetHashtags: Record<PresetMode, string[]> = { masnoon: ['MasnoonSurah', 'Sunnah'], duas: ['QuranicDua', 'Dua'] }

async function storedRecordings(opts: DailyVideoOptions, rotation: ContentMode[]): Promise<StoredRecording[]> {
  if (!opts.blobToken || !rotation.some(isTextMode)) return []
  return listRecordings(opts.blobToken).catch((err) => {
    console.warn('Could not list recordings:', err instanceof Error ? err.message : err)
    return []
  })
}

export async function buildDailyVideo(opts: DailyVideoOptions = {}): Promise<DailyVideo> {
  const now = opts.now ?? new Date()
  const sequence = postIndex(now, opts.postTimes ?? ['22:00'])
  const scene = backgroundScenes[pickSceneIndex(sequence, backgroundScenes.length)] ?? backgroundScenes[0]!
  const ctx: DailyContext = {
    opts,
    now,
    sequence,
    rand: mulberry32(sequence * 2654435761),
    settings: baseSettings(scene),
    audioTools: { ffprobeBin: opts.ffprobeBin, ffmpegBin: opts.ffmpegBin },
  }
  if (opts.surahOverride) return buildQuranDailyVideo(ctx, 'quran', { surahNumber: opts.surahOverride })

  const rotation = opts.contentRotation?.length ? opts.contentRotation : ['quran' as const]
  const recordings = await storedRecordings(opts, rotation)
  const mode = pickContentMode(sequence, rotation)
  const turn = modeTurn(sequence, rotation, mode)

  if (isTextMode(mode)) {
    const item = pickTextItem(textCollections[mode], turn)
    const recording = recordings.find((r) => r.mode === mode && r.itemId === item.id)
    return buildTextDailyVideo(ctx, mode, item, recording?.url ?? null)
  }
  if (isPresetMode(mode)) {
    const { preset, part } = pickPreset(mode, turn)
    return buildQuranDailyVideo(ctx, mode, { surahNumber: preset.surah, range: part, headline: presetHeadline(mode, preset.id), hashtags: presetHashtags[mode] })
  }
  return buildQuranDailyVideo(ctx, 'quran', { surahNumber: pickSurahNumber(sequence) })
}

async function buildQuranDailyVideo(ctx: DailyContext, mode: ContentMode, pick: QuranPick): Promise<DailyVideo> {
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
  const surah = surahs.find((s) => s.number === pick.surahNumber)
  if (!surah) throw new Error(`Surah ${pick.surahNumber} not found`)
  const lastAyat = pick.range?.toAyat ?? surah.numberOfAyahs

  for (let attempt = 0; attempt < 5; attempt++) {
    const fromAyat = pick.range?.fromAyat ?? pickStartAyat(surah.numberOfAyahs, maxAyats, rand)
    const slides: AyatSlide[] = []
    const durations: number[] = []

    for (let ayat = fromAyat; ayat <= lastAyat && slides.length < maxAyats; ayat++) {
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
      dateKey: dhakaDateKey(now),
      mode,
      label: `${pick.headline ? `${pick.headline} · ` : ''}Surah ${surah.number} ${surah.name}, ayat ${fromAyat}-${toAyat} · ${reciter.name} · ${(durationMs / 1000).toFixed(1)}s`,
      durationMs,
      props: videoProps(ctx, { slides, reciterName: reciter.name, surahName: surah.name, surahNameArabic: surah.arabicName, surahMeaning: surah.englishName }),
      meta: buildPostMetadata({
        surah,
        fromAyat,
        toAyat,
        reciterName: reciter.name,
        translationCredit: translationCredit(translationKey),
        extraHashtags: [...(pick.hashtags ?? []), ...(opts.extraHashtags ?? [])],
        headline: pick.headline,
      }),
    }
  }

  throw new Error(`Could not find an excerpt of surah ${surah.number} that fits in ${maxMs / 1000}s`)
}
