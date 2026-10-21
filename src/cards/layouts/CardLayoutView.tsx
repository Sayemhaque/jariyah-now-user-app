import React from 'react'
import type { CardLayout } from '@/lib/cards/types'
import { AngleLayout } from './AngleLayout'
import { ArchLayout } from './ArchLayout'
import { ArchlightLayout } from './ArchlightLayout'
import { BlindsLayout } from './BlindsLayout'
import { BotanicalLayout } from './BotanicalLayout'
import { CapsuleLayout } from './CapsuleLayout'
import { CrescentLayout } from './CrescentLayout'
import { CurtainLayout } from './CurtainLayout'
import { DawnLayout } from './DawnLayout'
import { DomeLayout } from './DomeLayout'
import { DunesLayout } from './DunesLayout'
import { EditorialLayout } from './EditorialLayout'
import { FloatingLayout } from './FloatingLayout'
import { FolioLayout } from './FolioLayout'
import { FrameLayout } from './FrameLayout'
import { GlassLayout } from './GlassLayout'
import { HaloLayout } from './HaloLayout'
import { JaliLayout } from './JaliLayout'
import { KhatamLayout } from './KhatamLayout'
import { LanternLayout } from './LanternLayout'
import { LatticeLayout } from './LatticeLayout'
import { ManuscriptLayout } from './ManuscriptLayout'
import { MedallionLayout } from './MedallionLayout'
import { MinimalLayout } from './MinimalLayout'
import { MonsteraLayout } from './MonsteraLayout'
import { NightLayout } from './NightLayout'
import { OceanLayout } from './OceanLayout'
import { OctagonLayout } from './OctagonLayout'
import { OgeeLayout } from './OgeeLayout'
import { OliveLayout } from './OliveLayout'
import { PaperLayout } from './PaperLayout'
import { PillarsLayout } from './PillarsLayout'
import { QuoteLayout } from './QuoteLayout'
import { ScrollLayout } from './ScrollLayout'
import { SplitLayout } from './SplitLayout'
import { StampLayout } from './StampLayout'
import { SunlitLayout } from './SunlitLayout'
import { TextureLayout } from './TextureLayout'
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
  blinds: BlindsLayout,
  monstera: MonsteraLayout,
  jali: JaliLayout,
  archlight: ArchlightLayout,
  olive: OliveLayout,
  curtain: CurtainLayout,
  texture: TextureLayout,
  ...premiumLayoutViews,
}

export const CardLayoutView: React.FC<LayoutProps & { layout: CardLayout }> = ({ layout, ...props }) => {
  const View = layoutViews[layout] ?? FrameLayout
  return <View {...props} />
}
