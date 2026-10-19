import { OptionButton } from '@/components/common/OptionButton'
import { soundAnimationOptions } from '@/lib/content/customize'
import { useSettings } from '@/lib/store'
import { SectionTitle } from './SectionTitle'

export function SoundAnimationSection() {
  const { settings, updateSettings } = useSettings()
  const current = settings.soundAnimation ?? 'bars'
  return (
    <>
      <SectionTitle>Sound animation</SectionTitle>
      <div className="grid grid-cols-4 gap-2">
        {soundAnimationOptions.map(({ key, label, icon: Icon }) => (
          <OptionButton
            key={key}
            selected={current === key}
            onSelect={() => updateSettings({ soundAnimation: key })}
            glow
            className="flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </OptionButton>
        ))}
      </div>
    </>
  )
}
