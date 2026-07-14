import React from 'react'
import { AbsoluteFill, Sequence, Audio, useVideoConfig } from 'remotion'
import type { AyatVideoProps } from './types'
import { TEXT_WIDTH_FRACTIONS, TEXT_SPACING_FRACTIONS, ARABIC_FONT_CLASS, BENGALI_FONT_CLASS, orientationFontBase } from './types'
import { Background } from './Background'
import { computeSlideFrames, getAdvanceAtMs } from '@/lib/advanceTiming'
import { OverlayLayer } from './OverlayLayer'
import { TopHeader } from './TopHeader'
import { Card } from './Card'
import { ArabicText } from './ArabicText'
import { TransliterationText } from './TransliterationText'
import { TranslationText } from './TranslationText'
import { Watermark } from './Watermark'
import { Attribution } from './Attribution'

function isBengali(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text)
}

export const AyatVideo: React.FC<AyatVideoProps> = ({
  slides,
  settings,
  reciterName,
  attributionLine,
  surahName,
  surahNameArabic,
  totalAyats,
  isExport,
  preLooped,
}) => {
  const { width, height, fps } = useVideoConfig()
  const minDim = Math.min(width, height)
  const W = width

  const fb = orientationFontBase[settings.orientation]!
  const arabicFontSizePx = (fb.ar * settings.arabicFontSize / fb.arRef) * (W / 100)
  const translationFontSizePx = (fb.tr * settings.translationFontSize / fb.trRef) * (W / 100)
  const translitFontSizePx = Math.max(11, minDim * 0.024)

  const isBengaliTranslation = isBengali(slides[0]?.translation ?? '')

  const { totalFrames } = computeSlideFrames(slides, fps)

  const fixedSettings = settings as AyatVideoProps['settings'] & {
    arabicFont: string
    bengaliFont: string
    fontColor: string
    textWidth: string
    textSpacing: string
    showTranslation: boolean
    showTransliteration: boolean
  }

  let frameOffset = 0

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a14', overflow: 'hidden' }}>
      <Background url={settings.backgroundImage} isExport={isExport} preLooped={preLooped} />

      <OverlayLayer
        style={settings.overlayStyle}
        color={settings.overlayColor}
        opacity={settings.overlayOpacity}
        width={width}
        height={height}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.30) 100%)',
          pointerEvents: 'none',
        }}
      />

      {slides.map((slide, i) => {
        const advanceMs = getAdvanceAtMs(slide, slide.audioDurationMs)
        const durFrames = Math.round(advanceMs / 1000 * fps)
        const seq = (
          <Sequence key={i} from={frameOffset} durationInFrames={durFrames}>
            <Audio src={slide.audioUrl} />

            <TopHeader
              surahName={surahName}
              surahNameArabic={surahNameArabic}
              ayatNumber={slide.ayatNumber}
              surahNumber={slide.surahNumber}
              index={i}
              total={totalAyats}
              width={width}
              height={height}
            />

            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: `0 ${8 * W / 100}px`,
              }}
            >
              <Card
                maxWidth={W * (TEXT_WIDTH_FRACTIONS[fixedSettings.textWidth] ?? 0.82)}
                paddingTop={W * 0.04}
                paddingX={W * 0.05}
                borderRadius={minDim * 0.03}
                shadow={minDim * 0.03}
              >
                <ArabicText
                  text={slide.arabicText}
                  fontSize={arabicFontSizePx}
                  fontFace={ARABIC_FONT_CLASS[fixedSettings.arabicFont] ?? 'font-arabic-uthmani'}
                  color={fixedSettings.fontColor}
                />

                {fixedSettings.showTranslation && fixedSettings.showTransliteration && slide.arabicText && (
                  <div
                    style={{
                      marginTop: minDim * 0.015,
                      marginBottom: minDim * 0.015,
                      height: 1,
                      width: minDim * 0.12,
                      opacity: 0.4,
                      backgroundColor: fixedSettings.fontColor,
                    }}
                  />
                )}

                {fixedSettings.showTransliteration && slide.transliteration && (
                  <TransliterationText
                    text={slide.transliteration}
                    fontSize={translitFontSizePx}
                    maxWidth={W * 0.80}
                  />
                )}

                {fixedSettings.showTranslation && (
                  <TranslationText
                    text={slide.translation}
                    fontSize={translationFontSizePx}
                    maxWidth={W * 0.85}
                    isBengali={isBengaliTranslation}
                    bengaliFont={BENGALI_FONT_CLASS[fixedSettings.bengaliFont] ?? 'font-bengali-sans'}
                    spacing={TEXT_SPACING_FRACTIONS[fixedSettings.textSpacing] ?? 0.03}
                  />
                )}
              </Card>
            </div>

            <Attribution
              reciterName={reciterName}
              attributionLine={attributionLine}
              width={width}
              height={height}
            />

            <Watermark width={width} height={height} />
          </Sequence>
        )
        frameOffset += durFrames
        return seq
      })}
    </AbsoluteFill>
  )
}
