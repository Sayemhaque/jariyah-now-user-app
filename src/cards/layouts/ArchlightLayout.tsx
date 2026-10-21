import React from 'react'
import type { LayoutProps } from './layoutTypes'
import { SunlitFrame, lightTone, shadowTone } from './SunlitFrame'
import { ArchLight } from './WindowShadows'

export const ArchlightLayout: React.FC<LayoutProps> = (p) => (
  <SunlitFrame {...p} align="center" shadow={<ArchLight color={shadowTone(p.theme)} light={lightTone(p.theme)} />} />
)
