import { ExternalLink } from './ExternalLink'

export function CreditLine({ linkClassName }: { linkClassName: string }) {
  return (
    <>
      কুরআনের লেখা:{' '}
      <ExternalLink href="https://ummahapi.com" className={linkClassName}>ummahapi.com</ExternalLink>
      {' • '}
      <ExternalLink href="https://quran.com" className={linkClassName}>quran.com</ExternalLink>
      {' • '}তিলাওয়াত:{' '}
      <ExternalLink href="https://everyayah.com" className={linkClassName}>everyayah.com</ExternalLink>
    </>
  )
}
