import Link from 'next/link'
import { ArrowRight, Check, Film, Play } from 'lucide-react'
import { LazyHeroScene } from '@/components/three/lazyScenes'
import { heroHighlights } from '@/lib/content/site'
import { BrandLogo } from './BrandLogo'
import { StatChip } from './StatChip'

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="qv-ambient" aria-hidden />
      <div className="qv-grid-bg absolute inset-0 pointer-events-none opacity-80" aria-hidden />
      <div className="pointer-events-none absolute -right-24 -top-10 h-[420px] w-[420px] opacity-35 sm:opacity-50 lg:right-[-4%] lg:top-1/2 lg:h-[640px] lg:w-[52%] lg:-translate-y-1/2 lg:opacity-100" aria-hidden>
        <div className="absolute inset-[18%] rounded-full bg-primary/20 blur-3xl" />
        <LazyHeroScene className="qv-rise absolute inset-0" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-24">
        <div className="relative max-w-3xl lg:max-w-[56%]">
          <div className="qv-rise qv-pill-premium mb-6" style={{ animationDelay: '0ms' }}>
            <BrandLogo size={14} alt="" className="h-3.5 w-3.5 rounded-sm ring-1 ring-primary/20" />
            বিনামূল্যে — কোনো অ্যাকাউন্ট লাগবে না
          </div>
          <p className="qv-rise qv-tagline mb-4" style={{ animationDelay: '110ms' }}>
            <span className="qv-divider-accent inline-block w-6 h-[2px] rounded-full" aria-hidden />
            একবার শেয়ার, সওয়াব চিরকাল।
          </p>
          <h1 className="qv-rise qv-hero-title font-display mb-6" style={{ animationDelay: '220ms' }}>
            কুরআনের আয়াত দিয়ে বানান
            <br />
            <span className="qv-gradient-text">সুন্দর রিলস</span>
          </h1>
          <p className="qv-rise text-lg sm:text-xl text-muted-foreground leading-relaxed mb-9 max-w-2xl" style={{ animationDelay: '330ms' }}>
            আপনার শেয়ার করা প্রতিটি ভিডিও হতে পারে সদকায়ে জারিয়া — এমন দান, যার সওয়াব শেয়ারের পরেও চলতে
            থাকে। সূরা বেছে নিন, কারী বেছে নিন, ডিজাইন সাজিয়ে নিন। তারপর আরবি লেখা ও অনুবাদসহ ভিডিও ডাউনলোড
            করুন। ফেসবুক, ইনস্টাগ্রাম, টিকটক ও ইউটিউবের জন্য একদম তৈরি।
          </p>
          <div className="qv-rise flex flex-col sm:flex-row gap-3" style={{ animationDelay: '440ms' }}>
            <Link
              href="/app"
              className="qv-btn-primary inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-base font-semibold"
            >
              <Film className="h-5 w-5" />
              ভিডিও বানান
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="qv-btn-secondary inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-base font-semibold"
            >
              <Play className="h-4 w-4 text-primary" />
              কীভাবে কাজ করে দেখুন
            </a>
          </div>
          <div className="qv-rise flex flex-wrap items-center gap-2 sm:gap-3 mt-10" style={{ animationDelay: '550ms' }}>
            {heroHighlights.map((label) => (
              <StatChip key={label} icon={Check} label={label} className="backdrop-blur-sm" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
