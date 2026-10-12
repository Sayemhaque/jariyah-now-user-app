import { useSettings } from '@/lib/store'
import { overlayPresets } from '@/lib/content/customize'
import { ColorField } from './ColorField'
import { OverlaySwatch } from './OverlaySwatch'
import { SectionTitle } from './SectionTitle'
import { SliderField } from './SliderField'

export function OverlaySection() {
  const { settings, updateSettings } = useSettings()
  const disabled = settings.overlayStyle === 'none'

  return (
    <>
      <SectionTitle>Overlay</SectionTitle>
      <div className="space-y-2.5">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 snap-x snap-mandatory">
          {overlayPresets.map((preset) => (
            <OverlaySwatch
              key={preset.key}
              label={preset.label}
              swatch={preset.swatch}
              selected={settings.overlayStyle === preset.key}
              onSelect={() => updateSettings({ overlayStyle: preset.key })}
            />
          ))}
        </div>
        <ColorField
          label="Color"
          value={settings.overlayColor}
          onChange={(overlayColor) => updateSettings({ overlayColor })}
          disabled={disabled}
        />
        <SliderField
          label="Opacity"
          valueLabel={disabled ? '—' : `${settings.overlayOpacity}%`}
          value={settings.overlayOpacity}
          min={0}
          max={80}
          disabled={disabled}
          onChange={(overlayOpacity) => updateSettings({ overlayOpacity })}
        />
      </div>
    </>
  )
}
