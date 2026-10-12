import { useSettings } from '@/lib/store'
import { SliderField } from './SliderField'

export function FontSizeFields() {
  const { settings, updateSettings } = useSettings()
  return (
    <>
      <SliderField
        label="Arabic font size"
        valueLabel={`${settings.arabicFontSize}px`}
        value={settings.arabicFontSize}
        min={24}
        max={72}
        disabled={settings.autoFitFonts}
        onChange={(arabicFontSize) => updateSettings({ arabicFontSize })}
      />
      <SliderField
        label="Translation font size"
        valueLabel={`${settings.translationFontSize}px`}
        value={settings.translationFontSize}
        min={14}
        max={32}
        disabled={settings.autoFitFonts}
        onChange={(translationFontSize) => updateSettings({ translationFontSize })}
      />
    </>
  )
}
