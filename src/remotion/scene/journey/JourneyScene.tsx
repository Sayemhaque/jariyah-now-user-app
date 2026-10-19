import React from 'react'
import type { BackgroundScene } from '@/lib/backgroundPresets'
import { EveningRide } from './EveningRide'
import { MasjidWalk } from './MasjidWalk'
import { NightDrive } from './NightDrive'

export const JourneyScene: React.FC<{ scene: BackgroundScene }> = ({ scene }) => {
  if (scene.motif === 'drive') return <NightDrive palette={scene.palette} />
  if (scene.motif === 'walk') return <MasjidWalk palette={scene.palette} />
  return <EveningRide palette={scene.palette} />
}
