import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { templatePresets } from '@/lib/templatePresets'
import { getBackgroundPresetUrl } from '@/lib/backgroundPresets'
import { useBuilderStore } from '@/lib/store'

export function useApplyTemplate() {
  const router = useRouter()
  const setSurah = useBuilderStore((s) => s.setSurah)
  const setFromAyat = useBuilderStore((s) => s.setFromAyat)
  const setToAyat = useBuilderStore((s) => s.setToAyat)
  const setReciter = useBuilderStore((s) => s.setReciter)
  const setTranslation = useBuilderStore((s) => s.setTranslation)
  const updateSettings = useBuilderStore((s) => s.updateSettings)

  return (templateId: string) => {
    const template = templatePresets.find((t) => t.id === templateId)
    if (!template) {
      toast.error('Template not found')
      return
    }
    const config = template.config
    setSurah(config.surah)
    Promise.resolve().then(() => {
      setFromAyat(config.fromAyat)
      setToAyat(config.toAyat)
      if (config.reciterId) setReciter(config.reciterId)
      if (config.translationKey) setTranslation(config.translationKey)
      if (config.backgroundPreset) {
        updateSettings({
          backgroundPreset: config.backgroundPreset,
          backgroundImage: getBackgroundPresetUrl(config.backgroundPreset),
        })
      }
      if (config.arabicFont) updateSettings({ arabicFont: config.arabicFont, fontStyle: config.arabicFont })
      if (config.highlightColor) updateSettings({ highlightColor: config.highlightColor })
    })
    toast.success(`Loading "${template.title}" template…`)
    router.push('/app')
  }
}
