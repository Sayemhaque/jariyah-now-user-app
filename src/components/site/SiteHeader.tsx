import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { NavItem } from '@/lib/content/site'
import { BrandLogo } from './BrandLogo'

const hideClasses = {
  sm: 'hidden sm:inline-flex',
  md: 'hidden md:inline-flex',
}

export function SiteHeader({ links }: { links: NavItem[] }) {
  return (
    <header className="sticky top-0 z-30 qv-frosted border-b border-border/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandLogo
            size={40}
            priority
            className="h-10 w-10 rounded-xl qv-logo-glow transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-lg font-bold tracking-tight">Jariyah Now</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`${hideClasses[link.hideBelow ?? 'sm']} items-center h-9 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition`}
            >
              {link.label}
            </Link>
          ))}
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
  )
}
