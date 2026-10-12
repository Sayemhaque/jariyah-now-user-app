import type { ScenePalette } from './backgroundPresets'
import { hslToHex, rgbToHsl, type Hsl } from './color'

const hueBuckets = 12
const fallbackAccent: Hsl = { h: 42, s: 0.72, l: 0.69 }
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function paletteFromPixels(rgba: ArrayLike<number>): ScenePalette {
  const buckets = Array.from({ length: hueBuckets }, () => ({ weight: 0, h: 0, s: 0 }))
  let sumR = 0
  let sumG = 0
  let sumB = 0
  let count = 0
  let darkCount = 0
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    if (rgba[i + 3]! < 128) continue
    const [r, g, b] = [rgba[i]!, rgba[i + 1]!, rgba[i + 2]!]
    count++
    const { h, s, l } = rgbToHsl(r, g, b)
    if (l < 0.4) {
      sumR += r
      sumG += g
      sumB += b
      darkCount++
    }
    const weight = s * Math.max(0, 1 - Math.abs(l - 0.55) * 2.5) ** 2
    if (weight <= 0.05) continue
    const bucket = buckets[Math.floor(h / (360 / hueBuckets)) % hueBuckets]!
    bucket.weight += weight
    bucket.h += h * weight
    bucket.s += s * weight
  }
  const average = darkCount ? rgbToHsl(sumR / darkCount, sumG / darkCount, sumB / darkCount) : { h: 230, s: 0.4, l: 0.1 }
  const best = buckets.reduce((top, bucket) => (bucket.weight > top.weight ? bucket : top))
  const vivid = best.weight > count * 0.01
  const accentHue = vivid ? best.h / best.weight : fallbackAccent.h
  const accentSat = vivid ? clamp(best.s / best.weight, 0.45, 0.85) : fallbackAccent.s
  const baseHue = darkCount && average.s > 0.08 ? average.h : accentHue
  const baseSat = clamp(average.s, 0.15, 0.5)
  const accent = hslToHex({ h: accentHue, s: accentSat, l: 0.7 })

  return {
    base: [0.17, 0.1, 0.04].map((l) => hslToHex({ h: baseHue, s: baseSat, l })) as ScenePalette['base'],
    pattern: accent,
    accent,
    text: hslToHex({ h: accentHue, s: 0.3, l: 0.95 }),
    translation: hslToHex({ h: accentHue, s: 0.22, l: 0.85 }),
  }
}

export async function extractImagePalette(src: string, sampleSize = 48): Promise<ScenePalette | null> {
  if (typeof document === 'undefined') return null
  const image = new Image()
  image.decoding = 'async'
  image.src = src
  try {
    await image.decode()
  } catch {
    return null
  }
  const canvas = document.createElement('canvas')
  canvas.width = sampleSize
  canvas.height = sampleSize
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null
  context.drawImage(image, 0, 0, sampleSize, sampleSize)
  return paletteFromPixels(context.getImageData(0, 0, sampleSize, sampleSize).data)
}
