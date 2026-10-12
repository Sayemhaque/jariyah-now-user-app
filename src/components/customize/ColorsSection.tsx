import { Palette } from 'lucide-react'
import { useSettings } from '@/lib/store'
import { defaultScene } from '@/lib/backgroundPresets'
import type { VideoSettings } from '@/lib/types'
import { ColorField } from './ColorField'
import { SectionTitle } from './SectionTitle'
import { SwitchField } from './SwitchField'

type ColorKey = 'fontColor' | 'highlightColor' | 'translationColor'

const colorFields: { key: ColorKey; label: string }[] = [
  { key: 'fontColor', label: 'Arabic text' },
  { key: 'highlightColor', label: 'Highlight' },
  { key: 'translationColor', label: 'Translation' },
]

export function ColorsSection() {
  const { settings, updateSettings } = useSettings()
  const auto = settings.autoColors !== false
  const setManual = (key: ColorKey, value: string) => updateSettings({ [key]: value, autoColors: false } as Partial<VideoSettings>)

  return (
    <>
      <SectionTitle>Colors</SectionTitle>
      <div className="space-y-2.5">
        <SwitchField icon={Palette} label="Match colors to background" checked={auto} onChange={(autoColors) => updateSettings({ autoColors })} />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {auto
            ? 'Text and highlight colors follow the selected background. Pick a color below to set it yourself.'
            : 'Using your own colors. Turn the switch on to match the background again.'}
        </p>
        {colorFields.map((field) => (
          <ColorField
            key={field.key}
            label={field.label}
            value={settings[field.key] ?? defaultScene.palette.translation}
            onChange={(value) => setManual(field.key, value)}
          />
        ))}
      </div>
    </>
  )
}
