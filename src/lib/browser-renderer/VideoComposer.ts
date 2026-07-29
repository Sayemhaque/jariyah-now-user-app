import type { AyatSlide, VideoSettings } from '@/lib/types'
import { computeSlideFrames } from '@/lib/advanceTiming'
import {
  ARABIC_FONT_FAMILIES,
  BENGALI_FONT_FAMILIES,
  setupCanvas,
  loadImage,
  drawOverlayLayer,
  drawFixedGradient,
  drawCardBackground,
  drawArabicText,
  drawCenteredText,
  drawDividingLine,
} from './canvasUtils'

export const RES: Record<string, { w: number; h: number }> = {
  landscape: { w: 1280, h: 720 },
  portrait: { w: 720, h: 1280 },
}

export const TEXT_WIDTH_FRACTIONS: Record<string, number> = {
  full: 0.94,
  wide: 0.82,
  medium: 0.70,
  narrow: 0.58,
}

export const TEXT_SPACING_FRACTIONS: Record<string, number> = {
  compact: 0.01,
  normal: 0.03,
  spacious: 0.06,
}

export interface VideoComposerOptions {
  slides: AyatSlide[]
  settings: VideoSettings
  orientation: 'portrait' | 'landscape'
  reciterName: string
  attributionLine: string
  surahName: string
  surahNameArabic: string
  totalAyats: number
  fps: number
  qualityScale?: number
  onProgress?: (p: number) => void
}

export interface ComposerWithDraw {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  totalFrames: number
  drawFrame: (frameIndex: number) => void
}

