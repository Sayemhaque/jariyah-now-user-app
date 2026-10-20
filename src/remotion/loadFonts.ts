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
  'Galada': 'Galada',
  'Atma': 'Atma',
  'Great Vibes': 'Great Vibes',
  'Playfair Display': 'Playfair Display',
  'Aref Ruqaa': 'Aref Ruqaa',
  'Cinzel Decorative': 'Cinzel Decorative',
  'Marcellus': 'Marcellus',
  'Italiana': 'Italiana',
  'DM Serif Display': 'DM Serif Display',
  'Bodoni Moda': 'Bodoni Moda',
  'Pinyon Script': 'Pinyon Script',
  'Allura': 'Allura',
  'Lora': 'Lora',
  'Mina': 'Mina',
  'Baloo Da 2': 'Baloo Da 2',
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
  'Galada': [400],
  'Atma': [500, 600, 700],
  'Great Vibes': [400],
  'Playfair Display': [600, 700, 800],
  'Aref Ruqaa': [400, 700],
  'Cinzel Decorative': [400, 700],
  'Marcellus': [400],
  'Italiana': [400],
  'DM Serif Display': [400],
  'Bodoni Moda': [500, 700],
  'Pinyon Script': [400],
  'Allura': [400],
  'Lora': [400, 500, 600],
  'Mina': [400, 700],
  'Baloo Da 2': [500, 600, 700],
}

const italicFamilies = new Set(['Cormorant Garamond', 'Playfair Display', 'DM Serif Display', 'Bodoni Moda', 'Lora'])

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
