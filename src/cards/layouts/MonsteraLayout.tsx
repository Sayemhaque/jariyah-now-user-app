import React from 'react'
import type { LayoutProps } from './layoutTypes'
import { WindowLight } from './LightShadows'
import { MonsteraShadow } from './PlantShadows'
import { SunlitFrame, shadowTone } from './SunlitFrame'

export const MonsteraLayout: React.FC<LayoutProps> = (p) => (
  <SunlitFrame
    {...p}
    shadow={
      <>
        <WindowLight light={p.theme.light} />
        <MonsteraShadow width={p.width} height={p.height} color={shadowTone(p.theme)} />
      </>
    }
  />
)
