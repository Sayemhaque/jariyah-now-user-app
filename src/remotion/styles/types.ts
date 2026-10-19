import type { VideoSettings } from '@/lib/types'
import type { computeTextSizes, SlideSequence } from '../layout'

export interface StyleTitles {
  surahName: string
  surahNameArabic: string
  surahMeaning?: string
  reciterName: string
}

export interface StyleProps {
  sequences: SlideSequence[]
  settings: VideoSettings
  sizes: ReturnType<typeof computeTextSizes>
  isBengali: boolean
  width: number
  height: number
  titles: StyleTitles
}

export interface StyleSlideProps {
  timing: SlideSequence
  settings: VideoSettings
  sizes: ReturnType<typeof computeTextSizes>
  isBengali: boolean
}
