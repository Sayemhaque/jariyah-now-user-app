import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Sparkles,
  Play,
  Film,
  Mic2,
  BookOpen,
  Palette,
  Download,
  ArrowRight,
  Check,
  Heart,
  Globe,
  Languages,
} from 'lucide-react'

const siteUrl = 'https://jariyahnow.com'
const ogImage = `${siteUrl}/og-image.png`

export const metadata: Metadata = {
  title: 'Jariyah Now — Turn Quran Verses Into Shareable Reels',
  description:
    'Create Quran verse reels in seconds — pick a Surah, choose your ayat, add recitation audio and translation, then share on Instagram, TikTok & YouTube.',
  alternates: { canonical: siteUrl },
  openGraph: {
    title: 'Jariyah Now — Share once, earn forever.',
    description:
      'Turn Quran verses into beautiful shareable reels with recitation, translation, and your own style.',
    url: siteUrl,
    siteName: 'Jariyah Now',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Jariyah Now' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jariyah Now — Share once, earn forever.',
    description:
      'Turn Quran verses into beautiful shareable reels with recitation, translation, and your own style.',
    images: [ogImage],
  },
}

const LEGAL_DISCLAIMER =
  'Jariyah Now is an independent tool and is not affiliated with or endorsed by any Quran recitation rights holder, translation publisher, or religious authority. Translations and audio recitations used in this app are credited to their respective sources. Users are responsible for the content they create and share using this platform.'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-30 qv-frosted border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Jariyah Now logo"
              className="h-10 w-10 rounded-xl object-contain"
            />
            <span className="text-lg font-bold tracking-tight">Jariyah Now</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              About
            </Link>
            <Link
              href="/terms"
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              Privacy
            </Link>
            <Link
              href="/app"
              className="qv-btn-primary inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold"
            >
              Open App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
              <img src="/logo.png" alt="" className="h-3.5 w-3.5 rounded-sm" />
              Free • No account required
            </div>

            {/* Tagline */}
            <p className="text-base sm:text-lg font-semibold text-primary mb-3 tracking-wide">
              Share once, earn forever.
            </p>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Turn Quran verses into
              <br />
              <span className="text-primary">shareable reels</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              Every reel you publish is Sadaqah Jariyah — ongoing charity that
              keeps earning reward long after you hit share. Pick a Surah,
              choose a reciter, customize the look, and export a perfectly
              synced video with word-by-word highlighting and translation.
              Built for Instagram Reels, TikTok, and YouTube Shorts.
            </p>

            {/* CTAs */}
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
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-base font-semibold border border-border bg-card hover:bg-muted transition"
              >
                <Play className="h-4 w-4" />
                See how it works
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                114 Surahs
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                5 reciters
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Word-by-word highlight
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                6 translations
              </div>
            </div>
          </div>
        </div>

        {/* Decorative gradient blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* ─── App Showcase ─── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Everything runs in your browser
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No software to install. Preview, edit, and export — all without
              leaving the page.
            </p>
          </div>

          {/* Desktop + Mobile side by side */}
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            {/* Desktop screenshot in a browser frame */}
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 h-10 border-b border-border bg-muted/50">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive/40" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/40" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/40" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-3 py-1 rounded-md bg-card border border-border text-[10px] text-muted-foreground font-mono">
                      jariyahnow.com/app
                    </div>
                  </div>
                </div>
                {/* Screenshot */}
                <img
                  src="/landing/app-desktop.png"
                  alt="Jariyah Now app — desktop view"
                  className="w-full h-auto block"
                />
              </div>
            </div>

            {/* Mobile screenshot in a phone frame */}
            <div className="hidden lg:block w-[200px] shrink-0">
              <div className="rounded-[2rem] border-[6px] border-foreground/80 bg-foreground/80 p-1 shadow-2xl">
                <div className="rounded-[1.5rem] overflow-hidden bg-background">
                  <img
                    src="/landing/app-mobile.png"
                    alt="Jariyah Now app — mobile view"
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Your reel in 4 steps
            </h2>
            <p className="text-muted-foreground">
              Simple, fast, and completely free
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                step: '1',
                title: 'Pick a Surah',
                desc: 'Choose from all 114 Surahs and set your ayat range (up to 10 ayats).',
              },
              {
                icon: Mic2,
                step: '2',
                title: 'Choose a reciter',
                desc: 'Alafasy, Abdul Basit, Minshawi, Husary, or Sudais — pick your favorite voice.',
              },
              {
                icon: Palette,
                step: '3',
                title: 'Customize the look',
                desc: 'Background, fonts, colors, overlays — tweak everything with a live preview.',
              },
              {
                icon: Download,
                step: '4',
                title: 'Export & share',
                desc: 'Download in one click — ready for Reels, Shorts, or YouTube.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="qv-card rounded-2xl p-6 relative"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-bold text-primary/30">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Why creators choose Jariyah Now
            </h2>
            <p className="text-muted-foreground">
              Built for impact, designed for sharing
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'Word-by-word highlighting',
                desc: 'Each word lights up in sync with the recitation, so viewers can follow along effortlessly.',
              },
              {
                icon: Mic2,
                title: '5 world-class reciters',
                desc: 'From Mishary Alafasy to Abdul Basit — every iconic voice in one place, streamed from the Quran CDN.',
              },
              {
                icon: Languages,
                title: '6 translations',
                desc: 'Bengali & English editions including Pickthall (public domain), Saheeh International, Clear Quran, and more.',
              },
              {
                icon: Palette,
                title: 'Full customization',
                desc: '7 background presets, custom uploads, 6 overlay styles, font controls, colors — make every reel your own.',
              },
              {
                icon: Film,
                title: 'Reels & Shorts ready',
                desc: 'Export portrait or landscape, 720p or 1080p — perfectly sized for every platform.',
              },
              {
                icon: Globe,
                title: 'Runs in your browser',
                desc: 'No software to install, no uploads, fully private — your video renders right on your device.',
              },
            ].map((f, i) => (
              <div key={i} className="qv-card rounded-2xl p-6">
                <div className="grid place-items-center h-11 w-11 rounded-xl bg-primary/10 text-primary mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Sadaqah Jariyah band ─── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-primary/5 border-y border-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="grid place-items-center h-14 w-14 rounded-2xl bg-primary/15 text-primary mx-auto mb-6">
            <Heart className="h-7 w-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Why we’re called Jariyah Now
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Sadaqah Jariyah</strong> is the
            ongoing charity that keeps rewarding you — long after the original
            act. When someone benefits from a Quran reel you shared, you earn
            reward for every view, every heart, every share.{' '}
            <span className="text-primary font-semibold">
              Share once, earn forever.
            </span>{' '}
            That’s the mission behind Jariyah Now: make it effortless to turn
            the words of Allah into beautiful, shareable content that keeps
            giving.
          </p>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="qv-card rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
            {/* Decorative bg */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10" />

            <img
              src="/logo.png"
              alt="Jariyah Now logo"
              className="h-14 w-14 rounded-2xl object-contain mx-auto mb-6"
            />

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start creating now
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              No sign-up, completely free. Your first Quran reel is seconds
              away — and every share is Sadaqah Jariyah.
            </p>

            <Link
              href="/app"
              className="qv-btn-primary inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl text-lg font-semibold"
            >
              <Film className="h-6 w-6" />
              Open the builder
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Jariyah Now logo"
                className="h-9 w-9 rounded-xl object-contain"
              />
              <div>
                <div className="font-bold text-sm">Jariyah Now</div>
                <div className="text-xs text-muted-foreground">
                  Share once, earn forever.
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-5 text-sm">
              <Link
                href="/app"
                className="text-muted-foreground hover:text-foreground transition font-medium"
              >
                App
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition font-medium"
              >
                About
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition font-medium"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition font-medium"
              >
                Privacy
              </Link>
            </nav>
          </div>

          {/* Legal disclaimer */}
          <p className="mt-8 text-xs text-muted-foreground leading-relaxed text-center max-w-4xl mx-auto">
            {LEGAL_DISCLAIMER}
          </p>

          <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground text-center leading-relaxed">
            Quran text:{' '}
            <a
              href="https://alquran.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              alquran.cloud
            </a>
            {' • '}
            <a
              href="https://quran.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              quran.com
            </a>
            {' • '}Audio:{' '}
            <a
              href="https://verses.quran.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              verses.quran.com
            </a>
            <br />
            © {new Date().getFullYear()} Jariyah Now — All rights reserved
          </div>
        </div>
      </footer>
    </div>
  )
}
