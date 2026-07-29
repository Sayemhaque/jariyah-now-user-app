import { registerFont } from 'canvas'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const FONT_DIR = '/tmp/jariyah-fonts'

interface FontDef {
  family: string
  weight: number
  style: string
}

const FONTS: FontDef[] = [
  { family: 'Inter', weight: 400, style: 'normal' },
  { family: 'Inter', weight: 700, style: 'normal' },
  { family: 'EB Garamond', weight: 400, style: 'normal' },
  { family: 'EB Garamond', weight: 500, style: 'normal' },
  { family: 'EB Garamond', weight: 600, style: 'normal' },
  { family: 'EB Garamond', weight: 700, style: 'normal' },
  { family: 'EB Garamond', weight: 800, style: 'normal' },
  { family: 'Amiri', weight: 400, style: 'normal' },
  { family: 'Amiri', weight: 700, style: 'normal' },
  { family: 'Scheherazade New', weight: 400, style: 'normal' },
  { family: 'Scheherazade New', weight: 700, style: 'normal' },
  { family: 'Markazi Text', weight: 400, style: 'normal' },
  { family: 'Markazi Text', weight: 500, style: 'normal' },
  { family: 'Markazi Text', weight: 600, style: 'normal' },
  { family: 'Markazi Text', weight: 700, style: 'normal' },
  { family: 'Noto Naskh Arabic', weight: 400, style: 'normal' },
  { family: 'Noto Naskh Arabic', weight: 500, style: 'normal' },
  { family: 'Noto Naskh Arabic', weight: 600, style: 'normal' },
  { family: 'Noto Naskh Arabic', weight: 700, style: 'normal' },
  { family: 'Reem Kufi', weight: 400, style: 'normal' },
  { family: 'Reem Kufi', weight: 500, style: 'normal' },
  { family: 'Reem Kufi', weight: 600, style: 'normal' },
  { family: 'Reem Kufi', weight: 700, style: 'normal' },
  { family: 'Cairo', weight: 400, style: 'normal' },
  { family: 'Cairo', weight: 500, style: 'normal' },
  { family: 'Cairo', weight: 600, style: 'normal' },
  { family: 'Cairo', weight: 700, style: 'normal' },
  { family: 'Noto Sans Bengali', weight: 400, style: 'normal' },
  { family: 'Noto Sans Bengali', weight: 500, style: 'normal' },
  { family: 'Noto Sans Bengali', weight: 600, style: 'normal' },
  { family: 'Noto Sans Bengali', weight: 700, style: 'normal' },
  { family: 'Noto Serif Bengali', weight: 400, style: 'normal' },
  { family: 'Noto Serif Bengali', weight: 500, style: 'normal' },
  { family: 'Noto Serif Bengali', weight: 600, style: 'normal' },
  { family: 'Noto Serif Bengali', weight: 700, style: 'normal' },
  { family: 'Hind Siliguri', weight: 300, style: 'normal' },
  { family: 'Hind Siliguri', weight: 400, style: 'normal' },
  { family: 'Hind Siliguri', weight: 500, style: 'normal' },
  { family: 'Hind Siliguri', weight: 600, style: 'normal' },
  { family: 'Hind Siliguri', weight: 700, style: 'normal' },
]

function familyCssName(family: string): string {
  return family.replace(/\s+/g, '+')
}

async function resolveFamilyFonts(family: string, weights: number[]): Promise<Map<number, string>> {
  const weightParam = weights.join(';')
  const cssUrl = `https://fonts.googleapis.com/css2?family=${familyCssName(family)}:wght@${weightParam}&display=swap`

  let lastErr: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt))
    try {
      const res = await fetch(cssUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const css = await res.text()
      const result = new Map<number, string>()
      const blocks = css.split('@font-face').slice(1)
      for (const block of blocks) {
        const wMatch = block.match(/font-weight:\s*(\d+)/)
        const uMatch = block.match(/url\(([^)]+)\)/)
        if (wMatch && uMatch) {
          result.set(parseInt(wMatch[1]!, 10), uMatch[1]!)
        }
      }
      return result
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastErr ?? new Error(`Failed to fetch font CSS for ${family}`)
}

let initialized = false

export async function ensureFonts(): Promise<void> {
  if (initialized) return
  initialized = true

  if (!existsSync(FONT_DIR)) {
    mkdirSync(FONT_DIR, { recursive: true })
  }

  const families = new Map<string, FontDef[]>()
  for (const font of FONTS) {
    const list = families.get(font.family) ?? []
    list.push(font)
    families.set(font.family, list)
  }

  const entries = Array.from(families.entries())

  for (const [family, defs] of entries) {
    const weights = [...new Set(defs.map((d) => d.weight))]
    const urlMap = await resolveFamilyFonts(family, weights)

    for (const font of defs) {
      const filename = `${familyCssName(font.family)}-${font.weight}.ttf`
      const path = join(FONT_DIR, filename)

      if (!existsSync(path)) {
        const url = urlMap.get(font.weight)
        if (!url) throw new Error(`No font URL for ${font.family} weight ${font.weight}`)
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Failed to download ${font.family} ${font.weight}: ${res.status}`)
        const buf = Buffer.from(await res.arrayBuffer())
        writeFileSync(path, buf)
      }
    }
  }

  for (const font of FONTS) {
    const filename = `${familyCssName(font.family)}-${font.weight}.ttf`
    const path = join(FONT_DIR, filename)
    registerFont(path, {
      family: font.family,
      weight: font.weight as any,
      style: font.style as any,
    })
  }
}
