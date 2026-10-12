import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { termsBlocks } from '@/lib/content/terms'

export const metadata: Metadata = {
  title: 'Terms of Service — Jariyah Now',
  description: 'The terms governing your use of Jariyah Now.',
}

export default function TermsPage() {
  return <LegalPage title="Terms of Service" lastUpdated="January 2026" blocks={termsBlocks} />
}
