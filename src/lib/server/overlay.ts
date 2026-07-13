import { promises as fs, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { hexToRgb } from '@/lib/overlay'
import type { AyatSlide, Orientation, VideoSettings } from '@/lib/types'

const require = createRequire(import.meta.url)

type SharpModule = typeof import('sharp') & {
  default?: typeof import('sharp')
}

function getSharp(): typeof import('sharp') {
  const mod = require('sharp') as SharpModule
  return mod.default ?? mod
}

interface RenderAyatOverlayArgs {
  slide: AyatSlide
  settings: VideoSettings
  orientation: Orientation
  ayatIndex: number
  totalAyats: number
  width: number
  height: number
  reciterName: string
  attributionLine: string
  outputPath: string
}

const TEXT_WIDTH_FRACTIONS: Record<string, number> = {
  full: 0.94,
  wide: 0.84,
  medium: 0.72,
  narrow: 0.6,
}

const TEXT_SPACING_FRACTIONS: Record<string, number> = {
  compact: 0.015,
  normal: 0.035,
  spacious: 0.06,
}

const ARABIC_FONT_FAMILY: Record<string, string> = {
  uthmani: '"Amiri", serif',
  amiri: '"Amiri", serif',
  scheherazade: '"Scheherazade New", serif',
  markazi: '"Markazi Text", serif',
  naskh: '"Noto Naskh Arabic", serif',
  kufi: '"Reem Kufi", sans-serif',
  cairo: '"Cairo", sans-serif',
}

const BENGALI_FONT_FAMILY: Record<string, string> = {
  sans: '"Noto Sans Bengali", sans-serif',
  serif: '"Noto Serif Bengali", serif',
  hind: '"Hind Siliguri", sans-serif',
}

function escapeXml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

/** Remove Arabic diacritics so they aren't counted as visible glyphs.
 * @internal exported only for testing */
export function visibleArabicChars(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670]/g, '')
}

function wrapTextApprox(
  text: string,
  fontSize: number,
  maxWidth: number,
  widthFactor: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return []

  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    const visible = visibleArabicChars(next)
    const estimatedWidth = visible.length * fontSize * widthFactor
    if (line && estimatedWidth > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }

  if (line) lines.push(line)
  return lines
}

function buildOverlayGradient(settings: VideoSettings, width: number, height: number): string {
  if (settings.overlayStyle === 'none' || settings.overlayOpacity === 0) return ''
  const alpha = settings.overlayOpacity / 100
  const { r, g, b } = hexToRgb(settings.overlayColor)
  const rgba = (value: number) => `rgba(${r}, ${g}, ${b}, ${value})`

  if (settings.overlayStyle === 'solid') {
    return `<rect x="0" y="0" width="${width}" height="${height}" fill="${rgba(alpha)}" />`
  }

  if (settings.overlayStyle === 'bottom-gradient') {
    return `
      <defs>
        <linearGradient id="overlay-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${rgba(0)}" />
          <stop offset="55%" stop-color="${rgba(alpha * 0.5)}" />
          <stop offset="100%" stop-color="${rgba(alpha)}" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#overlay-grad)" />
    `
  }

  if (settings.overlayStyle === 'top-gradient') {
    return `
      <defs>
        <linearGradient id="overlay-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${rgba(alpha)}" />
          <stop offset="45%" stop-color="${rgba(alpha * 0.5)}" />
          <stop offset="100%" stop-color="${rgba(0)}" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#overlay-grad)" />
    `
  }

  if (settings.overlayStyle === 'vignette' || settings.overlayStyle === 'center-focus') {
    const stops =
      settings.overlayStyle === 'vignette'
        ? `
          <stop offset="35%" stop-color="${rgba(0)}" />
          <stop offset="75%" stop-color="${rgba(alpha * 0.55)}" />
          <stop offset="100%" stop-color="${rgba(alpha)}" />
        `
        : `
          <stop offset="0%" stop-color="${rgba(alpha)}" />
          <stop offset="45%" stop-color="${rgba(alpha * 0.5)}" />
          <stop offset="80%" stop-color="${rgba(0)}" />
        `

    return `
      <defs>
        <radialGradient id="overlay-grad" cx="50%" cy="50%" r="75%">
          ${stops}
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#overlay-grad)" />
    `
  }

  return ''
}

let watermarkDataUri: string | null = null

