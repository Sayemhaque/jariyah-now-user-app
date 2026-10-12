import Link from 'next/link'
import { ArrowRight, Film } from 'lucide-react'
import { BrandLogo } from './BrandLogo'

export function CtaSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="qv-gradient-rim rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[320px] bg-primary/8 rounded-full blur-3xl pointer-events-none" aria-hidden />
          <div className="absolute -bottom-16 -right-10 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" aria-hidden />
          <BrandLogo size={56} className="h-14 w-14 rounded-2xl mx-auto mb-6 qv-logo-glow relative" />
          <h2 className="relative text-3xl sm:text-4xl font-bold mb-4 tracking-tight font-display">Start creating now</h2>
          <p className="relative text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            No sign-up, completely free. Your first Quran reel is seconds away — and every share is Sadaqah Jariyah.
          </p>
          <Link
            href="/app"
            className="qv-btn-primary relative inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl text-lg font-semibold"
          >
            <Film className="h-6 w-6" />
            Open the builder
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
