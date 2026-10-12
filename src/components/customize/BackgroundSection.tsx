import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { useSettings } from '@/lib/store'
import { bgPresets, getBackgroundPresetUrl } from '@/lib/backgroundPresets'
import { useBackgroundUpload } from '@/hooks/useBackgroundUpload'
import { Button } from '@/components/ui/button'
import { BackgroundTile } from './BackgroundTile'
import { SectionTitle } from './SectionTitle'

export function BackgroundSection() {
  const { settings, updateSettings } = useSettings()
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useBackgroundUpload()

  return (
    <>
      <SectionTitle>Background</SectionTitle>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 snap-x snap-mandatory">
        {bgPresets.map((preset) => {
          const url = getBackgroundPresetUrl(preset.key, settings.orientation)
          return (
            <BackgroundTile
              key={preset.key}
              preset={preset}
              url={url}
              selected={settings.backgroundPreset === preset.key}
              onSelect={() => updateSettings({ backgroundImage: url, backgroundPreset: preset.key })}
            />
          )
        })}
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
