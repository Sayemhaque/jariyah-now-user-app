import React from 'react'
import type { LayoutProps } from './layoutTypes'
import { SunlitFrame, lightTone, shadowTone } from './SunlitFrame'
import { CurtainShadow } from './WindowShadows'

export const CurtainLayout: React.FC<LayoutProps> = (p) => (
  <SunlitFrame {...p} align="center" shadow={<CurtainShadow color={shadowTone(p.theme)} light={lightTone(p.theme)} />} />
)
