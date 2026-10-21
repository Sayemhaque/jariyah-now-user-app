import React from 'react'
import type { CardLayout } from '@/lib/cards/types'
import { AngleLayout } from './AngleLayout'
import { ArchLayout } from './ArchLayout'
import { BotanicalLayout } from './BotanicalLayout'
import { CapsuleLayout } from './CapsuleLayout'
import { CrescentLayout } from './CrescentLayout'
import { DawnLayout } from './DawnLayout'
import { DomeLayout } from './DomeLayout'
import { DunesLayout } from './DunesLayout'
import { EditorialLayout } from './EditorialLayout'
import { FloatingLayout } from './FloatingLayout'
import { FolioLayout } from './FolioLayout'
import { FrameLayout } from './FrameLayout'
import { GlassLayout } from './GlassLayout'
import { HaloLayout } from './HaloLayout'
import { KhatamLayout } from './KhatamLayout'
import { LanternLayout } from './LanternLayout'
import { LatticeLayout } from './LatticeLayout'
import { ManuscriptLayout } from './ManuscriptLayout'
import { MedallionLayout } from './MedallionLayout'
import { MinimalLayout } from './MinimalLayout'
import { NightLayout } from './NightLayout'
import { OceanLayout } from './OceanLayout'
import { OctagonLayout } from './OctagonLayout'
import { OgeeLayout } from './OgeeLayout'
import { PaperLayout } from './PaperLayout'
import { PillarsLayout } from './PillarsLayout'
import { QuoteLayout } from './QuoteLayout'
import { ScrollLayout } from './ScrollLayout'
import { SplitLayout } from './SplitLayout'
import { SunlitLayout } from './SunlitLayout'
import { TextureLayout } from './TextureLayout'
import { StampLayout } from './StampLayout'
import { TileLayout } from './TileLayout'
import { ZelligeLayout } from './ZelligeLayout'
import type { LayoutProps } from './layoutTypes'
import { premiumLayoutViews } from './premium/premiumLayouts'

const layoutViews: Record<CardLayout, React.FC<LayoutProps>> = {
  frame: FrameLayout,
  arch: ArchLayout,
  editorial: EditorialLayout,
  split: SplitLayout,
  floating: FloatingLayout,
  quote: QuoteLayout,
  tile: TileLayout,
  night: NightLayout,
  botanical: BotanicalLayout,
  glass: GlassLayout,
  manuscript: ManuscriptLayout,
  minimal: MinimalLayout,
  medallion: MedallionLayout,
  dome: DomeLayout,
  octagon: OctagonLayout,
  khatam: KhatamLayout,
  scroll: ScrollLayout,
  lantern: LanternLayout,
  ogee: OgeeLayout,
  zellige: ZelligeLayout,
  pillars: PillarsLayout,
  halo: HaloLayout,
  dawn: DawnLayout,
  dunes: DunesLayout,
  ocean: OceanLayout,
  stamp: StampLayout,
  paper: PaperLayout,
  angle: AngleLayout,
  capsule: CapsuleLayout,
  lattice: LatticeLayout,
  folio: FolioLayout,
  crescent: CrescentLayout,
  sunlit: SunlitLayout,
  texture: TextureLayout,
  ...premiumLayoutViews,
}

export const CardLayoutView: React.FC<LayoutProps & { layout: CardLayout }> = ({ layout, ...props }) => {
  const View = layoutViews[layout] ?? FrameLayout
  return <View {...props} />
}
