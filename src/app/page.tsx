import type { Metadata } from 'next'
import Image from 'next/image'
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
  LayoutGrid,
} from 'lucide-react'
import { TEMPLATE_PRESETS, isQuranTemplate, isZikrTemplate } from '@/lib/templatePresets'

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
      <header className="sticky top-0 z-30 qv-frosted border-b border-border/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Jariyah Now logo"
              width={40}
              height={40}
              priority
              className="h-10 w-10 rounded-xl object-contain qv-logo-glow transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-lg font-bold tracking-tight">Jariyah Now</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/templates"
              className="hidden sm:inline-flex items-center h-9 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition"
            >
              Templates
            </Link>
            <Link
              href="/zikr"
              className="hidden sm:inline-flex items-center h-9 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition"
            >
              Zikr
            </Link>
            <Link
              href="/about"
              className="hidden sm:inline-flex items-center h-9 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition"
            >
              About
            </Link>
            <Link
              href="/terms"
              className="hidden md:inline-flex items-center h-9 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hidden md:inline-flex items-center h-9 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition"
            >
              Privacy
            </Link>
            <Link
              href="/app"
              className="qv-btn-primary inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold ml-1"
            >
              Open App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="qv-ambient" aria-hidden />
        <div className="qv-grid-bg absolute inset-0 pointer-events-none opacity-80" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-24">
          <div className="max-w-3xl">
            {/* Premium badge */}
            <div className="qv-pill-premium mb-6">
              <Image src="/logo.png" alt="" width={14} height={14} className="h-3.5 w-3.5 rounded-sm ring-1 ring-primary/20" />
              Free — No account required
            </div>

            {/* Tagline — gold accent */}
            <p className="qv-tagline mb-4">
              <span className="qv-divider-accent inline-block w-6 h-[2px] rounded-full" aria-hidden />
              Share once, earn forever.
            </p>

            {/* Headline — display font for premium feel */}
            <h1 className="qv-hero-title font-display mb-6">
              Turn Quran verses into
              <br />
              <span className="qv-gradient-text">shareable reels</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-9 max-w-2xl">
              Every reel you publish is Sadaqah Jariyah — ongoing charity that
              keeps earning reward long after you hit share. Pick a Surah,
              choose a reciter, customize the look, and export a perfectly
              synced video with Arabic text and translation.
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
                className="qv-btn-secondary inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-base font-semibold"
              >
                <Play className="h-4 w-4 text-primary" />
                See how it works
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-10">
              {['114 Surahs', '13 reciters', 'Video backgrounds', '12 translations'].map((label) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-card/80 border border-border/80 text-sm text-muted-foreground shadow-sm backdrop-blur-sm"
                >
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── App Showcase ─── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="qv-pill mb-4 mx-auto w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              Live in the browser
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
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
              <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] blur-2xl opacity-60 -z-10" aria-hidden />
              <div className="rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden ring-1 ring-primary/5">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 h-11 border-b border-border bg-gradient-to-b from-muted/80 to-muted/40">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive/40" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/40" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/40" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-3.5 py-1 rounded-full bg-card border border-border text-[10px] text-muted-foreground font-mono shadow-sm">
                      jariyahnow.com/app
                    </div>
                  </div>
                </div>
                {/* Screenshot */}
                <Image
                  src="/landing/app-desktop.png"
                  alt="Jariyah Now app — desktop view"
                  width={1440}
                  height={900}
                  sizes="(max-width: 1024px) 100vw, 960px"
                  className="w-full h-auto block"
                />
              </div>
            </div>

            {/* Mobile screenshot in a phone frame */}
            <div className="hidden lg:block w-[200px] shrink-0 qv-phone-float">
              <div className="relative">
                <div className="absolute -inset-6 bg-primary/20 rounded-full blur-2xl qv-phone-glow -z-10" aria-hidden />
                <div className="rounded-[2rem] border-[6px] border-foreground/85 bg-foreground/85 p-1 shadow-2xl">
                  <div className="rounded-[1.5rem] overflow-hidden bg-background">
                    <Image
                      src="/landing/app-mobile.png"
                      alt="Jariyah Now app — mobile view"
                      width={390}
                      height={844}
                      sizes="200px"
                      className="w-full h-auto block"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-card/70 border-y border-border/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="qv-section-header mb-14">
            <div className="qv-pill-premium">
              <Sparkles className="h-3.5 w-3.5" />
              Four simple steps
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
              Your reel in 4 steps
            </h2>
            <p className="text-muted-foreground">
              Simple, fast, and completely free
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
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
                desc: 'Alafasy, Sudais, Abdul Basit, Muaiqly, Ghamdi and more — 13 iconic voices to pick from.',
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
                className="qv-card-premium rounded-2xl p-6 relative qv-hover-lift qv-scroll-fade"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="qv-icon-chip h-11 w-11">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-bold qv-gradient-text">
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
          <div className="qv-section-header mb-14">
            <div className="qv-pill-premium">
              <Sparkles className="h-3.5 w-3.5" />
              Why creators choose us
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
              Built for impact, designed for sharing
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: Sparkles,
                title: 'Beautiful Arabic typography',
                desc: 'Premium Arabic fonts with smooth RTL rendering, perfectly centered for reels and shorts.',
              },
              {
                icon: Mic2,
                title: '13 world-class reciters',
                desc: 'From Mishary Alafasy to Abdul Basit — every iconic voice in one place, streamed from everyayah.com.',
              },
              {
                icon: Languages,
                title: '12 translations',
                desc: 'Bengali, English, Urdu, Turkish, Indonesian, French, German, Spanish, Malay, and Bosnian — via UmmahAPI.',
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
              <div
                key={i}
                className="qv-card-premium rounded-2xl p-6 qv-hover-lift qv-scroll-fade"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="qv-icon-chip h-11 w-11 mb-4">
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

      {/* ─── Start from a template ─── */}
      <TemplatesShowcaseSection />

      {/* ─── Sadaqah Jariyah band ─── */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 overflow-hidden border-y border-primary/10">
        <div className="absolute inset-0 bg-primary/5" aria-hidden />
        <div className="absolute inset-0 qv-grid-bg opacity-60" aria-hidden />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="qv-icon-chip h-14 w-14 mx-auto mb-6">
            <Heart className="h-7 w-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight font-display">
            Why we're called Jariyah Now
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Sadaqah Jariyah</strong> is the
            ongoing charity that keeps rewarding you — long after the original
            act. When someone benefits from a Quran reel you shared, you earn
            reward for every view, every heart, every share.{' '}
            <span className="qv-gradient-text font-semibold">
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
          <div className="qv-gradient-rim rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
            {/* Decorative bg */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[320px] bg-primary/8 rounded-full blur-3xl pointer-events-none" aria-hidden />
            <div className="absolute -bottom-16 -right-10 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" aria-hidden />

            <Image
              src="/logo.png"
              alt="Jariyah Now logo"
              width={56}
              height={56}
              className="h-14 w-14 rounded-2xl object-contain mx-auto mb-6 qv-logo-glow relative"
            />

            <h2 className="relative text-3xl sm:text-4xl font-bold mb-4 tracking-tight font-display">
              Start creating now
            </h2>
            <p className="relative text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              No sign-up, completely free. Your first Quran reel is seconds
              away — and every share is Sadaqah Jariyah.
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

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/80 bg-card/80 backdrop-blur-sm mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Jariyah Now logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-contain qv-logo-glow"
              />
              <div>
                <div className="font-bold text-sm">Jariyah Now</div>
                <div className="text-xs text-muted-foreground">
                  Share once, earn forever.
                </div>
              </div>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-sm">
              {[
                { href: '/app', label: 'App' },
                { href: '/templates', label: 'Templates' },
                { href: '/zikr', label: 'Zikr' },
                { href: '/about', label: 'About' },
                { href: '/terms', label: 'Terms' },
                { href: '/privacy', label: 'Privacy' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground hover:bg-primary/5 transition font-medium h-9 px-3 rounded-lg inline-flex items-center"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal disclaimer */}
          <p className="mt-8 text-xs text-muted-foreground leading-relaxed text-center max-w-4xl mx-auto">
            {LEGAL_DISCLAIMER}
          </p>

          <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground text-center leading-relaxed">
            Quran text:{' '}
            <a
              href="https://ummahapi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ummahapi.com
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
              href="https://everyayah.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              everyayah.com
            </a>
            <br />
            © {new Date().getFullYear()} Jariyah Now — All rights reserved
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Templates showcase section (6 featured templates) ──────────────────────
// Rendered inline on the landing page so visitors see the templates offering
// without having to navigate. Clicking a card navigates to the templates page
// (we don't auto-apply from the landing page — let the user browse first).

function TemplatesShowcaseSection() {
  // Pick 6 featured templates — a mix of Quran + Zikr + Dua.
  const featured = [
    'ayat-al-kursi',
    'al-fatihah',
    'subhanallah-33',
    'ar-rahman',
    'dua-morning',
    'astaghfirullah-100',
  ]
    .map((id) => TEMPLATE_PRESETS.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))

  // Fallback — if any of the featured IDs don't match, just take the first 6.
  const templates = featured.length >= 6 ? featured : TEMPLATE_PRESETS.slice(0, 6)

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-card border-y border-border">
      <div className="max-w-6xl mx-auto">
        <div className="qv-section-header mb-12">
          <div className="qv-pill-premium">
            <LayoutGrid className="h-3.5 w-3.5" />
            One-click starting points
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            Start from a template
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pre-configured reels for Quran verses, zikr, duas, and more. Each
            template auto-loads the surah, reciter, font, and colors — so you
            can publish in minutes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {templates.map((t) => {
            // Build the target URL based on the template type. We don't
            // auto-apply templates from the landing page (the store would
            // need to be hydrated first); we just deep-link to /templates
            // so the user can browse + click apply there.
            const targetUrl =
              isZikrTemplate(t)
                ? `/zikr?zikr=${t.config.zikrId}&count=${t.config.count}${t.config.pacing ? `&pacing=${t.config.pacing}` : ''}`
                : isQuranTemplate(t)
                ? `/app`
                : '/templates'
            return (
              <Link
                key={t.id}
                href={targetUrl}
                className="group qv-card qv-gradient-border rounded-2xl p-0 overflow-hidden qv-hover-lift flex flex-col"
              >
                {/* Gradient header */}
                <div
                  className={`relative h-28 bg-gradient-to-br ${t.gradient} flex items-center justify-center overflow-hidden`}
                >
                  <span
                    className="text-5xl filter drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                    aria-hidden
                  >
                    {t.icon}
                  </span>
                  <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-white/15 blur-xl" />
                  <div className="absolute -bottom-6 -left-4 h-20 w-20 rounded-full bg-black/15 blur-xl" />
                  <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/30 text-white backdrop-blur-sm">
                    {t.type === 'quran' && '📖 Quran'}
                    {t.type === 'zikr' && '📿 Zikr'}
                    {t.type === 'dua' && '🤲 Dua'}
                    {t.type === 'names' && '✨ Names'}
                    {t.type === 'hadith' && '📜 Hadith'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-base mb-1.5 flex items-center gap-2">
                    {t.title}
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0" />
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                    {t.description}
                  </p>
                  <div className="mt-auto pt-3 border-t border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
                    {isQuranTemplate(t) && (
                      <>
                        <span className="font-mono font-semibold text-foreground/80">
                          {t.config.surah}:{t.config.fromAyat}
                          {t.config.toAyat !== t.config.fromAyat && `–${t.config.toAyat}`}
                        </span>
                        <span className="opacity-40">·</span>
                        <span className="capitalize">{t.config.arabicFont ?? 'uthmani'}</span>
                      </>
                    )}
                    {isZikrTemplate(t) && (
                      <>
                        <span className="font-mono font-semibold text-foreground/80">
                          × {t.config.count}
                        </span>
                        <span className="opacity-40">·</span>
                        <span className="capitalize">{t.config.pacing ?? 'realtime'}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* See all templates CTA */}
        <div className="text-center mt-10">
          <Link
            href="/templates"
            className="qv-btn-secondary inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold"
          >
            <LayoutGrid className="h-4 w-4 text-primary" />
            Browse all {TEMPLATE_PRESETS.length} templates
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
