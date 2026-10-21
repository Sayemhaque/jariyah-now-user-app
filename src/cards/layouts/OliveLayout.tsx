import React from 'react'
import type { LayoutProps } from './layoutTypes'
import { WindowLight } from './LightShadows'
import { OliveShadow } from './PlantShadows'
import { SunlitFrame, shadowTone } from './SunlitFrame'

export const OliveLayout: React.FC<LayoutProps> = (p) => (
  <SunlitFrame
    {...p}
    shadow={
      <>
        <WindowLight light={p.theme.light} />
        <OliveShadow width={p.width} height={p.height} color={shadowTone(p.theme)} />
      </>
    }
  />
)
