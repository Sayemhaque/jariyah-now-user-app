import React from 'react'
import type { LayoutProps } from './layoutTypes'
import { SunlitFrame, lightTone, shadowTone } from './SunlitFrame'
import { BlindsShadow } from './WindowShadows'

export const BlindsLayout: React.FC<LayoutProps> = (p) => (
  <SunlitFrame {...p} shadow={<BlindsShadow color={shadowTone(p.theme)} light={lightTone(p.theme)} />} />
)
