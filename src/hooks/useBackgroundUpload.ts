import { toast } from 'sonner'
import { useSettings } from '@/lib/store'
import { customPresetKey } from '@/lib/backgroundPresets'
import { extractImagePalette } from '@/lib/imagePalette'
import { validateBackgroundImage } from '@/lib/uploadValidation'

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function useBackgroundUpload() {
  const { updateSettings } = useSettings()
  return async (file?: File) => {
    if (!file) return
    const validation = validateBackgroundImage(file)
    if (!validation.ok) {
      toast.error(validation.error)
      return
    }
    const dataUrl = await readAsDataUrl(file)
    const palette = await extractImagePalette(dataUrl)
    updateSettings({ backgroundImage: dataUrl, backgroundPreset: customPresetKey, backgroundPalette: palette ?? undefined })
  }
}
