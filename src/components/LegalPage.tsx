import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const LEGAL_DISCLAIMER =
  'Jariyah Now is an independent tool and is not affiliated with or endorsed by any Quran recitation rights holder, translation publisher, or religious authority. Translations and audio recitations used in this app are credited to their respective sources. Users are responsible for the content they create and share using this platform.'

/**
 * Shared layout wrapper for the legal/info pages (/terms, /privacy, /about).
 * Renders a centered prose column with a back-to-builder link at the top
 * and a site footer with attribution + legal links at the bottom.
 */
export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link href="/app">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to builder
          </Link>
        </Button>

        <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: {lastUpdated}
        </p>

        <div className="prose max-w-none text-sm leading-relaxed text-foreground/80 space-y-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium [&_strong]:text-foreground [&_li]:leading-relaxed">
          {children}
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}

/**
 * Site footer with attribution + legal links. Shown on every page via
 * the LegalPage wrapper, and also rendered directly on the builder page
 * inside a collapsible section so it doesn't break the full-viewport
 * two-panel layout.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 justify-center sm:justify-start">
          <span className="font-medium text-foreground/70">Jariyah Now</span>
          <span className="opacity-40">·</span>
          <span>
            Quran text from{' '}
            <a
              href="https://alquran.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/80 hover:text-primary underline underline-offset-2"
            >
              alquran.cloud
            </a>{' '}
            &{' '}
            <a
              href="https://quran.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/80 hover:text-primary underline underline-offset-2"
            >
              quran.com
            </a>
          </span>
          <span className="opacity-40">·</span>
          <span>
            Audio from{' '}
            <a
              href="https://verses.quran.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/80 hover:text-primary underline underline-offset-2"
            >
              verses.quran.com
            </a>
          </span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/about"
            className="hover:text-foreground transition"
          >
            About
          </Link>
          <span className="opacity-40">·</span>
          <Link
            href="/terms"
            className="hover:text-foreground transition"
          >
            Terms
          </Link>
          <span className="opacity-40">·</span>
          <Link
            href="/privacy"
            className="hover:text-foreground transition"
          >
            Privacy
          </Link>
        </nav>
      </div>

      {/* Legal disclaimer — required on every page */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-5">
        <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
          {LEGAL_DISCLAIMER}
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground text-center">
          © {new Date().getFullYear()} Jariyah Now — All rights reserved
        </p>
      </div>
    </footer>
  )
}
