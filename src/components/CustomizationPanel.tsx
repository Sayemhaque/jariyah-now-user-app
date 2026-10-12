'use client'

import { BackgroundSection } from './customize/BackgroundSection'
import { CaptionsSection } from './customize/CaptionsSection'
import { LayoutSection } from './customize/LayoutSection'
import { OverlaySection } from './customize/OverlaySection'
import { TypographySection } from './customize/TypographySection'

export function CustomizationPanel() {
  return (
    <div className="space-y-1">
      <LayoutSection />
      <BackgroundSection />
      <OverlaySection />
      <TypographySection />
      <CaptionsSection />
    </div>
  )
}
