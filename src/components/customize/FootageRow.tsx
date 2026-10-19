import { footageScenes, sceneUrl } from '@/lib/backgroundPresets'
import { useSettings } from '@/lib/store'
import { BackgroundTile } from './BackgroundTile'

export function FootageRow() {
  const { settings, updateSettings } = useSettings()
  if (!footageScenes.length) return null
  return (
    <>
      <p className="mt-3 mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Cinematic footage</p>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 snap-x snap-mandatory">
        {footageScenes.map((scene) => (
          <BackgroundTile
            key={scene.key}
            label={scene.label}
            palette={scene.palette}
            imageUrl={scene.video?.replace(/\.mp4$/, '.jpg')}
            selected={settings.backgroundPreset === scene.key}
            onSelect={() => updateSettings({ backgroundImage: sceneUrl(scene.key), backgroundPreset: scene.key })}
          />
        ))}
      </div>
    </>
  )
}
