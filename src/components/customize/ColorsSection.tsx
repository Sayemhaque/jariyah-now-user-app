import { Palette } from 'lucide-react'
import { useSettings } from '@/lib/store'
import { defaultScene } from '@/lib/backgroundPresets'
import type { VideoSettings } from '@/lib/types'
import { ColorField } from './ColorField'
import { SectionTitle } from './SectionTitle'
import { SwitchField } from './SwitchField'

type ColorKey = 'fontColor' | 'highlightColor' | 'translationColor'

const colorFields: { key: ColorKey; label: string }[] = [
  { key: 'fontColor', label: 'আরবি লেখা' },
  { key: 'highlightColor', label: 'হাইলাইট' },
  { key: 'translationColor', label: 'অনুবাদ' },
]

export function ColorsSection() {
  const { settings, updateSettings } = useSettings()
  const auto = settings.autoColors !== false
  const setManual = (key: ColorKey, value: string) => updateSettings({ [key]: value, autoColors: false } as Partial<VideoSettings>)

  return (
    <>
      <SectionTitle>রং</SectionTitle>
      <div className="space-y-2.5">
        <SwitchField icon={Palette} label="ব্যাকগ্রাউন্ড মিলিয়ে রং" checked={auto} onChange={(autoColors) => updateSettings({ autoColors })} />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {auto
            ? 'লেখা ও হাইলাইটের রং ব্যাকগ্রাউন্ড দেখে নিজে থেকেই বসে যায়। নিজে রং দিতে চাইলে নিচ থেকে বেছে নিন।'
            : 'এখন আপনার বেছে নেওয়া রং চলছে। আবার ব্যাকগ্রাউন্ড মিলিয়ে রং পেতে সুইচটি চালু করুন।'}
        </p>
        {colorFields.map((field) => (
          <ColorField
            key={field.key}
            label={field.label}
            value={settings[field.key] ?? defaultScene.palette.translation}
            onChange={(value) => setManual(field.key, value)}
          />
        ))}
      </div>
    </>
  )
}
