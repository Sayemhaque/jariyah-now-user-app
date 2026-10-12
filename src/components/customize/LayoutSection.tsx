import { useSettings } from '@/lib/store'
import type { Orientation } from '@/lib/types'
import { OrientationOption } from './OrientationOption'
import { SectionTitle } from './SectionTitle'

const orientations: Orientation[] = ['portrait', 'landscape']

export function LayoutSection() {
  const { settings, setOrientation } = useSettings()
  return (
    <>
      <SectionTitle>Layout</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {orientations.map((orientation) => (
          <OrientationOption
            key={orientation}
            orientation={orientation}
            selected={settings.orientation === orientation}
            onSelect={() => setOrientation(orientation)}
          />
        ))}
      </div>
    </>
  )
}
