import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { useSettings } from '@/lib/store'
import { backgroundScenes, customPresetKey, sceneUrl } from '@/lib/backgroundPresets'
import { useBackgroundUpload } from '@/hooks/useBackgroundUpload'
import { Button } from '@/components/ui/button'
import { BackgroundTile } from './BackgroundTile'
import { SectionTitle } from './SectionTitle'

export function BackgroundSection() {
  const { settings, updateSettings } = useSettings()
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useBackgroundUpload()
  const custom = settings.backgroundPreset === customPresetKey && settings.backgroundPalette

  return (
    <>
      <SectionTitle>Background</SectionTitle>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 snap-x snap-mandatory">
        {backgroundScenes.map((scene) => (
          <BackgroundTile
            key={scene.key}
            label={scene.label}
            palette={scene.palette}
            selected={settings.backgroundPreset === scene.key}
            onSelect={() => updateSettings({ backgroundImage: sceneUrl(scene.key), backgroundPreset: scene.key })}
          />
        ))}
        {custom && (
          <BackgroundTile label="Your image" palette={custom} imageUrl={settings.backgroundImage} selected onSelect={() => undefined} />
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => upload(event.target.files?.[0])}
        />
        <Button variant="outline" size="sm" className="w-full bg-card/40 hover:bg-card/70" onClick={() => fileRef.current?.click()}>
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          Upload custom background
        </Button>
      </div>
    </>
  )
}
