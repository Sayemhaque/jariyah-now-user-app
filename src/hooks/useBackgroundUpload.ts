import { toast } from 'sonner'
import { useSettings } from '@/lib/store'
import { validateBackgroundImage } from '@/lib/uploadValidation'

export function useBackgroundUpload() {
  const { updateSettings } = useSettings()
  return (file?: File) => {
    if (!file) return
    const validation = validateBackgroundImage(file)
    if (!validation.ok) {
      toast.error(validation.error)
      return
    }
    const reader = new FileReader()
    reader.onload = () => updateSettings({ backgroundImage: String(reader.result || ''), backgroundPreset: 'custom' })
    reader.readAsDataURL(file)
  }
}
