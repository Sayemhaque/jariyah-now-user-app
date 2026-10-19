import { videoStyleOptions } from '@/lib/content/customize'
import { useSettings } from '@/lib/store'
import { SectionTitle } from './SectionTitle'
import { StyleOption } from './StyleOption'

export function StyleSection() {
  const { settings, updateSettings } = useSettings()
  const current = settings.videoStyle ?? 'visualizer'
  return (
    <>
      <SectionTitle>Video style</SectionTitle>
      <div className="grid grid-cols-3 gap-2">
        {videoStyleOptions.map((option) => (
          <StyleOption
            key={option.key}
            styleKey={option.key}
            label={option.label}
            description={option.description}
            selected={current === option.key}
            onSelect={() => updateSettings({ videoStyle: option.key })}
          />
        ))}
      </div>
    </>
  )
}
