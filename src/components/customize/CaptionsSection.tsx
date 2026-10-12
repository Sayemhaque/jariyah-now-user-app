import { useSettings } from '@/lib/store'
import { SectionTitle } from './SectionTitle'
import { SwitchField } from './SwitchField'

export function CaptionsSection() {
  const { settings, updateSettings } = useSettings()
  return (
    <>
      <SectionTitle>Captions</SectionTitle>
      <div className="space-y-2.5">
        <SwitchField
          label="Highlight words while reciting"
          checked={settings.wordHighlight ?? true}
          onChange={(wordHighlight) => updateSettings({ wordHighlight })}
        />
        <SwitchField
          label="Show translation"
          checked={settings.showTranslation}
          onChange={(showTranslation) => updateSettings({ showTranslation })}
        />
        <SwitchField
          label="Show transliteration"
          checked={settings.showTransliteration}
          onChange={(showTransliteration) => updateSettings({ showTransliteration })}
        />
      </div>
    </>
  )
}
