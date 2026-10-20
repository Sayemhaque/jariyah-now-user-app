import { buildTextSlide, textVideoTitles } from '@/lib/collections/textSlide'
import { buildTextPostMetadata } from '@/lib/collections/textPostMetadata'
import type { TextItem, TextMode } from '@/lib/collections/types'
import { syncWords } from '@/lib/speech/syncWords'
import type { AyatSlide } from '@/lib/types'
import { analyzeAudio } from './audioAnalysis'
import { videoProps, type DailyContext, type DailyVideo } from './dailyContext'
import { dhakaDateKey } from './plan'

export async function buildTextDailyVideo(ctx: DailyContext, mode: TextMode, item: TextItem, recordingUrl: string): Promise<DailyVideo> {
  const language = ctx.opts.textLanguage ?? 'english'
  const { durationMs, speech } = await analyzeAudio(recordingUrl, ctx.audioTools)
  const words = syncWords({ arabicText: item.arabic, durationMs, speech })
  const slide = buildTextSlide(mode, item, language, { url: recordingUrl, durationMs, words }) as AyatSlide
  return {
    dateKey: dhakaDateKey(ctx.now),
    mode,
    label: `${mode === 'hadith' ? 'Hadith' : 'Azkar'}: ${item.title} · ${item.source} · ${(durationMs / 1000).toFixed(1)}s`,
    durationMs,
    props: videoProps(ctx, { slides: [slide], ...textVideoTitles(mode, item) }),
    meta: buildTextPostMetadata({ mode, item, language, extraHashtags: ctx.opts.extraHashtags }),
  }
}
