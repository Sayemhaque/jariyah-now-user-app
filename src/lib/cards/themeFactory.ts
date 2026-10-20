import type { CardPattern, CardTheme } from './types'

export interface ColourFamily {
  name: string
  hue: number
  saturation: number
  accentHue?: number
}

const gold = 38
const patterns: CardPattern[] = ['stars', 'lattice', 'rosette', 'waves', 'arch', 'rays', 'marble']
const lightPatternOpacity: Record<CardPattern, number> = { stars: 0.09, lattice: 0.1, rosette: 0.13, waves: 0.15, arch: 0.17, rays: 0.11, marble: 0.32, none: 0 }

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100
  const light = l / 100
  const a = sat * Math.min(light, 1 - light)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    const value = light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(value * 255).toString(16).padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

const rgba = (hex: string, alpha: number) => `rgba(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')}, ${alpha})`
const slug = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, '-')

export function lightTheme(family: ColourFamily, index: number): CardTheme {
  const { hue, saturation } = family
  const bgSat = Math.min(saturation * 0.55, 45)
  const ink = hslToHex(hue, Math.min(saturation, 40), 12)
  const pattern = patterns[index % patterns.length]!
  return {
    key: `${slug(family.name)}-silk`,
    label: `${family.name} Silk`,
    light: true,
    background: `linear-gradient(170deg, ${hslToHex(hue, bgSat, 97)} 0%, ${hslToHex(hue, bgSat, 91)} 55%, ${hslToHex(hue, bgSat, 85)} 100%)`,
    glow: 'radial-gradient(ellipse 70% 45% at 50% 34%, rgba(255, 255, 255, 0.7), transparent 72%)',
    ink,
    arabic: hslToHex(hue, Math.min(saturation * 1.1, 65), 23),
    muted: rgba(ink, 0.82),
    accent: hslToHex(family.accentHue ?? gold, 62, 30),
    pattern,
    patternOpacity: lightPatternOpacity[pattern],
    grain: 0.06,
  }
}

export function darkTheme(family: ColourFamily, index: number): CardTheme {
  const { hue, saturation } = family
  const bgSat = Math.min(saturation, 60) * 0.8
  const accentHue = family.accentHue ?? gold
  const ink = hslToHex(hue, 25, 95)
  const accent = hslToHex(accentHue, 62, 64)
  const pattern = patterns[(index + 3) % patterns.length]!
  return {
    key: `${slug(family.name)}-night`,
    label: `${family.name} Night`,
    light: false,
    background: `linear-gradient(162deg, ${hslToHex(hue, bgSat, 11)} 0%, ${hslToHex(hue, bgSat, 17)} 50%, ${hslToHex(hue, bgSat, 7)} 100%)`,
    glow: `radial-gradient(ellipse 70% 45% at 50% 38%, ${rgba(accent, 0.16)}, transparent 70%)`,
    ink,
    arabic: hslToHex(accentHue, 75, 80),
    muted: rgba(ink, 0.8),
    accent,
    pattern,
    patternOpacity: pattern === 'marble' ? 0.22 : 0.08,
    grain: 0.06,
  }
}

export const familyThemes = (families: ColourFamily[]) => families.flatMap((family, i) => [lightTheme(family, i), darkTheme(family, i)])
