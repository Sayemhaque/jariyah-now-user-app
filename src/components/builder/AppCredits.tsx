import { legalFooterLinks } from '@/lib/content/site'
import { DotNav } from '@/components/site/DotNav'
import { ExternalLink } from '@/components/site/ExternalLink'

const linkClass = 'text-foreground/80 hover:text-primary underline underline-offset-2 font-medium'

export function AppCredits() {
  return (
    <div className="px-1 pt-1 pb-2 text-[11px] text-muted-foreground space-y-2">
      <p className="leading-relaxed">
        Quran text from <ExternalLink href="https://ummahapi.com" className={linkClass}>ummahapi.com</ExternalLink>
        {', '}
        <ExternalLink href="https://quran.com" className={linkClass}>quran.com</ExternalLink>. Audio from{' '}
        <ExternalLink href="https://everyayah.com" className={linkClass}>everyayah.com</ExternalLink>.
      </p>
      <DotNav links={legalFooterLinks} linkClassName="hover:text-primary transition" />
    </div>
  )
}
