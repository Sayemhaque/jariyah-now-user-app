import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { privacyBlocks } from '@/lib/content/privacy'

export const metadata: Metadata = {
  title: 'Privacy Policy — Jariyah Now',
  description: 'How Jariyah Now handles your data.',
}

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" lastUpdated="January 2026" blocks={privacyBlocks} />
}
