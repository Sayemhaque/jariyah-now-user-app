'use client'

import { BookHeart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageSection } from '@/components/site/PageSection'
import { SectionHeader } from '@/components/site/SectionHeader'
import { useGalleryCards } from '@/hooks/useGalleryCards'
import { appFontVariables } from '@/lib/appFonts'
import { cardSizes, type CardFormat } from '@/lib/cards/types'
import type { TextLanguage, TextMode } from '@/lib/collections/types'
import { GalleryCard } from './GalleryCard'
import { PillTabs } from './PillTabs'

const modes: { key: TextMode; label: string }[] = [
  { key: 'hadith', label: 'Hadith' },
  { key: 'azkar', label: 'Azkar' },
]
const languages: { key: TextLanguage; label: string }[] = [
  { key: 'english', label: 'English' },
  { key: 'bangla', label: 'বাংলা' },
]
const formats = (Object.keys(cardSizes) as CardFormat[]).map((key) => ({ key, label: cardSizes[key].label }))

export function HadithGallery() {
  const gallery = useGalleryCards()
  return (
    <PageSection id="hadith" className="border-y border-border/80 bg-card/60 py-16 sm:py-24">
      <SectionHeader
        centered
        className="mb-8"
        pillIcon={BookHeart}
        pillLabel="Free to share"
        title="Hadith & Azkar for your page"
        subtitle="Beautiful, ready-made posts. Pick one, download it and share it anywhere — every share can be sadaqah jariyah."
      />
      <div className="mb-8 space-y-3">
        <PillTabs options={modes} active={gallery.mode} onChange={gallery.setMode} />
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          <PillTabs options={languages} active={gallery.language} onChange={gallery.setLanguage} />
          <PillTabs options={formats} active={gallery.format} onChange={gallery.setFormat} />
        </div>
      </div>
      <div className={`grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 ${appFontVariables}`}>
        {gallery.items.map((item) => (
          <GalleryCard key={item.id} card={item.card} fileName={item.fileName} />
        ))}
      </div>
      {gallery.hasMore && (
        <div className="mt-8 text-center">
          <Button variant="secondary" onClick={gallery.showMore} className="font-semibold">Show all</Button>
        </div>
      )}
    </PageSection>
  )
}
