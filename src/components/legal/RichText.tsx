import Link from 'next/link'
import { parseRichText } from '@/lib/content/richText'
import { ExternalLink } from '@/components/site/ExternalLink'

export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseRichText(text).map((token, index) => {
        switch (token.kind) {
          case 'bold':
            return <strong key={index}>{token.value}</strong>
          case 'arabic':
            return <span key={index} className="font-arabic-uthmani text-base">{token.value}</span>
          case 'muted':
            return <span key={index} className="text-muted-foreground">{token.value}</span>
          case 'break':
            return <br key={index} />
          case 'link':
            return token.href.startsWith('/') ? (
              <Link key={index} href={token.href} className="text-primary underline underline-offset-2">
                {token.value}
              </Link>
            ) : (
              <ExternalLink key={index} href={token.href}>{token.value}</ExternalLink>
            )
          default:
            return token.value
        }
      })}
    </>
  )
}
