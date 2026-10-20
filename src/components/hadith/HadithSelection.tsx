import { Ruler } from 'lucide-react'
import { SwitchField } from '@/components/customize/SwitchField'
import { LanguageToggle } from '@/components/content/LanguageToggle'
import { useContent } from '@/lib/contentStore'
import { useHadithSection } from '@/hooks/useHadithSection'
import { shareableHadiths } from '@/lib/hadith/hadithPicks'
import { HadithBookPicker } from './HadithBookPicker'
import { HadithPicker } from './HadithPicker'

export function HadithSelection() {
  const content = useContent()
  const query = useHadithSection(content.hadithBook, content.hadithSection, content.language)
  const hadiths = shareableHadiths(query.data ?? [], content.shortHadithOnly)
  return (
    <div className="space-y-3">
      <HadithBookPicker book={content.hadithBook} section={content.hadithSection} onBook={content.setHadithBook} onSection={content.setHadithSection} />
      <LanguageToggle />
      <SwitchField label="শুধু ছোট হাদিস" icon={Ruler} checked={content.shortHadithOnly} onChange={content.setShortHadithOnly} />
      <HadithPicker hadiths={hadiths} value={content.hadithNumber} onChange={content.setHadithNumber} isLoading={query.isLoading} failed={query.isError} />
      <p className="text-[11px] leading-snug text-muted-foreground">হাদিসগুলো উন্মুক্ত হাদিস API (fawazahmed0/hadith-api) থেকে নেওয়া। শুধু সহীহ ও হাসান হাদিস দেখানো হয়, আর প্রতিটি হাদিস একটি পোস্টারেই পুরোটা আঁটে — যেগুলো এক পোস্টারে আঁটে না সেগুলো বাদ রাখা হয়।</p>
    </div>
  )
}
