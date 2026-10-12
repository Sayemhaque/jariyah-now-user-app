import { BookOpen, Film, LayoutGrid, Sparkles } from 'lucide-react'
import { templatePresets } from '@/lib/templatePresets'
import { StatChip } from './StatChip'

const highlights = [
  { icon: Sparkles, label: `${templatePresets.length} templates` },
  { icon: BookOpen, label: 'Quran · Dua · Names · Hadith' },
  { icon: Film, label: 'Ready for Reels · Shorts · TikTok' },
]

export function TemplatesHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div className="qv-ambient" aria-hidden />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-12">
        <div className="max-w-3xl">
          <div className="qv-pill-premium mb-5">
            <LayoutGrid className="h-3.5 w-3.5" />
            One-click starting points
          </div>
          <h1 className="qv-hero-title font-display mb-4">
            Start from a <span className="qv-gradient-text">template</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Pre-configured reels for Quran verses, dhikr, duas, and more. Each template picks a verse, a reciter, a
            background, and a font — so you can publish in minutes, not hours.
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
