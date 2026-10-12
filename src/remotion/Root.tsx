import { registerRoot, Composition } from 'remotion'
import { AyatVideo } from './AyatVideo'
import type { AyatVideoProps } from './types'
import { resolutions, renderQualityScale } from './types'
import { computeSlideFrames } from '@/lib/advanceTiming'
import { videoFps } from '@/lib/constants'

const defaultProps: AyatVideoProps = {
  slides: [],
  settings: {
    backgroundImage: '/backgrounds/twilight-mosque-portrait.png',
    backgroundPreset: 'twilight-mosque',
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
  },
  orientation: 'portrait',
  reciterName: '',
  attributionLine: '',
  surahName: '',
  surahNameArabic: '',
  totalAyats: 0,
  isExport: true,
}

const maxFrames = 90_000

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AyatVideo"
        component={AyatVideo as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={maxFrames}
        fps={videoFps}
        width={resolutions.portrait.w}
        height={resolutions.portrait.h}
        defaultProps={defaultProps as unknown as Record<string, unknown>}
        calculateMetadata={({ props }) => {
          const p = props as Partial<AyatVideoProps>
          const slides = Array.isArray(p.slides) ? p.slides : []
          if (slides.length === 0) {
            return { durationInFrames: 1 }
          }
          const { totalFrames } = computeSlideFrames(slides, videoFps)
          const orientation = p.orientation ?? 'portrait'
          const qualityScale = renderQualityScale[p.quality ?? '720p'] ?? 1
          const base = resolutions[orientation] ?? resolutions.portrait
          const width = Math.round(base.w * qualityScale) & ~1
          const height = Math.round(base.h * qualityScale) & ~1
          return {
            durationInFrames: Math.min(Math.max(totalFrames, 1), maxFrames),
            width,
            height,
          }
        }}
      />
    </>
  )
}

registerRoot(RemotionRoot)
