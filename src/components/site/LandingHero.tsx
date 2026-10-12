import Link from 'next/link'
import { ArrowRight, Check, Film, Play } from 'lucide-react'
import { heroHighlights } from '@/lib/content/site'
import { BrandLogo } from './BrandLogo'
import { StatChip } from './StatChip'

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="qv-ambient" aria-hidden />
      <div className="qv-grid-bg absolute inset-0 pointer-events-none opacity-80" aria-hidden />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-24">
        <div className="max-w-3xl">
          <div className="qv-pill-premium mb-6">
            <BrandLogo size={14} alt="" className="h-3.5 w-3.5 rounded-sm ring-1 ring-primary/20" />
            Free — No account required
          </div>
          <p className="qv-tagline mb-4">
            <span className="qv-divider-accent inline-block w-6 h-[2px] rounded-full" aria-hidden />
            Share once, earn forever.
          </p>
          <h1 className="qv-hero-title font-display mb-6">
            Turn Quran verses into
            <br />
            <span className="qv-gradient-text">shareable reels</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-9 max-w-2xl">
            Every reel you publish is Sadaqah Jariyah — ongoing charity that keeps earning reward long after
            you hit share. Pick a Surah, choose a reciter, customize the look, and export a perfectly synced
            video with Arabic text and translation. Built for Instagram Reels, TikTok, and YouTube Shorts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/app"
              className="qv-btn-primary inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-base font-semibold"
            >
              <Film className="h-5 w-5" />
              Create your reel
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="qv-btn-secondary inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-base font-semibold"
            >
              <Play className="h-4 w-4 text-primary" />
              See how it works
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-10">
            {heroHighlights.map((label) => (
              <StatChip key={label} icon={Check} label={label} className="backdrop-blur-sm" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