function getWatermarkDataUri(): string {
  if (watermarkDataUri) return watermarkDataUri
  try {
    const buf = readFileSync(path.join(process.cwd(), 'public', 'watermark.png'))
    watermarkDataUri = `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    watermarkDataUri = ''
  }
  return watermarkDataUri
}

function watermarkSvg(width: number, height: number): string {
  const uri = getWatermarkDataUri()
  if (!uri) return ''
  const targetH = Math.round((Math.min(width, height) / 720) * 112)
  const top = Math.round(height * 0.04)
  return `
      <filter id="wm-shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.6)" />
      </filter>
      <image
        x="50%"
        y="${top}"
        transform="translate(-${Math.round(targetH * 1088 / 1709 / 2)}, 0)"
        width="${Math.round(targetH * 1088 / 1709)}"
        height="${targetH}"
        href="${uri}"
        filter="url(#wm-shadow)"
        style="opacity:0.9"
      />`
}

export async function renderAyatOverlayPng({
  slide,
  settings,
  orientation,
  ayatIndex,
  totalAyats,
  width,
  height,
  reciterName,
  attributionLine,
  outputPath,
}: RenderAyatOverlayArgs): Promise<void> {
  const minDim = Math.min(width, height)
  const cardWidth = Math.round(width * (TEXT_WIDTH_FRACTIONS[settings.textWidth] ?? 0.84))
  const cardX = Math.round((width - cardWidth) / 2)
  const cardY = orientation === 'portrait'
    ? Math.round(height * 0.25)
    : Math.round(height * 0.18)
  const cardPaddingX = Math.round(width * 0.05)
  const cardPaddingY = Math.round(height * 0.035)
  const innerWidth = cardWidth - cardPaddingX * 2

  const arabicFontSize = settings.arabicFontSize * (minDim / 720) * 1.22
  const translationFontSize = settings.translationFontSize * (minDim / 720) * 1.18
  const translitFontSize = Math.max(14, translationFontSize * 0.94)
  const metaFontSize = Math.max(13, minDim * 0.018)
  const smallFontSize = Math.max(11, minDim * 0.015)

  const arabicLines = wrapTextApprox(slide.arabicText, arabicFontSize, innerWidth, 0.7)
  const showTranslation = settings.showTranslation && Boolean(slide.translation)
  const showTransliteration = settings.showTransliteration && Boolean(slide.transliteration)
  const translationLines = showTranslation
    ? wrapTextApprox(
        slide.translation,
        translationFontSize,
        innerWidth,
        /[\u0980-\u09FF]/.test(slide.translation) ? 0.72 : 0.56,
      )
    : []
  const transliterationLines = showTransliteration
    ? wrapTextApprox(slide.transliteration ?? '', translitFontSize, innerWidth, 0.52)
    : []

  const arabicLineHeight = arabicFontSize * 1.75
  const translationLineHeight = translationFontSize * 1.4
  const translitLineHeight = translitFontSize * 1.35

  const arabicHeight = arabicLines.length * arabicLineHeight
  const translitHeight = transliterationLines.length * translitLineHeight
  const translationHeight = translationLines.length * translationLineHeight
  const middleGap = showTransliteration ? Math.round(height * 0.016) : 0
  // Divider margin (shown only when both translation + transliteration are present)
  // matches the React divider: marginTop + marginBottom = 2 × minDim × 0.015.
  const dividerMargin = showTranslation && showTransliteration
    ? Math.round(Math.min(width, height) * 0.03)
    : 0
  // Translation marginTop matches React's <TranslationText> which uses
  // `marginTop: TEXT_SPACING_FRACTIONS[textSpacing] * 100%` (percentage of containing-block width).
  const spacingFraction = TEXT_SPACING_FRACTIONS[settings.textSpacing] ?? 0.03
  const translationMargin = showTranslation
    ? Math.round(innerWidth * spacingFraction)
    : 0
  const metaGap = Math.round(height * 0.028)
  const footerGap = Math.round(height * 0.02)

  const cardHeight = Math.round(
    cardPaddingY * 2 +
      arabicHeight +
      (showTransliteration
        ? (showTranslation ? dividerMargin : middleGap) + translitHeight
        : 0) +
      (showTranslation ? translationMargin + translationHeight : 0) +
      metaGap +
      smallFontSize * 3.2 +
      footerGap,
  )

  const cardBottomY = Math.min(cardY + cardHeight, Math.round(height * 0.88))
  const actualCardY = cardBottomY - cardHeight

  const arabicFontFamily = ARABIC_FONT_FAMILY[settings.arabicFont] ?? ARABIC_FONT_FAMILY.uthmani
  const bengaliFontFamily = BENGALI_FONT_FAMILY[settings.bengaliFont] ?? BENGALI_FONT_FAMILY.sans
  const translationFontFamily = /[\u0980-\u09FF]/.test(slide.translation)
    ? bengaliFontFamily
    : 'Inter, Arial, sans-serif'

  let currentY = actualCardY + cardPaddingY + arabicFontSize
  const centerX = width / 2

  const arabicText = arabicLines
    .map((line, index) => `
      <text
        x="${centerX}"
        y="${currentY + index * arabicLineHeight}"
        text-anchor="middle"
        direction="rtl"
        unicode-bidi="plaintext"
        font-family='${arabicFontFamily}'
        font-size="${arabicFontSize}"
        fill="${settings.fontColor}"
      >${escapeXml(line)}</text>
    `)
    .join('')
  currentY += arabicHeight

  const transliterationSpacing = showTransliteration
    ? (showTranslation ? dividerMargin : middleGap)
    : 0
  const transliterationText = showTransliteration
    ? transliterationLines
        .map((line, index) => `
          <text
            x="${centerX}"
            y="${currentY + transliterationSpacing + translitFontSize + index * translitLineHeight}"
            text-anchor="middle"
            font-family="Inter, Arial, sans-serif"
            font-size="${translitFontSize}"
            fill="rgba(255,255,255,0.82)"
            font-style="italic"
          >${escapeXml(line)}</text>
        `)
        .join('')
    : ''
  if (showTransliteration) {
    currentY += transliterationSpacing + translitHeight
  }

  const translationText = showTranslation
    ? translationLines
        .map((line, index) => `
          <text
            x="${centerX}"
            y="${currentY + translationMargin + translationFontSize + index * translationLineHeight}"
            text-anchor="middle"
            font-family='${translationFontFamily}'
            font-size="${translationFontSize}"
            fill="rgba(255,255,255,0.92)"
          >${escapeXml(line)}</text>
        `)
        .join('')
    : ''
  if (showTranslation) {
    currentY += translationMargin + translationHeight
  }

  const metaY = currentY + metaGap
  const cardRadius = Math.round(Math.min(width, height) * 0.028)
  const topHeaderArabicY = Math.round(height * 0.075)
  const topHeaderLatinY = topHeaderArabicY + Math.round(metaFontSize * 1.8)

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${buildOverlayGradient(settings, width, height)}
      <defs>
        <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="${Math.round(height * 0.012)}" stdDeviation="${Math.round(height * 0.018)}" flood-color="rgba(0,0,0,0.40)" />
        </filter>
      </defs>

      <text x="${Math.round(width * 0.05)}" y="${topHeaderArabicY}" font-family='"Amiri", serif' font-size="${metaFontSize * 1.6}" fill="#ffffff">
        ${escapeXml(slide.surahNameArabic)}
      </text>
      <text x="${Math.round(width * 0.05)}" y="${topHeaderLatinY}" font-family="Inter, Arial, sans-serif" font-size="${smallFontSize}" fill="rgba(255,255,255,0.78)" letter-spacing="1.2">
        ${escapeXml(slide.surahName.toUpperCase())}
      </text>
      <text x="${Math.round(width * 0.95)}" y="${topHeaderArabicY}" text-anchor="end" font-family='"Amiri", serif' font-size="${metaFontSize * 1.35}" fill="#ffffff">
        ${escapeXml(`${slide.surahNumber}:${slide.ayatNumber}`)}
      </text>
      <text x="${Math.round(width * 0.95)}" y="${topHeaderLatinY}" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="${smallFontSize}" fill="rgba(255,255,255,0.74)" letter-spacing="1.2">
        ${escapeXml(`AYAT ${ayatIndex + 1} OF ${totalAyats}`)}
      </text>

      <rect
        x="${cardX}"
        y="${actualCardY}"
        width="${cardWidth}"
        height="${cardHeight}"
        rx="${cardRadius}"
        fill="rgba(0,0,0,0.44)"
        stroke="rgba(255,255,255,0.14)"
        filter="url(#card-shadow)"
      />

      ${arabicText}
      ${transliterationText}
      ${translationText}

      <line
        x1="${cardX + cardPaddingX}"
        x2="${cardX + cardWidth - cardPaddingX}"
        y1="${metaY}"
        y2="${metaY}"
        stroke="rgba(255,255,255,0.14)"
        stroke-width="1"
      />

      <text x="${cardX + cardPaddingX}" y="${metaY + metaFontSize * 1.55}" font-family="Inter, Arial, sans-serif" font-size="${smallFontSize}" fill="rgba(255,255,255,0.72)">
        ${escapeXml(`Recited by ${reciterName}`)}
      </text>
      <text x="${cardX + cardPaddingX}" y="${metaY + metaFontSize * 3.05}" font-family="Inter, Arial, sans-serif" font-size="${smallFontSize}" fill="rgba(255,255,255,0.72)">
        ${escapeXml(attributionLine || 'Translation: Public domain')}
      </text>
      <text x="${cardX + cardWidth - cardPaddingX}" y="${metaY + metaFontSize * 3.05}" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="${smallFontSize}" fill="rgba(255,255,255,0.58)">
        Jariyah Now
      </text>

      ${watermarkSvg(width, height)}
    </svg>
  `

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  const sharp = getSharp()
  await sharp(Buffer.from(svg)).png().toFile(outputPath)
}
