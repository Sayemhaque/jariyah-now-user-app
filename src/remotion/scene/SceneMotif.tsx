import React from 'react'
import type { BackgroundScene } from '@/lib/backgroundPresets'
import { ArchColonnade } from './ArchColonnade'
import { AuroraRibbons } from './AuroraRibbons'
import { DuneLayers } from './DuneLayers'
import { GirihPattern } from './GirihPattern'
import { LightRays } from './LightRays'
import { StarField } from './StarField'

export const SceneMotif: React.FC<{ scene: BackgroundScene }> = ({ scene }) => {
  const { pattern, base } = scene.palette
  switch (scene.motif) {
    case 'girih':
      return <GirihPattern color={pattern} />
    case 'arches':
      return <ArchColonnade color={pattern} />
    case 'stars':
      return <StarField color={pattern} />
    case 'aurora':
      return <AuroraRibbons color={pattern} />
    case 'dunes':
      return <DuneLayers color={pattern} base={base[2]} />
    default:
      return <LightRays color={pattern} />
  }
}
