import { BookOpen, BookOpenCheck, HandHeart, MessageSquareQuote, Sparkles } from 'lucide-react'
import { OptionButton } from '@/components/common/OptionButton'
import { useContent } from '@/lib/contentStore'
import { contentModeLabels } from '@/lib/collections'
import type { ContentMode } from '@/lib/collections/types'

const modeIcons = { quran: BookOpen, masnoon: BookOpenCheck, duas: HandHeart, hadith: MessageSquareQuote, azkar: Sparkles }
const modeHints: Record<ContentMode, string> = { quran: 'তিলাওয়াত সহ ভিডিও', masnoon: 'ছবি পোস্টার', duas: 'ছবি পোস্টার', hadith: 'ছবি পোস্টার', azkar: 'ছবি পোস্টার' }
const modeOptions = (Object.keys(contentModeLabels) as ContentMode[]).map((key) => ({ key, label: contentModeLabels[key], hint: modeHints[key], icon: modeIcons[key] }))

export function ContentModePicker() {
  const { mode, setMode } = useContent()
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {modeOptions.map(({ key, label, hint, icon: Icon }) => (
        <OptionButton key={key} selected={mode === key} onSelect={() => setMode(key)} glow className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-left">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10"><Icon className="h-5 w-5" /></span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-tight">{label}</span>
            <span className="block text-xs text-muted-foreground">{hint}</span>
          </span>
        </OptionButton>
      ))}
    </div>
  )
}
