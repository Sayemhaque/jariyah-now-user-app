import Link from 'next/link'
import { Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/site/BrandLogo'
import { MobileMenu } from './MobileMenu'

interface AppHeaderProps {
  canExport: boolean
  onExport: () => void
}

export function AppHeader({ canExport, onExport }: AppHeaderProps) {
  return (
    <header className="border-b border-border/70 qv-frosted shrink-0 z-30">
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandLogo
            size={36}
            className="h-9 w-9 rounded-xl qv-logo-glow transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-bold tracking-tight">Jariyah Now</span>
            <span className="hidden sm:inline text-[11px] text-muted-foreground font-medium">Quran Reels</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/templates"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition"
          >
            Templates
          </Link>
          <Button onClick={onExport} disabled={!canExport} size="sm" className="font-semibold">
            <Film className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Export video</span>
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
