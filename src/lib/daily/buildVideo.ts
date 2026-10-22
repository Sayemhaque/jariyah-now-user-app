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
import { presetCollections } from '@/lib/collections'
import { kahfReminder } from '@/lib/collections/friday'
import type { QuranPreset } from '@/lib/collections/types'
import { buildFridayPost, buildImagePost, isFridayKey } from './buildImagePost'
import { videoProps, type DailyContext, type DailyPost, type DailyVideo, type DailyVideoOptions } from './dailyContext'
import { modeTurn, pickContentMode, pickDua, scheduledPost } from './planContent'
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

const dailySceneBlocklist = ['desert-train']

export const dailyReciterIds = ['alafasy', 'sudais', 'abdulbasit', 'muaiqly', 'shatri', 'dosari', 'shuraim']

function baseSettings(scene: BackgroundScene): VideoSettings {
  return { ...defaultVideoSettings, backgroundImage: sceneUrl(scene.key), backgroundPreset: scene.key, ...themeColors(scene.palette) }
}

export async function buildDailyPost(opts: DailyVideoOptions = {}): Promise<DailyPost> {
  const now = opts.now ?? new Date()
  const sequence = postIndex(now, opts.postTimes ?? ['22:00'])
  const scenes = backgroundScenes.filter((s) => !dailySceneBlocklist.includes(s.key))
  const scene = backgroundScenes.find((s) => s.key === opts.sceneKey) ?? scenes[pickSceneIndex(sequence, scenes.length)] ?? scenes[0]!
  const ctx: DailyContext = {
    opts,
    now,
    sequence,
    rand: mulberry32(sequence * 2654435761),
    settings: baseSettings(scene),
    audioTools: { ffprobeBin: opts.ffprobeBin, ffmpegBin: opts.ffmpegBin },
  }
  if (opts.surahOverride) return buildQuranDailyVideo(ctx, opts.surahOverride)
  if (opts.duaId) return buildDuaReel(ctx, findDua(opts.duaId))
  const rotation = opts.contentRotation
  const { mode, turn } = rotation?.length
    ? { mode: pickContentMode(sequence, rotation), turn: modeTurn(sequence, rotation, pickContentMode(sequence, rotation)) }
    : scheduledPost(now, opts.postTimes ?? ['22:00'])
  if (mode === 'quran') return buildQuranDailyVideo(ctx, pickSurahNumber(turn))
  if (mode === 'duaReel') return buildDuaReel(ctx, pickDua(turn))
  if (mode === 'kahf') return buildQuranDailyVideo(ctx, 18, { range: { fromAyat: 1, toAyat: 10 }, heading: 'জুমার দিনের সূরা কাহফ', reminder: kahfReminder })
  if (isFridayKey(mode)) return buildFridayPost(ctx, mode)
  return buildImagePost(ctx, mode, turn)
}

function findDua(id: string): QuranPreset {
  const dua = presetCollections.duas.find((d) => d.id === id)
  if (!dua) throw new Error(`Unknown dua "${id}". Valid: ${presetCollections.duas.map((d) => d.id).join(', ')}`)
  return dua
}

function buildDuaReel(ctx: DailyContext, dua: QuranPreset): Promise<DailyVideo> {
  return buildQuranDailyVideo(ctx, dua.surah, { range: { fromAyat: dua.fromAyat, toAyat: dua.toAyat }, heading: dua.titleBn ?? dua.title, wholeRange: true })
}

interface ReelExtras {
  range?: { fromAyat: number; toAyat: number }
  heading?: string
  reminder?: { text: string; source: string }
  wholeRange?: boolean
}

async function buildQuranDailyVideo(ctx: DailyContext, surahNumber: number, extras: ReelExtras = {}): Promise<DailyVideo> {
  const range = extras.range ?? ctx.opts.range
  const { opts, rand, audioTools, now } = ctx
  const maxMs = opts.maxDurationSec && !extras.wholeRange ? opts.maxDurationSec * 1000 : Infinity
  const maxAyats = extras.wholeRange && range ? range.toAyat - range.fromAyat + 1 : (opts.maxAyats ?? maxAyatsPerVideo)
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
        audioUrl: slides[0]?.audioUrl,
        extraHashtags: opts.extraHashtags,
        heading: extras.heading,
        reminder: extras.reminder,
      }),
    }
  }

  throw new Error(`Could not find an excerpt of surah ${surah.number} that fits in ${maxMs / 1000}s`)
}