export async function createVideoComposer(
  options: VideoComposerOptions,
): Promise<ComposerWithDraw> {
  const { slides, settings, orientation, fps } = options
  const qualityScale = options.qualityScale ?? 1
  const baseRes = RES[orientation]!
  const W = Math.round(baseRes.w * qualityScale) & ~1
  const H = Math.round(baseRes.h * qualityScale) & ~1

  const { canvas, ctx } = setupCanvas(W, H)
  const minDim = Math.min(W, H)

  const { totalFrames } = computeSlideFrames(slides, fps)

  const isVideoBg = settings.backgroundImage.endsWith('.mp4')

  let bgImage: HTMLImageElement | null = null
  let bgVideoFrames: ImageBitmap[] | null = null
  let bgVideoFps = 24
  let bgVideoDurationSec = 10

  if (isVideoBg) {
    const preset = await findVideoPresetByUrl(settings.backgroundImage)
    if (preset) {
      bgVideoFps = preset.fps ?? 24
      bgVideoDurationSec = preset.durationSec ?? 10
    }
    options.onProgress?.(0.005)
    bgVideoFrames = await extractVideoFrames(
      settings.backgroundImage,
      bgVideoFps,
      bgVideoDurationSec,
      W,
      H,
      (progress) => options.onProgress?.(0.005 + progress * 0.025),
    )
    options.onProgress?.(0.03)
  } else {
    options.onProgress?.(0.01)
    bgImage = await loadImage(settings.backgroundImage)
    options.onProgress?.(0.03)
  }

  const isBengaliTranslation = slides[0] && /[\u0980-\u09FF]/.test(slides[0].translation)

  const fontBase: Record<string, { ar: number; tr: number; arRef: number; trRef: number }> = {
    portrait: { ar: 7.0, tr: 2.8, arRef: 30, trRef: 14 },
    landscape: { ar: 4.5, tr: 1.8, arRef: 34, trRef: 15 },
  }
  const fb = fontBase[orientation]!
  const arabicFontSizePx = (fb.ar * settings.arabicFontSize / fb.arRef) * (W / 100)
  const translationFontSizePx = (fb.tr * settings.translationFontSize / fb.trRef) * (W / 100)
  const translitFontSizePx = Math.max(11, minDim * 0.024)

  const arabicFontFamily = ARABIC_FONT_FAMILIES[settings.arabicFont] ?? 'Amiri'
  const bengaliFontFamily = BENGALI_FONT_FAMILIES[settings.bengaliFont] ?? 'Noto Sans Bengali'

  const textWidthFraction = TEXT_WIDTH_FRACTIONS[settings.textWidth] ?? 0.82
  const textSpacingFraction = TEXT_SPACING_FRACTIONS[settings.textSpacing] ?? 0.03

  const cardMaxWidth = W * textWidthFraction
  const cardPaddingTop = W * 0.04
  const cardPaddingX = W * 0.05
  const cardBorderRadius = minDim * 0.03
  const cardShadow = minDim * 0.03

  const fixedSettings = settings as VideoSettings & {
    showTranslation: boolean
    showTransliteration: boolean
  }

  const frameOffsets = computeSlideFrames(slides, fps).offsets

  function getSlideForFrame(frameIndex: number): { slide: AyatSlide; slideIndex: number; frameInSlide: number } {
    let slideIndex = slides.length - 1
    for (let i = slides.length - 1; i >= 0; i--) {
      if (frameIndex >= frameOffsets[i]!) {
        slideIndex = i
        break
      }
    }
    const frameInSlide = frameIndex - (frameOffsets[slideIndex] ?? 0)
    return { slide: slides[slideIndex]!, slideIndex, frameInSlide }
  }

  function drawFrame(frameIndex: number) {
    ctx.clearRect(0, 0, W, H)

    const { slide, slideIndex } = getSlideForFrame(frameIndex)

    if (isVideoBg && bgVideoFrames && bgVideoFrames.length > 0) {
      const totalBgFrames = bgVideoFrames.length
      const bgFrameIndex = frameIndex % totalBgFrames
      const bgFrame = bgVideoFrames[bgFrameIndex]!
      ctx.drawImage(bgFrame, 0, 0, W, H)
    } else if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, W, H)
    } else {
      ctx.fillStyle = '#0a0a14'
      ctx.fillRect(0, 0, W, H)
    }

    drawOverlayLayer(ctx, W, H, settings.overlayStyle, settings.overlayColor, settings.overlayOpacity)

    drawFixedGradient(ctx, W, H)

    drawTopHeader(ctx, W, H, options.surahName, options.surahNameArabic, options.totalAyats, slide, slideIndex)

    const centerX = W / 2
    const contentTop = H * 0.22
    const contentBottom = H * 0.78
    const contentHeight = contentBottom - contentTop

    const cardWidth = cardMaxWidth
    const arabicFontSize = arabicFontSizePx
    const translitFontSize = translitFontSizePx
    const translationFontSize = translationFontSizePx

    const hasArabic = !!slide.arabicText
    const hasTranslit = fixedSettings.showTransliteration && !!slide.transliteration
    const hasTranslation = fixedSettings.showTranslation && !!slide.translation
    const hasDivider = hasArabic && hasTranslation && hasTranslit

    let textBlockHeight = 0
    if (hasArabic) {
      textBlockHeight += arabicFontSize * 1.75
    }
    if (hasDivider) {
      textBlockHeight += 1 + minDim * 0.03
    } else if (hasArabic && hasTranslation) {
      textBlockHeight += minDim * 0.03
    }
    if (hasTranslit) {
      textBlockHeight += translitFontSize * 1.3
      if (hasArabic) textBlockHeight += minDim * 0.02
    }
    if (hasTranslation) {
      textBlockHeight += translationFontSize * 1.3
      if (hasTranslit || hasArabic) textBlockHeight += textSpacingFraction * 100
    }

    const cardHeight = Math.min(contentHeight, textBlockHeight + cardPaddingTop * 2)
    const cardY = contentTop + (contentHeight - cardHeight) / 2
    const cardX = centerX - cardWidth / 2

    drawCardBackground(ctx, cardX, cardY, cardWidth, cardHeight, cardBorderRadius)

    const cardContentX = centerX
    const cardContentY = cardY + cardPaddingTop

    let currentY = cardContentY

    if (hasArabic) {
      currentY = drawArabicText(
        ctx,
        slide.arabicText,
        cardContentX,
        currentY,
        cardWidth - cardPaddingX * 2,
        arabicFontSize,
        arabicFontFamily,
        settings.fontColor,
      )
    }

    if (hasDivider) {
      currentY += minDim * 0.015
      drawDividingLine(ctx, cardContentX, currentY, minDim * 0.12, settings.fontColor)
      currentY += minDim * 0.015 + 1
    } else if (hasArabic && hasTranslation) {
      currentY += minDim * 0.03
    }

    if (hasTranslit) {
      if (hasArabic) currentY += minDim * 0.02
      currentY = drawCenteredText(
        ctx,
        slide.transliteration!,
        cardContentX,
        currentY,
        cardWidth - cardPaddingX * 2,
        {
          fontSize: translitFontSize,
          fontFamily: 'Inter, sans-serif',
          color: 'rgba(255,255,255,0.72)',
          fontStyle: 'italic',
        },
      )
    }

    if (hasTranslation) {
      currentY += textSpacingFraction * 100
      drawCenteredText(
        ctx,
        slide.translation,
        cardContentX,
        currentY,
        cardWidth - cardPaddingX * 2,
        {
          fontSize: translationFontSize,
          fontFamily: isBengaliTranslation ? bengaliFontFamily : undefined,
          color: 'rgba(255,255,255,0.85)',
        },
      )
    }

    drawAttribution(ctx, W, H, options.reciterName, options.attributionLine)
    drawWatermark(ctx, W, H)
  }

  return {
    canvas,
    ctx,
    totalFrames,
    drawFrame,
  }
}

