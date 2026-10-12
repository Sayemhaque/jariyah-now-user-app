'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useAyatLoader } from '@/hooks/useAyatLoader'
import { useSettingsDrawer } from '@/hooks/useSettingsDrawer'
import { VideoPreview } from '@/components/VideoPreview'
import { AppHeader } from '@/components/builder/AppHeader'
import { SettingsDrawer } from '@/components/builder/SettingsDrawer'
import { SettingsPanel } from '@/components/builder/SettingsPanel'

const ExportModal = dynamic(() => import('@/components/ExportModal').then((m) => m.ExportModal), {
  ssr: false,
  loading: () => null,
})

export default function Home() {
  const loader = useAyatLoader()
  const [exportOpen, setExportOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useSettingsDrawer()
  const settings = <SettingsPanel loader={loader} />

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <AppHeader canExport={loader.canExport} onExport={() => setExportOpen(true)} />
      <main className="flex flex-1 min-h-0 overflow-hidden lg:grid lg:grid-cols-[3fr_2fr]">
        <section className="relative qv-preview-stage-premium flex flex-col min-h-0 overflow-hidden flex-1">
          <VideoPreview onSettingsClick={() => setDrawerOpen(true)} />
        </section>
        <aside className="hidden lg:block border-t lg:border-t-0 lg:border-l border-border/80 bg-card/90 backdrop-blur-sm min-h-0 overflow-y-auto scrollbar-thin p-3 sm:p-4">
          {settings}
        </aside>
      </main>
      <SettingsDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        {settings}
      </SettingsDrawer>
      <ExportModal open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
