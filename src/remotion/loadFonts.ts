import { delayRender, continueRender } from 'remotion'

export const remotionFontFamilies: Record<string, string> = {
  'Anek Bangla': 'Anek Bangla',
  'Tiro Bangla': 'Tiro Bangla',
  'Amiri Quran': 'Amiri Quran',
  'EB Garamond': 'EB Garamond',
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
  'Cormorant Garamond': 'Cormorant Garamond',
  'Cinzel': 'Cinzel',
}

const fontWeights: Record<string, number[]> = {
  'Anek Bangla': [400, 500, 600],
  'Tiro Bangla': [400],
  'Amiri Quran': [400],
  'EB Garamond': [400, 500, 600],
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
  'Cormorant Garamond': [400, 500, 600],
  'Cinzel': [400, 500, 600],
}

const italicFamilies = new Set(['Cormorant Garamond'])

function cssFamilyName(family: string): string {
  return family.replace(/\s+/g, '+')
}

function familyCssUrl(family: string): string {
  const weights = fontWeights[family] ?? [400]
  const axes = italicFamilies.has(family) ? `ital,wght@${[0, 1].flatMap((ital) => weights.map((w) => `${ital},${w}`)).join(';')}` : `wght@${weights.join(';')}`
  return `https://fonts.googleapis.com/css2?family=${cssFamilyName(family)}:${axes}&display=swap`
}

let fontsLoaded = false
let resolveFontsReady: () => void = () => {}
const fontsReadyPromise = new Promise<void>((resolve) => {
  resolveFontsReady = resolve
})

export const remotionFontsReady = () => fontsReadyPromise

export function ensureRemotionFonts(): void {
  if (fontsLoaded) return
  if (typeof document === 'undefined') return
  fontsLoaded = true

  const handle = delayRender('Loading Google Fonts for Remotion render')

  const families = Object.keys(fontWeights)

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
      }
      resolveFontsReady()
      continueRender(handle)
    })
}
