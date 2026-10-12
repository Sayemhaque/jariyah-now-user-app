import React from 'react'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { MilkyWay } from './MilkyWay'
import { PalmDunes } from './PalmDunes'
import { StarField } from './StarField'

export const DesertStarlight: React.FC<{ palette: ScenePalette }> = ({ palette }) => (
  <>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 90% 30% at 50% 100%, rgba(255,150,120,0.45) 0%, rgba(140,90,200,0.25) 45%, transparent 75%)',
      }}
    />
    <MilkyWay />
    <StarField color={palette.pattern} />
    <PalmDunes color="#05060f" />
  </>
)
