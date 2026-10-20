import { useSettings } from '@/lib/store'
import { SectionTitle } from './SectionTitle'
import { SwitchField } from './SwitchField'

export function CaptionsSection() {
  const { settings, updateSettings } = useSettings()
  return (
    <>
      <SectionTitle>লেখা</SectionTitle>
      <div className="space-y-2.5">
        <SwitchField
          label="তিলাওয়াতের সাথে শব্দ হাইলাইট"
          checked={settings.wordHighlight ?? true}
          onChange={(wordHighlight) => updateSettings({ wordHighlight })}
        />
        <SwitchField
          label="অনুবাদ দেখান"
          checked={settings.showTranslation}
          onChange={(showTranslation) => updateSettings({ showTranslation })}
        />
        <SwitchField
          label="উচ্চারণ দেখান"
          checked={settings.showTransliteration}
          onChange={(showTransliteration) => updateSettings({ showTransliteration })}
        />
      </div>
    </>
  )
}
