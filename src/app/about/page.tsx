import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { aboutBlocks } from '@/lib/content/about'

export const metadata: Metadata = {
  title: 'আমাদের কথা — Jariyah Now',
  description: 'Jariyah Now-এ ব্যবহৃত তথ্যের উৎস, কারীগণ ও অনুবাদসমূহের পরিচয়।',
}

export default function AboutPage() {
  return <LegalPage title="Jariyah Now সম্পর্কে" lastUpdated="জানুয়ারি ২০২৬" blocks={aboutBlocks} />
}
