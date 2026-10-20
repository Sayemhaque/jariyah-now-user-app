import type { useAyatLoader } from '@/hooks/useAyatLoader'
import { CustomizationPanel } from '@/components/CustomizationPanel'
import { CardDesignPanel } from '@/components/cards/CardDesignPanel'
import { ContentModePicker } from '@/components/content/ContentModePicker'
import { ImageSelection } from '@/components/content/ImageSelection'
import { QuranSelection } from '@/components/content/QuranSelection'
import { useContent } from '@/lib/contentStore'
import { AppCredits } from './AppCredits'
import { StepPanel } from './StepPanel'

const selectionHints = {
  quran: 'সূরা, আয়াত ও কারী বেছে নিয়ে “আয়াত লোড করুন” চাপুন।',
  masnoon: 'একটি সূরা বেছে নিন — পোস্টার সঙ্গে সঙ্গে তৈরি হবে।',
  duas: 'একটি দোয়া বেছে নিন — পোস্টার সঙ্গে সঙ্গে তৈরি হবে।',
  hadith: 'গ্রন্থ, অধ্যায় ও হাদিস বেছে নিন।',
  azkar: 'একটি জিকির ও ভাষা বেছে নিন।',
}

export function SettingsPanel({ loader }: { loader: ReturnType<typeof useAyatLoader> }) {
  const { mode } = useContent()
  const video = mode === 'quran'
  return (
    <div className="space-y-3">
      <StepPanel step={1} title="কী বানাতে চান?" hint="নিচের যেকোনো একটিতে চাপুন।" className="space-y-3">
        <ContentModePicker />
      </StepPanel>
      <StepPanel step={2} title="বেছে নিন" hint={selectionHints[mode]} className="space-y-3">
        {video ? <QuranSelection loader={loader} /> : <ImageSelection mode={mode} />}
      </StepPanel>
      <StepPanel step={3} title={video ? 'ভিডিও সাজান' : 'ডিজাইন বেছে নিন'} hint={video ? 'ব্যাকগ্রাউন্ড, রং ও লেখা নিজের মতো করুন।' : 'সাইজ, লেআউট ও রং বেছে নিন। তারপর ডাউনলোড করুন।'} className="space-y-2.5">
        {video ? <CustomizationPanel /> : <CardDesignPanel />}
      </StepPanel>
      <AppCredits />
    </div>
  )
}
