import type { OverlayStyle } from '@/lib/types'

export const ARABIC_FONT_FAMILIES: Record<string, string> = {
  uthmani: 'Amiri',
  amiri: 'Amiri',
  scheherazade: 'Scheherazade New',
  markazi: 'Markazi Text',
  naskh: 'Noto Naskh Arabic',
  kufi: 'Reem Kufi',
  cairo: 'Cairo',
}

export const BENGALI_FONT_FAMILIES: Record<string, string> = {
  sans: 'Noto Sans Bengali',
  serif: 'Noto Serif Bengali',
  hind: 'Hind Siliguri',
}

export function hexToRgba(hex: string, alpha: number): string {
  const v = parseInt(hex.replace('#', ''), 16)
  const r = (v >> 16) & 255
  const g = (v >> 8) & 255
  const b = v & 255
  return `rgba(${r},${g},${b},${alpha})`
}

export function hexToRgbComponents(hex: string): { r: number; g: number; b: number } {
  const v = parseInt(hex.replace('#', ''), 16)
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 }
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

export function drawOverlayLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: OverlayStyle,
  color: string,
  opacity: number,
) {
  if (style === 'none') return

  const { r, g, b } = hexToRgbComponents(color)
  const alpha = opacity / 100
  const rgb = `${r},${g},${b}`

  let gradient: CanvasGradient

  switch (style) {
    case 'solid':
      ctx.fillStyle = `rgba(${rgb},${alpha})`
      ctx.fillRect(0, 0, w, h)
      break
    case 'bottom-gradient':
      gradient = ctx.createLinearGradient(0, 0, 0, h)
      gradient.addColorStop(0, `rgba(${rgb},0)`)
      gradient.addColorStop(0.55, `rgba(${rgb},${alpha * 0.5})`)
      gradient.addColorStop(1, `rgba(${rgb},${alpha})`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)
      break
    case 'top-gradient':
      gradient = ctx.createLinearGradient(0, 0, 0, h)
      gradient.addColorStop(0, `rgba(${rgb},${alpha})`)
      gradient.addColorStop(0.55, `rgba(${rgb},${alpha * 0.5})`)
      gradient.addColorStop(1, `rgba(${rgb},0)`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)
      break
    case 'vignette':
      gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7)
      gradient.addColorStop(0.35, `rgba(${rgb},0)`)
      gradient.addColorStop(0.75, `rgba(${rgb},${alpha * 0.55})`)
      gradient.addColorStop(1, `rgba(${rgb},${alpha})`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)
      break
    case 'center-focus':
      gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6)
      gradient.addColorStop(0, `rgba(${rgb},${alpha})`)
      gradient.addColorStop(0.45, `rgba(${rgb},${alpha * 0.5})`)
      gradient.addColorStop(0.8, `rgba(${rgb},0)`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)
      break
  }
}

export function drawFixedGradient(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, 'rgba(0,0,0,0.22)')
  g.addColorStop(0.18, 'rgba(0,0,0,0)')
  g.addColorStop(0.78, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,0.30)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

export function drawCardBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.save()
  roundRect(ctx, x, y, w, h, r)
  ctx.fillStyle = 'rgba(15, 15, 20, 0.6)'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = r * 2
  ctx.shadowOffsetY = r
  ctx.fill()
  ctx.restore()
}

export function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  options: {
    fontSize: number
    fontFamily?: string
    color: string
    fontWeight?: string
    fontStyle?: string
    lineHeight?: number
    textAlign?: CanvasTextAlign
    direction?: CanvasDirection
    letterSpacing?: string
  },
): number {
  const {
    fontSize,
    fontFamily,
    color,
    fontWeight = 'normal',
    fontStyle = 'normal',
    lineHeight = 1.3,
    textAlign = 'center',
    direction = 'ltr',
  } = options

  ctx.save()
  ctx.textAlign = textAlign
  ctx.textBaseline = 'top'
  ctx.direction = direction

  const fontStr = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily ?? 'sans-serif'}`
  ctx.font = fontStr
  ctx.fillStyle = color
  if (direction === 'rtl') {
    ctx.shadowColor = 'rgba(0,0,0,0.7)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetY = 1
  }

  const words = text.split(/\s+/).filter(Boolean)
  let lineY = y

  if (words.length === 0) {
    ctx.restore()
    return lineY
  }

  if (direction === 'rtl' || textAlign === 'center') {
    const singleLine = text
    ctx.fillText(singleLine, x, lineY, maxWidth)
    lineY += fontSize * lineHeight
  } else {
    const lines: string[] = []
    let currentLine = ''
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    for (const line of lines) {
      ctx.fillText(line, x, lineY, maxWidth)
      lineY += fontSize * lineHeight
    }
  }

  ctx.restore()
  return lineY
}

export function drawArabicText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  color: string,
): number {
  if (!text) return y

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.direction = 'rtl'
  ctx.font = `${fontSize}px ${fontFamily}, serif`
  ctx.fillStyle = color
  ctx.shadowColor = 'rgba(0,0,0,0.7)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetY = 1

  const tokens = text.split(/\s+/).filter(Boolean)
  let lineY = y
  const lineHeight = fontSize * 1.75

  if (tokens.length === 0) {
    ctx.restore()
    return lineY
  }

  if (text.length < 80) {
    ctx.fillText(text, centerX, lineY, maxWidth)
    lineY += lineHeight
  } else {
    let currentLine = ''
    for (const tok of tokens) {
      const testLine = currentLine ? `${currentLine} ${tok}` : tok
      const m = ctx.measureText(testLine)
      if (m.width > maxWidth && currentLine) {
        ctx.fillText(currentLine, centerX, lineY, maxWidth)
        lineY += lineHeight
        currentLine = tok
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) {
      ctx.fillText(currentLine, centerX, lineY, maxWidth)
      lineY += lineHeight
    }
  }

  ctx.restore()
  return lineY
}

export function drawDividingLine(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  width: number,
  color: string,
) {
  ctx.save()
  ctx.globalAlpha = 0.4
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(centerX - width / 2, y)
  ctx.lineTo(centerX + width / 2, y)
  ctx.stroke()
  ctx.restore()
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export function setupCanvas(
  width: number,
  height: number,
  offscreen = true,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  if (offscreen) {
    canvas.style.display = 'none'
  }
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  return { canvas, ctx }
}
