import React from 'react'
import type { BackgroundScene } from '@/lib/backgroundPresets'
import { ArchColonnade } from './ArchColonnade'
import { CelestialMandala } from './CelestialMandala'
import { JourneyScene } from './journey/JourneyScene'
import { GoldLattice } from './GoldLattice'
import { LiquidGold } from './LiquidGold'
import { RoseHaze } from './RoseHaze'
import { SilkAurora } from './SilkAurora'
import { VelvetBokeh } from './VelvetBokeh'
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
    case 'ride':
    case 'drive':
    case 'walk':
      return <JourneyScene scene={scene} />
    case 'silk':
      return <SilkAurora />
    case 'liquid':
      return <LiquidGold palette={scene.palette} />
    case 'mandala':
      return <CelestialMandala palette={scene.palette} />
    case 'velvet':
      return <VelvetBokeh palette={scene.palette} />
    case 'lattice':
      return <GoldLattice palette={scene.palette} />
    case 'haze':
      return <RoseHaze palette={scene.palette} />
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
