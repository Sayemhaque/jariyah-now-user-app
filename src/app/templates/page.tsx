'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Film,
  BookOpen,
  Heart,
  LayoutGrid,
} from 'lucide-react'
import {
  TEMPLATE_PRESETS,
  TEMPLATE_CATEGORIES,
  isQuranTemplate,
  isZikrTemplate,
  type TemplateType,
} from '@/lib/templatePresets'
import { getBackgroundPresetUrl } from '@/lib/backgroundPresets'
import { useBuilderStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const LEGAL_DISCLAIMER =
  'Jariyah Now is an independent tool and is not affiliated with or endorsed by any Quran recitation rights holder, translation publisher, or religious authority. Translations and audio recitations used in this app are credited to their respective sources. Users are responsible for the content they create and share using this platform.'

export default function TemplatesPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<TemplateType | 'all'>('all')

  // Pull the store actions we need to apply Quran-type templates.
  const setSurah = useBuilderStore((s) => s.setSurah)
  const setFromAyat = useBuilderStore((s) => s.setFromAyat)
  const setToAyat = useBuilderStore((s) => s.setToAyat)
  const setReciter = useBuilderStore((s) => s.setReciter)
  const setTranslation = useBuilderStore((s) => s.setTranslation)
  const updateSettings = useBuilderStore((s) => s.updateSettings)

  // Filter templates by active category.
  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') return TEMPLATE_PRESETS
    return TEMPLATE_PRESETS.filter((t) => t.type === activeCategory)
  }, [activeCategory])

  // Apply a template — depends on the type.
  const applyTemplate = (templateId: string) => {
    const template = TEMPLATE_PRESETS.find((t) => t.id === templateId)
    if (!template) {
      toast.error('Template not found')
      return
    }

    if (isQuranTemplate(template)) {
      const cfg = template.config
      // Apply surah + range to the store before navigating.
      setSurah(cfg.surah)
      // setSurah resets fromAyat=1 and toAyat=min(3, total). We need to
      // override with the template's values AFTER setSurah settles.
      Promise.resolve().then(() => {
        setFromAyat(cfg.fromAyat)
        setToAyat(cfg.toAyat)
        if (cfg.reciterId) setReciter(cfg.reciterId)
        if (cfg.translationKey) setTranslation(cfg.translationKey)
        if (cfg.backgroundPreset) {
          updateSettings({
            backgroundPreset: cfg.backgroundPreset,
            backgroundImage: getBackgroundPresetUrl(cfg.backgroundPreset),
          })
        }
        if (cfg.arabicFont) {
          updateSettings({
            arabicFont: cfg.arabicFont,
            fontStyle: cfg.arabicFont,
          })
        }
        if (cfg.highlightColor) {
          updateSettings({ highlightColor: cfg.highlightColor })
        }
      })
      toast.success(`Loading "${template.title}" template…`)
      router.push('/app')
      return
    }

    if (isZikrTemplate(template)) {
      const cfg = template.config
      const params = new URLSearchParams({
        zikr: cfg.zikrId,
        count: String(cfg.count),
      })
      if (cfg.pacing) params.set('pacing', cfg.pacing)
      toast.success(`Loading "${template.title}" template…`)
      router.push(`/zikr?${params.toString()}`)
      return
    }

    toast.error('Unknown template type')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 qv-frosted border-b border-border/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Jariyah Now logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl object-contain qv-logo-glow transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-lg font-bold tracking-tight">Jariyah Now</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/app"
              className="hidden sm:inline-flex items-center h-9 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition"
            >
              Builder
            </Link>
            <Link
              href="/zikr"
              className="hidden sm:inline-flex items-center h-9 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition"
            >
              Zikr Reels
            </Link>
            <Link
              href="/about"
              className="hidden sm:inline-flex items-center h-9 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition"
            >
              About
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

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="qv-ambient" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-12">
          <div className="max-w-3xl">
            {/* Premium badge */}
            <div className="qv-pill-premium mb-5">
              <LayoutGrid className="h-3.5 w-3.5" />
              One-click starting points
            </div>

            {/* Headline */}
            <h1 className="qv-hero-title font-display mb-4">
              Start from a <span className="qv-gradient-text">template</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Pre-configured reels for Quran verses, dhikr, duas, and more.
              Each template picks a verse (or zikr), a reciter, a background,
              and a font — so you can publish in minutes, not hours.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6">
              {[
                { icon: Sparkles, label: `${TEMPLATE_PRESETS.length} templates` },
                { icon: BookOpen, label: 'Quran · Zikr · Dua · Names · Hadith' },
                { icon: Film, label: 'Ready for Reels · Shorts · TikTok' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-card/80 border border-border/80 text-sm text-muted-foreground shadow-sm"
                >
                  <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="border-b border-border/70 bg-card/70 sticky top-16 z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border',
                activeCategory === cat.key
                  ? 'text-primary-foreground border-transparent shadow-md [background:var(--primary-gradient)]'
                  : 'bg-card/80 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground hover:bg-primary/5',
              )}
            >
              <span aria-hidden>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Template grid */}
      <section className="flex-1 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                className="group qv-card-premium rounded-2xl p-0 overflow-hidden text-left qv-hover-lift flex flex-col"
              >
                {/* Gradient header */}
                <div
                  className={cn(
                    'relative h-32 bg-gradient-to-br flex items-center justify-center overflow-hidden',
                    t.gradient,
                  )}
                >
                  <span
                    className="text-5xl filter drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                    aria-hidden
                  >
                    {t.icon}
                  </span>
                  {/* Decorative shapes */}
                  <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-white/15 blur-xl" />
                  <div className="absolute -bottom-6 -left-4 h-20 w-20 rounded-full bg-black/15 blur-xl" />
                  {/* Type badge */}
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
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                    {t.description}
                  </p>

                  {/* Type-specific metadata footer */}
                  {isQuranTemplate(t) && (
                    <div className="mt-auto pt-3 border-t border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-mono font-semibold text-foreground/80">
                        {t.config.surah}:{t.config.fromAyat}
                        {t.config.toAyat !== t.config.fromAyat && `–${t.config.toAyat}`}
                      </span>
                      <span className="opacity-40">·</span>
                      <span className="capitalize">{t.config.arabicFont ?? 'uthmani'} font</span>
                      {t.config.reciterId && (
                        <>
                          <span className="opacity-40">·</span>
                          <span className="capitalize">{t.config.reciterId}</span>
                        </>
                      )}
                    </div>
                  )}
                  {isZikrTemplate(t) && (
                    <div className="mt-auto pt-3 border-t border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-mono font-semibold text-foreground/80">
                        × {t.config.count}
                      </span>
                      <span className="opacity-40">·</span>
                      <span className="capitalize">{t.config.pacing ?? 'realtime'}</span>
                      <span className="opacity-40">·</span>
                      <span className="capitalize">{t.config.zikrId.replace(/-/g, ' ')}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Empty state (shouldn't happen, but defensive) */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-16">
              <div className="grid place-items-center h-14 w-14 rounded-2xl bg-muted text-muted-foreground mx-auto mb-4">
                <LayoutGrid className="h-7 w-7" />
              </div>
              <p className="text-muted-foreground">
                No templates in this category yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How it works strip */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 font-display">
              How templates work
            </h2>
            <p className="text-muted-foreground">
              Pick a template → it loads everything → you tweak + export
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                icon: LayoutGrid,
                title: 'Pick a template',
                desc: 'Browse Quran verses, zikr, duas, and more. Each card shows you exactly what you\u2019ll get.',
              },
              {
                step: '2',
                icon: Sparkles,
                title: 'It auto-configures',
                desc: 'The builder loads the surah, ayat range, reciter, font, background, and colors from the template.',
              },
              {
                step: '3',
                icon: Film,
                title: 'Tweak + export',
                desc: 'Adjust anything you want, then export an MP4 ready for Instagram Reels, TikTok, and YouTube Shorts.',
              },
            ].map((item) => (
              <div key={item.step} className="qv-card-premium rounded-2xl p-6 qv-hover-lift">
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

      {/* Sadaqah Jariyah band */}
      <section className="relative py-12 sm:py-16 px-4 sm:px-6 overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 bg-primary/5" aria-hidden />
        <div className="absolute inset-0 qv-grid-bg opacity-50" aria-hidden />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="qv-icon-chip h-12 w-12 mx-auto mb-4">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">
            Every share is Sadaqah Jariyah
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            When someone benefits from a Quran reel you shared, you earn reward
            for every view. Pick a template, customize it, and share — the
            reward keeps growing long after you click post.
          </p>
        </div>
      </section>

      {/* Footer */}
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
                { href: '/app', label: 'Builder' },
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

          <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Jariyah Now — All rights reserved
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────
