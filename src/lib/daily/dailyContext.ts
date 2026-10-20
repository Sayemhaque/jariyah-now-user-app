import type { ContentMode, TextLanguage } from '@/lib/collections/types'
import type { VideoSettings } from '@/lib/types'
import type { AyatVideoProps } from '@/remotion/types'
import type { AudioTools } from './audioAnalysis'
import type { PostMetadata } from './plan'

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
  contentRotation?: ContentMode[]
  textLanguage?: TextLanguage
  blobToken?: string
}

export interface DailyVideo {
  dateKey: string
  mode: ContentMode
  label: string
  durationMs: number
  props: AyatVideoProps
  meta: PostMetadata
}

export interface DailyContext {
  opts: DailyVideoOptions
  now: Date
  sequence: number
  rand: () => number
  settings: VideoSettings
  audioTools: AudioTools
}

export function videoProps(ctx: DailyContext, props: Pick<AyatVideoProps, 'slides' | 'reciterName' | 'surahName' | 'surahNameArabic' | 'surahMeaning'>): AyatVideoProps {
  return {
    ...props,
    settings: ctx.settings,
    orientation: 'portrait',
    attributionLine: '',
    totalAyats: props.slides.length,
    quality: ctx.opts.quality ?? '1080p',
    isExport: true,
  }
}
