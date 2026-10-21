import React from 'react'
import type { LayoutProps } from './layoutTypes'
import { SunlitFrame, lightTone, shadowTone } from './SunlitFrame'
import { JaliShadow } from './WindowShadows'

export const JaliLayout: React.FC<LayoutProps> = (p) => (
  <SunlitFrame {...p} shadow={<JaliShadow color={shadowTone(p.theme)} light={lightTone(p.theme)} />} />
)
