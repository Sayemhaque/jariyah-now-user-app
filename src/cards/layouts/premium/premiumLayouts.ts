import type React from 'react'
import type { PremiumCardLayout } from '@/lib/cards/types'
import type { LayoutProps } from '../layoutTypes'
import { ShamsaLayout } from './ShamsaLayout'
import { CarpetLayout } from './CarpetLayout'
import { CartoucheLayout } from './CartoucheLayout'
import { TezhipLayout } from './TezhipLayout'
import { MarbleLayout } from './MarbleLayout'
import { MinaretLayout } from './MinaretLayout'
import { WindowLayout } from './WindowLayout'
import { TriplearchLayout } from './TriplearchLayout'
import { HorseshoeLayout } from './HorseshoeLayout'
import { IwanLayout } from './IwanLayout'
import { MultifoilLayout } from './MultifoilLayout'
import { RosetteLayout } from './RosetteLayout'
import { GirihLayout } from './GirihLayout'
import { HexagonLayout } from './HexagonLayout'
import { CompassLayout } from './CompassLayout'
import { EclipseLayout } from './EclipseLayout'
import { BookmarkLayout } from './BookmarkLayout'
import { PennantLayout } from './PennantLayout'
import { TabletLayout } from './TabletLayout'
import { LetterLayout } from './LetterLayout'
import { GalleryLayout } from './GalleryLayout'
import { CoverLayout } from './CoverLayout'
import { GazetteLayout } from './GazetteLayout'
import { SidebarLayout } from './SidebarLayout'
import { StackLayout } from './StackLayout'
import { DeckleLayout } from './DeckleLayout'
import { CropmarksLayout } from './CropmarksLayout'
import { RibbonframeLayout } from './RibbonframeLayout'
import { SpotlightLayout } from './SpotlightLayout'
import { AuroraLayout } from './AuroraLayout'
import { DotgridLayout } from './DotgridLayout'
import { RippleLayout } from './RippleLayout'
import { OrbitLayout } from './OrbitLayout'
import { ConstellationLayout } from './ConstellationLayout'
import { MountainsLayout } from './MountainsLayout'
import { PalmsLayout } from './PalmsLayout'
import { GardenLayout } from './GardenLayout'
import { LaurelLayout } from './LaurelLayout'
import { TulipLayout } from './TulipLayout'
import { RainLayout } from './RainLayout'
import { BracketLayout } from './BracketLayout'
import { MeanderLayout } from './MeanderLayout'
import { ChevronLayout } from './ChevronLayout'
import { SunsetLayout } from './SunsetLayout'
import { MoonphaseLayout } from './MoonphaseLayout'
import { GarlandLayout } from './GarlandLayout'
import { WatercolorLayout } from './WatercolorLayout'
import { PrismLayout } from './PrismLayout'
import { PearlLayout } from './PearlLayout'
import { LaceLayout } from './LaceLayout'

export const premiumLayoutViews: Record<PremiumCardLayout, React.FC<LayoutProps>> = {
  shamsa: ShamsaLayout,
  carpet: CarpetLayout,
  cartouche: CartoucheLayout,
  tezhip: TezhipLayout,
  marble: MarbleLayout,
  minaret: MinaretLayout,
  window: WindowLayout,
  triplearch: TriplearchLayout,
  horseshoe: HorseshoeLayout,
  iwan: IwanLayout,
  multifoil: MultifoilLayout,
  rosette: RosetteLayout,
  girih: GirihLayout,
  hexagon: HexagonLayout,
  compass: CompassLayout,
  eclipse: EclipseLayout,
  bookmark: BookmarkLayout,
  pennant: PennantLayout,
  tablet: TabletLayout,
  letter: LetterLayout,
  gallery: GalleryLayout,
  cover: CoverLayout,
  gazette: GazetteLayout,
  sidebar: SidebarLayout,
  stack: StackLayout,
  deckle: DeckleLayout,
  cropmarks: CropmarksLayout,
  ribbonframe: RibbonframeLayout,
  spotlight: SpotlightLayout,
  aurora: AuroraLayout,
  dotgrid: DotgridLayout,
  ripple: RippleLayout,
  orbit: OrbitLayout,
  constellation: ConstellationLayout,
  mountains: MountainsLayout,
  palms: PalmsLayout,
  garden: GardenLayout,
  laurel: LaurelLayout,
  tulip: TulipLayout,
  rain: RainLayout,
  bracket: BracketLayout,
  meander: MeanderLayout,
  chevron: ChevronLayout,
  sunset: SunsetLayout,
  moonphase: MoonphaseLayout,
  garland: GarlandLayout,
  watercolor: WatercolorLayout,
  prism: PrismLayout,
  pearl: PearlLayout,
  lace: LaceLayout,
}
