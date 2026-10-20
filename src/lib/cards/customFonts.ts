import type { CardFont, FontSlot } from './fontLibrary'

export const maxFontBytes = 8 * 1024 * 1024
export const fontFileTypes = /\.(ttf|otf|woff2?)$/i
const allSlots: FontSlot[] = ['titleLatin', 'titleBangla', 'textLatin', 'textBangla', 'arabic']

export interface StoredFont {
  name: string
  dataUrl: string
}

export const customFamily = (name: string) => `JariyahCustom-${name.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)}`

export function customFontFromName(name: string): CardFont {
  const family = customFamily(name)
  return { id: `custom:${family}`, label: `${name} (yours)`, family: `'${family}', serif`, weight: 400, style: 'normal', scale: 1, lineHeight: 1.3, slots: allSlots }
}

export function fontFaceCss(name: string, dataUrl: string): string {
  return `@font-face { font-family: '${customFamily(name)}'; src: url(${dataUrl}); font-display: block; }`
}

export const fontNameFromFile = (fileName: string) => fileName.replace(fontFileTypes, '').trim() || 'Custom font'
