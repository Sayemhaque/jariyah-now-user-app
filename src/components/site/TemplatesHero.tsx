import { BookOpen, Film, LayoutGrid, Sparkles } from 'lucide-react'
import { templatePresets } from '@/lib/templatePresets'
import { StatChip } from './StatChip'

const highlights = [
  { icon: Sparkles, label: `${templatePresets.length}টি টেমপ্লেট` },
  { icon: BookOpen, label: 'কুরআন · দোয়া · আল্লাহর নাম · হাদিস' },
  { icon: Film, label: 'রিলস · শর্টস · টিকটকের জন্য তৈরি' },
]

export function TemplatesHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div className="qv-ambient" aria-hidden />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-12">
        <div className="max-w-3xl">
          <div className="qv-pill-premium mb-5">
            <LayoutGrid className="h-3.5 w-3.5" />
            এক চাপেই শুরু করুন
          </div>
          <h1 className="qv-hero-title font-display mb-4">
            <span className="qv-gradient-text">টেমপ্লেট</span> দিয়ে শুরু করুন
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            কুরআনের আয়াত, জিকির, দোয়া ও আরও অনেক কিছুর আগে থেকে সাজানো ভিডিও। প্রতিটি টেমপ্লেটে আয়াত, কারী,
            ব্যাকগ্রাউন্ড ও ফন্ট বেছে রাখা আছে — তাই কয়েক মিনিটেই ভিডিও তৈরি করে শেয়ার করতে পারবেন।
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6">
            {highlights.map((item) => (
              <StatChip key={item.label} icon={item.icon} label={item.label} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
