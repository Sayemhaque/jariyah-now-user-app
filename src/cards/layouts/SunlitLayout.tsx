import React from 'react'
import type { LayoutProps } from './layoutTypes'
import { PalmShadow, WindowLight } from './LightShadows'
import { SunlitFrame, shadowTone } from './SunlitFrame'

export const SunlitLayout: React.FC<LayoutProps> = (p) => (
  <SunlitFrame
    {...p}
    shadow={
      <>
        <WindowLight light={p.theme.light} />
        <PalmShadow width={p.width} height={p.height} color={shadowTone(p.theme)} />
      </>
    }
  />
)
