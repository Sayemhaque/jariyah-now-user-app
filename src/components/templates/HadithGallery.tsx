'use client'

import { BookHeart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageSection } from '@/components/site/PageSection'
import { SectionHeader } from '@/components/site/SectionHeader'
import { HadithBookPicker } from '@/components/hadith/HadithBookPicker'
import { useGalleryCards, type GalleryMode } from '@/hooks/useGalleryCards'
import { appFontVariables } from '@/lib/appFonts'
import { cardSizes, type CardFormat } from '@/lib/cards/types'
import type { TextLanguage } from '@/lib/collections/types'
import { GalleryCard } from './GalleryCard'
import { GalleryStatus } from './GalleryStatus'
import { PillTabs } from './PillTabs'

const modes: { key: GalleryMode; label: string }[] = [
  { key: 'hadith', label: 'হাদিস' },
  { key: 'azkar', label: 'জিকির' },
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
        pillLabel="ফ্রি শেয়ার করুন"
        title="আপনার পেজের জন্য হাদিস ও জিকির"
        subtitle="বুখারি, মুসলিম ও সুনান গ্রন্থ থেকে হাজারো সহিহ হাদিস, আর প্রতিদিনের জিকির — সুন্দর ছবির পোস্ট হিসেবে। একটি বেছে নিন, ডাউনলোড করুন, তারপর যেখানে খুশি শেয়ার করুন।"
      />
      <div className="mb-8 space-y-3">
        <PillTabs options={modes} active={gallery.mode} onChange={gallery.setMode} />
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          <PillTabs options={languages} active={gallery.language} onChange={gallery.setLanguage} />
          <PillTabs options={formats} active={gallery.format} onChange={gallery.setFormat} />
        </div>
        {gallery.mode === 'hadith' && (
          <div className="mx-auto max-w-xl">
            <HadithBookPicker book={gallery.selection.book} section={gallery.selection.section} onBook={gallery.setBook} onSection={gallery.setSection} />
          </div>
        )}
      </div>
      <GalleryStatus isLoading={gallery.isLoading} failed={gallery.failed} empty={!gallery.isLoading && !gallery.failed && gallery.total === 0} />
      <div className={`grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 ${appFontVariables}`}>
        {gallery.items.map((item) => (
          <GalleryCard key={item.id} card={item.card} fileName={item.fileName} />
        ))}
      </div>
      {gallery.hasMore && (
        <div className="mt-8 text-center">
          <Button variant="secondary" onClick={gallery.showMore} className="font-semibold">আরও দেখুন (আরও {gallery.total - gallery.items.length}টি বাকি)</Button>
        </div>
      )}
    </PageSection>
  )
}
