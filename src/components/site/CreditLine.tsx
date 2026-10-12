import { ExternalLink } from './ExternalLink'

export function CreditLine({ linkClassName }: { linkClassName: string }) {
  return (
    <>
      Quran text:{' '}
      <ExternalLink href="https://ummahapi.com" className={linkClassName}>ummahapi.com</ExternalLink>
      {' • '}
      <ExternalLink href="https://quran.com" className={linkClassName}>quran.com</ExternalLink>
      {' • '}Audio:{' '}
      <ExternalLink href="https://everyayah.com" className={linkClassName}>everyayah.com</ExternalLink>
    </>
  )
}
