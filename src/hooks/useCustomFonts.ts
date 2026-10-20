import { useEffect } from 'react'
import { toast } from 'sonner'
import { useContent } from '@/lib/contentStore'
import { customFontFromName, fontFaceCss, fontFileTypes, fontNameFromFile, maxFontBytes, type StoredFont } from '@/lib/cards/customFonts'

const storageKey = 'jariyah-custom-fonts'
const maxStoredChars = 4_000_000

function installFont({ name, dataUrl }: StoredFont) {
  const id = `font-${name}`
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = fontFaceCss(name, dataUrl)
  document.head.appendChild(style)
}

const readStored = (): StoredFont[] => {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as StoredFont[]
  } catch {
    return []
  }
}

function store(font: StoredFont) {
  try {
    const next = [...readStored().filter((f) => f.name !== font.name), font]
    if (JSON.stringify(next).length < maxStoredChars) window.localStorage.setItem(storageKey, JSON.stringify(next))
  } catch {}
}

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

export function useCustomFonts() {
  const { addCustomFont } = useContent()

  useEffect(() => {
    const timer = setTimeout(() => readStored().forEach((font) => { installFont(font); addCustomFont(customFontFromName(font.name), false) }), 0)
    return () => clearTimeout(timer)
  }, [])

  return async (file: File) => {
    if (!fontFileTypes.test(file.name)) return toast.error('Please choose a .ttf, .otf, .woff or .woff2 font file')
    if (file.size > maxFontBytes) return toast.error('Font file is larger than 8 MB')
    const font = { name: fontNameFromFile(file.name), dataUrl: await readAsDataUrl(file) }
    installFont(font)
    await document.fonts.load(`40px '${customFontFromName(font.name).family.split(',')[0]!.replace(/'/g, '')}'`).catch(() => [])
    store(font)
    addCustomFont(customFontFromName(font.name))
    toast.success(`${font.name} added — it is now your title font`)
  }
}
