import { Languages } from 'lucide-react'
import { OptionButton } from '@/components/common/OptionButton'
import { FieldLabel } from '@/components/selection/FieldLabel'
import { useContent } from '@/lib/contentStore'
import type { TextLanguage } from '@/lib/collections/types'

const languages: { key: TextLanguage; label: string }[] = [
  { key: 'english', label: 'English' },
  { key: 'bangla', label: 'বাংলা' },
]

export function LanguageToggle() {
  const { language, setLanguage } = useContent()
  return (
    <div className="space-y-1.5">
      <FieldLabel icon={Languages}>Translation</FieldLabel>
      <div className="grid grid-cols-2 gap-2">
        {languages.map(({ key, label }) => (
          <OptionButton key={key} selected={language === key} onSelect={() => setLanguage(key)} className="rounded-lg py-2 text-sm font-medium">
            {label}
          </OptionButton>
        ))}
      </div>
    </div>
  )
}
