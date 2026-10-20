import { BookOpen, BookOpenCheck, HandHeart, MessageSquareQuote, Sparkles } from 'lucide-react'
import { OptionButton } from '@/components/common/OptionButton'
import { useContent } from '@/lib/contentStore'
import { contentModeLabels } from '@/lib/collections'
import type { ContentMode } from '@/lib/collections/types'

const modeIcons = { quran: BookOpen, masnoon: BookOpenCheck, duas: HandHeart, hadith: MessageSquareQuote, azkar: Sparkles }
const modeOptions = (Object.keys(contentModeLabels) as ContentMode[]).map((key) => ({ key, label: contentModeLabels[key], icon: modeIcons[key] }))

export function ContentModePicker() {
  const { mode, setMode } = useContent()
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {modeOptions.map(({ key, label, icon: Icon }) => (
        <OptionButton key={key} selected={mode === key} onSelect={() => setMode(key)} glow className="flex flex-col items-center gap-1 rounded-xl px-1 py-2">
          <Icon className="h-4 w-4" />
          <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
        </OptionButton>
      ))}
    </div>
  )
}
