import React from 'react'
import type { BackgroundScene, ScenePalette, SceneMotif } from '@/lib/backgroundPresets'
import { DesertCaravan } from './DesertCaravan'
import { DesertTrain } from './DesertTrain'
import { EveningRide } from './EveningRide'
import { LanternLake } from './LanternLake'
import { MasjidWalk } from './MasjidWalk'
import { NightDrive } from './NightDrive'
import { RainyEvening } from './RainyEvening'
import { SunsetSail } from './SunsetSail'
import { TreeReading } from './TreeReading'

const journeys: Partial<Record<SceneMotif, React.FC<{ palette: ScenePalette }>>> = {
  ride: EveningRide,
  drive: NightDrive,
  walk: MasjidWalk,
  sail: SunsetSail,
  caravan: DesertCaravan,
  train: DesertTrain,
  reader: TreeReading,
  rain: RainyEvening,
  lake: LanternLake,
}

export const isJourneyMotif = (motif: SceneMotif) => motif in journeys

export const JourneyScene: React.FC<{ scene: BackgroundScene }> = ({ scene }) => {
  const Journey = journeys[scene.motif] ?? EveningRide
  return <Journey palette={scene.palette} />
}
