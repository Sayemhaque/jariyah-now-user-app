import React from 'react'
import type { CardLayout } from '@/lib/cards/types'
import { ArchLayout } from './ArchLayout'
import { BotanicalLayout } from './BotanicalLayout'
import { EditorialLayout } from './EditorialLayout'
import { FloatingLayout } from './FloatingLayout'
import { FrameLayout } from './FrameLayout'
import { GlassLayout } from './GlassLayout'
import { ManuscriptLayout } from './ManuscriptLayout'
import { MinimalLayout } from './MinimalLayout'
import { NightLayout } from './NightLayout'
import { QuoteLayout } from './QuoteLayout'
import { SplitLayout } from './SplitLayout'
import { TileLayout } from './TileLayout'
import type { LayoutProps } from './layoutTypes'

export const CardLayoutView: React.FC<LayoutProps & { layout: CardLayout }> = ({ layout, ...props }) => {
  switch (layout) {
    case 'arch':
      return <ArchLayout {...props} />
    case 'editorial':
      return <EditorialLayout {...props} />
    case 'split':
      return <SplitLayout {...props} />
    case 'floating':
      return <FloatingLayout {...props} />
    case 'quote':
      return <QuoteLayout {...props} />
    case 'tile':
      return <TileLayout {...props} />
    case 'night':
      return <NightLayout {...props} />
    case 'botanical':
      return <BotanicalLayout {...props} />
    case 'glass':
      return <GlassLayout {...props} />
    case 'manuscript':
      return <ManuscriptLayout {...props} />
    case 'minimal':
      return <MinimalLayout {...props} />
    default:
      return <FrameLayout {...props} />
  }
}
