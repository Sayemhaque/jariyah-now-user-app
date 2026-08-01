import { delayRender, continueRender } from 'remotion'

export const REMOTION_FONT_FAMILIES: Record<string, string> = {
  'Amiri': 'Amiri',
  'Scheherazade New': 'Scheherazade New',
  'Markazi Text': 'Markazi Text',
  'Noto Naskh Arabic': 'Noto Naskh Arabic',
  'Reem Kufi': 'Reem Kufi',
  'Cairo': 'Cairo',
  'Noto Sans Bengali': 'Noto Sans Bengali',
  'Noto Serif Bengali': 'Noto Serif Bengali',
  'Hind Siliguri': 'Hind Siliguri',
  'Inter': 'Inter',
}

const FONT_WEIGHTS: Record<string, number[]> = {
  'Amiri': [400, 700],
  'Scheherazade New': [400, 700],
  'Markazi Text': [400, 500, 600, 700],
  'Noto Naskh Arabic': [400, 500, 600, 700],
  'Reem Kufi': [400, 500, 600, 700],
  'Cairo': [400, 500, 600, 700],
  'Noto Sans Bengali': [400, 500, 600, 700],
  'Noto Serif Bengali': [400, 500, 600, 700],
  'Hind Siliguri': [300, 400, 500, 600, 700],
  'Inter': [400, 700],
}

function cssFamilyName(family: string): string {
  return family.replace(/\s+/g, '+')
}

function familyCssUrl(family: string): string {
  const weights = FONT_WEIGHTS[family] ?? [400]
  return `https://fonts.googleapis.com/css2?family=${cssFamilyName(family)}:wght@${weights.join(';')}&display=swap`
}

let fontsLoaded = false

export function ensureRemotionFonts(): void {
  if (fontsLoaded) return
  if (typeof document === 'undefined') return
  fontsLoaded = true

  const handle = delayRender('Loading Google Fonts for Remotion render')

  const families = Object.keys(FONT_WEIGHTS)

  Promise.all(
    families.map(async (family) => {
      try {
        const res = await fetch(familyCssUrl(family))
        if (!res.ok) return ''
        return await res.text()
      } catch {
        return ''
      }
    }),
  )
    .then((csses) => {
      const style = document.createElement('style')
      style.textContent = csses.filter(Boolean).join('\n')
      document.head.appendChild(style)
    })
    .finally(async () => {
      try {
        await document.fonts.ready
      } catch {
        // ignore
      }
      continueRender(handle)
    })
}
