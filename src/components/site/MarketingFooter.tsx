import Link from 'next/link'
import { copyrightText, legalDisclaimer, type NavItem } from '@/lib/content/site'
import { cn } from '@/lib/utils'
import { BrandLogo } from './BrandLogo'
import { CreditLine } from './CreditLine'

interface MarketingFooterProps {
  links: NavItem[]
  showCredits?: boolean
}

export function MarketingFooter({ links, showCredits }: MarketingFooterProps) {
  return (
    <footer className="border-t border-border/80 bg-card/80 backdrop-blur-sm mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandLogo size={36} className="h-9 w-9 rounded-xl qv-logo-glow" />
            <div>
              <div className="font-bold text-sm">Jariyah Now</div>
              <div className="text-xs text-muted-foreground">Share once, earn forever.</div>
            </div>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-sm">
            {links.map((item) => (
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
        <p className="mt-8 text-xs text-muted-foreground leading-relaxed text-center max-w-4xl mx-auto">
          {legalDisclaimer}
        </p>
        <div className={cn('mt-6 pt-6 border-t border-border text-xs text-muted-foreground text-center', showCredits && 'leading-relaxed')}>
          {showCredits && (
            <>
              <CreditLine linkClassName="text-primary hover:underline" />
              <br />
            </>
          )}
          {copyrightText()}
        </div>
      </div>
    </footer>
  )
}
