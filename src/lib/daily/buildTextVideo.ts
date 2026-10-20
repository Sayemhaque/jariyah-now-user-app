import { buildTextSlide, silentTextAudio, slideArabic, textVideoTitles, type RecordedAudio } from '@/lib/collections/textSlide'
import { buildTextPostMetadata } from '@/lib/collections/textPostMetadata'
import type { TextItem, TextMode } from '@/lib/collections/types'
import { syncWords } from '@/lib/speech/syncWords'
import type { AyatSlide } from '@/lib/types'
import { analyzeAudio } from './audioAnalysis'
import { videoProps, type DailyContext, type DailyVideo } from './dailyContext'
import { dhakaDateKey } from './plan'

async function recordedAudio(ctx: DailyContext, mode: TextMode, item: TextItem, url: string): Promise<RecordedAudio> {
  const { durationMs, speech } = await analyzeAudio(url, ctx.audioTools)
  return { url, durationMs, words: syncWords({ arabicText: slideArabic(mode, item), durationMs, speech }) }
}

export async function buildTextDailyVideo(ctx: DailyContext, mode: TextMode, item: TextItem, recordingUrl: string | null): Promise<DailyVideo> {
  const language = ctx.opts.textLanguage ?? 'english'
  const audio = recordingUrl ? await recordedAudio(ctx, mode, item, recordingUrl) : silentTextAudio(mode, item, language)
  const durationMs = audio.durationMs
  const slide = buildTextSlide(mode, item, language, audio) as AyatSlide
  return {
    dateKey: dhakaDateKey(ctx.now),
    mode,
    label: `${mode === 'hadith' ? 'Hadith' : 'Azkar'}: ${item.title} · ${item.source} · ${recordingUrl ? 'your voice' : 'no voice'} · ${(durationMs / 1000).toFixed(1)}s`,
    durationMs,
    props: videoProps(ctx, { slides: [slide], ...textVideoTitles(mode, item) }),
    meta: buildTextPostMetadata({ mode, item, language, extraHashtags: ctx.opts.extraHashtags }),
  }
}