function drawTopHeader(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  surahName: string,
  surahNameArabic: string,
  totalAyats: number,
  slide: AyatSlide,
  slideIndex: number,
) {
  const padding = h * 0.04
  const sidePadding = w * 0.05

  ctx.save()
  ctx.textBaseline = 'top'

  const arabicFontSize = w * 0.05
  ctx.font = `${arabicFontSize}px Amiri, serif`
  ctx.fillStyle = 'white'
  ctx.shadowColor = 'rgba(0,0,0,0.7)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetY = 1
  ctx.textAlign = 'left'
  ctx.direction = 'rtl'
  ctx.fillText(surahNameArabic, w - sidePadding, padding)

  const engFontSize = w * 0.02
  ctx.font = `${engFontSize}px Inter, system-ui, sans-serif`
  ctx.textAlign = 'left'
  ctx.direction = 'ltr'
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.shadowBlur = 0
  ctx.fillText(surahName, sidePadding, padding + arabicFontSize * 1.05)

  ctx.textAlign = 'right'
  ctx.font = `${w * 0.042}px Amiri, serif`
  ctx.fillStyle = 'white'
  ctx.shadowColor = 'rgba(0,0,0,0.7)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetY = 1
  ctx.fillText(`${slide.surahNumber}:${slide.ayatNumber}`, w - sidePadding, padding + arabicFontSize * 1.1 + h * 0.01)

  ctx.font = `${w * 0.018}px Inter, sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.shadowBlur = 0
  const counterY = padding + arabicFontSize * 1.1 + h * 0.01 + w * 0.042 * 1.1 + h * 0.005
  ctx.fillText(`Ayat ${slideIndex + 1} of ${totalAyats}`, w - sidePadding, counterY)

  ctx.restore()
}

function drawAttribution(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  reciterName: string,
  attributionLine: string,
) {
  const fontSize = w * 0.024
  ctx.save()
  ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'

  const x = w * 0.035
  const y = h - h * 0.025

  if (attributionLine) {
    ctx.fillText(attributionLine, x, y - fontSize * 1.2)
  }
  ctx.fillText(`Recited by ${reciterName}`, x, y)

  ctx.restore()
}

function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const targetH = Math.round((Math.min(w, h) / 720) * 112)
  const x = w / 2
  const y = h * 0.04

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.font = `bold ${targetH * 0.35}px Inter, sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetY = 1
  ctx.fillText('Jariyah Now', x, y + targetH * 0.55)
  ctx.restore()
}

async function findVideoPresetByUrl(url: string) {
  const { BG_PRESETS } = await import('@/lib/backgroundPresets')
  const { normalizeBackgroundVideoUrl } = await import('@/lib/backgroundPresets')
  const normalized = normalizeBackgroundVideoUrl(url)
  return BG_PRESETS.find((p) => p.isVideo && (p.url === normalized || p.url === url))
}

async function extractVideoFrames(
  url: string,
  fps: number,
  durationSec: number,
  targetW: number,
  targetH: number,
  onProgress?: (p: number) => void,
): Promise<ImageBitmap[]> {
  const video = document.createElement('video')
  video.crossOrigin = 'anonymous'
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  video.src = url
  video.load()

  await new Promise<void>((resolve, reject) => {
    video.addEventListener('canplaythrough', () => resolve(), { once: true })
    video.addEventListener('error', (e) => {
      const err = (e as ErrorEvent)?.message || 'video load error'
      reject(new Error(String(err)))
    }, { once: true })
  })

  const actualDuration = Number.isFinite(video.duration) ? video.duration : durationSec
  const extractFps = Math.min(fps, 8)
  const totalFrames = Math.ceil(extractFps * actualDuration)
  const bitmaps: ImageBitmap[] = []

  const needResize = video.videoWidth !== targetW || video.videoHeight !== targetH

  for (let i = 0; i < totalFrames; i++) {
    video.currentTime = i / extractFps
    await Promise.race([
      new Promise<void>((resolve) => { video.onseeked = () => resolve() }),
      new Promise<void>((r) => setTimeout(r, 500)),
    ])
    try {
      if (video.readyState < 2) {
        await new Promise<void>((r) => setTimeout(r, 50))
      }
      const bitmap = (needResize && video.readyState >= 2)
        ? await createImageBitmap(video, {
            resizeWidth: targetW,
            resizeHeight: targetH,
            resizeQuality: 'medium',
          })
        : video.readyState >= 2
          ? await createImageBitmap(video)
          : await createImageBitmap(new ImageData(targetW, targetH))
      bitmaps.push(bitmap)
    } catch {
      const fallback = new ImageData(targetW, targetH)
      const bitmap = await createImageBitmap(fallback)
      bitmaps.push(bitmap)
    }
    onProgress?.((i + 1) / totalFrames)
  }

  video.remove()
  return bitmaps
}
