import { Fragment } from 'react'
import Link from 'next/link'
import { copyrightText, legalDisclaimer, legalFooterLinks } from '@/lib/content/site'
import { ExternalLink } from '@/components/site/ExternalLink'

const linkClass = 'text-primary/80 hover:text-primary underline underline-offset-2'
const dot = <span className="opacity-40">·</span>

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-card/80 backdrop-blur-sm mt-auto relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 justify-center sm:justify-start">
          <span className="font-medium text-foreground/70">Jariyah Now</span>
          {dot}
          <span>
            Quran text from <ExternalLink href="https://ummahapi.com" className={linkClass}>ummahapi.com</ExternalLink>{' '}
            & <ExternalLink href="https://quran.com" className={linkClass}>quran.com</ExternalLink>
          </span>
          {dot}
          <span>
            Audio from <ExternalLink href="https://everyayah.com" className={linkClass}>everyayah.com</ExternalLink>
          </span>
        </div>
        <nav className="flex items-center gap-3">
          {legalFooterLinks.map((link, index) => (
            <Fragment key={link.href}>
              {index > 0 && dot}
              <Link href={link.href} className="hover:text-foreground transition">{link.label}</Link>
            </Fragment>
          ))}
        </nav>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-5">
        <p className="text-[11px] text-muted-foreground leading-relaxed text-center">{legalDisclaimer}</p>
        <p className="mt-2 text-[11px] text-muted-foreground text-center">{copyrightText()}</p>
      </div>
    </footer>
  )
}
