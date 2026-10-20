'use client'

import { useState } from 'react'
import { Clapperboard, Loader2 } from 'lucide-react'
import { PageSection } from '@/components/site/PageSection'
import { SectionHeader } from '@/components/site/SectionHeader'
import { useTemplateVideos } from '@/hooks/useTemplateVideos'
import { useVideoDownload } from '@/hooks/useVideoDownload'
import { templateFileName } from '@/lib/templates/videoTemplates'
import type { PresetMode } from '@/lib/collections/types'
import { PillTabs } from './PillTabs'
import { ReadyVideoCard } from './ReadyVideoCard'

const tabs: { key: PresetMode; label: string }[] = [
  { key: 'duas', label: 'Quranic Duas' },
  { key: 'masnoon', label: 'Masnoon Surahs' },
]

export function ReadyVideos() {
  const [kind, setKind] = useState<PresetMode>('duas')
  const { data = [], isLoading } = useTemplateVideos()
  const { download, downloadingKey } = useVideoDownload()
  const videos = data.filter((v) => v.kind === kind)

  return (
    <PageSection id="ready-videos" className="py-12 sm:py-16">
      <SectionHeader
        centered
        className="mb-8"
        pillIcon={Clapperboard}
        pillLabel="Ready to post"
        title="Ready-made videos"
        subtitle="Recited Quranic duas and masnoon surahs with translation. Download and post straight to Facebook, YouTube, Instagram or TikTok."
      />
      <PillTabs options={tabs} active={kind} onChange={setKind} className="mb-8" />
      {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />}
      {!isLoading && videos.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">These videos are being prepared. Check back soon, in sha Allah.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {videos.map((video) => (
          <ReadyVideoCard
            key={video.key}
            video={video}
            downloading={downloadingKey === video.key}
            onDownload={() => download(video.key, video.previewUrl, video.downloadUrl, templateFileName(video.key))}
          />
        ))}
      </div>
    </PageSection>
  )
}
