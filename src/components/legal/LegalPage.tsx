import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { ContentBlock } from '@/lib/content/richText'
import { Button } from '@/components/ui/button'
import { ContentBlockItem } from './ContentBlockItem'
import { SiteFooter } from './SiteFooter'

const proseClass =
  'prose max-w-none text-sm leading-relaxed text-foreground/80 space-y-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium [&_strong]:text-foreground [&_li]:leading-relaxed'

interface LegalPageProps {
  title: string
  lastUpdated: string
  blocks: ContentBlock[]
}

export function LegalPage({ title, lastUpdated, blocks }: LegalPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <div className="qv-ambient opacity-60" aria-hidden />
      <div className="relative flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/app">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to builder
          </Link>
        </Button>
        <div className="qv-card rounded-2xl p-6 sm:p-8 mb-2">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: {lastUpdated}</p>
          <div className={proseClass}>
            {blocks.map((block, index) => (
              <ContentBlockItem key={index} block={block} />
            ))}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
