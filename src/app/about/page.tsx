import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { aboutBlocks } from '@/lib/content/about'

export const metadata: Metadata = {
  title: 'About — Jariyah Now',
  description: 'Data sources, reciter credits, and translation editions used by Jariyah Now.',
}

export default function AboutPage() {
  return <LegalPage title="About Jariyah Now" lastUpdated="January 2026" blocks={aboutBlocks} />
}
