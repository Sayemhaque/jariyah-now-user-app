import React from 'react'
import type { BackgroundScene } from '@/lib/backgroundPresets'
import { ArchColonnade } from './ArchColonnade'
import { AuroraRibbons } from './AuroraRibbons'
import { DesertStarlight } from './DesertStarlight'
import { DuneLayers } from './DuneLayers'
import { GoldenBokeh } from './GoldenBokeh'
import { GoldenDusk } from './GoldenDusk'
import { HeavenlyLight } from './HeavenlyLight'
import { MoonlitArch } from './MoonlitArch'
import { RamadanLanterns } from './RamadanLanterns'
import { GirihPattern } from './GirihPattern'
import { LightRays } from './LightRays'
import { StarField } from './StarField'

export const SceneMotif: React.FC<{ scene: BackgroundScene }> = ({ scene }) => {
  const { pattern, base } = scene.palette
  switch (scene.motif) {
    case 'dusk':
      return <GoldenDusk palette={scene.palette} />
    case 'lanterns':
      return <RamadanLanterns palette={scene.palette} />
    case 'bokeh':
      return <GoldenBokeh palette={scene.palette} />
    case 'starlight':
      return <DesertStarlight palette={scene.palette} />
    case 'arch':
      return <MoonlitArch palette={scene.palette} />
    case 'heavenly':
      return <HeavenlyLight palette={scene.palette} />
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
