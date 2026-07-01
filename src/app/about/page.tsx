import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'
import { RECITERS } from '@/lib/reciters'
import { TRANSLATION_EDITIONS } from '@/lib/translations'

export const metadata: Metadata = {
  title: 'About — QuranVid',
  description: 'Data sources, reciter credits, and translation editions used by QuranVid.',
}

export default function AboutPage() {
  return (
    <LegalPage title="About QuranVid" lastUpdated="January 2026">
      <p>
        QuranVid is a free tool for creating short recitation videos from
        the Quran. Pick a surah and ayat range, choose a reciter, customize
        the look, and export a video with word-by-word highlighting and an
        English translation — ready to share.
      </p>

      <h2>Data sources</h2>
      <p>
        QuranVid fetches its content from the following free, public APIs.
        We are grateful to the maintainers of these services.
      </p>
      <ul>
        <li>
          <a href="https://alquran.cloud" target="_blank" rel="noopener noreferrer">
            alquran.cloud
          </a>{' '}
          — Quran text (Uthmani script), English translations, and surah
          metadata. Serves as the primary text source.
        </li>
        <li>
          <a href="https://quran.com" target="_blank" rel="noopener noreferrer">
            quran.com
          </a>{' '}
          — Word-level timing data used to synchronize the
          word-by-word highlighting with the reciter audio.
        </li>
        <li>
          <a href="https://verses.quran.com" target="_blank" rel="noopener noreferrer">
            verses.quran.com
          </a>{' '}
          — Reciter audio MP3s, hosted by the QuranFoundation CDN.
        </li>
        <li>
          <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer">
            Tanzil.net
          </a>{' '}
          — The upstream source of the Uthmani text. We credit them as
          the canonical text provider.
        </li>
      </ul>

      <h2>Reciters</h2>
      <p>
        QuranVid offers five reciters. We are deeply grateful to each of
        them and their estates for making these recitations available.
      </p>
      <ul>
        {RECITERS.map((r) => (
          <li key={r.id}>
            <strong>{r.name}</strong>{' '}
            <span className="font-arabic-uthmani text-base">
              {r.arabicName}
            </span>
            {' '}— {r.style} style. Audio from verses.quran.com.
          </li>
        ))}
      </ul>
      <p>
        If you publish a video, please credit the reciter by name in the
        description. Non-commercial use with attribution is widely
        accepted; commercial use requires permission from the rights
        holder.
      </p>

      <h2>Translation editions</h2>
      <p>
        QuranVid lets you choose from several English translations. Each
        has its own license — pick the one that fits your use case.
      </p>
      <ul>
        {TRANSLATION_EDITIONS.map((e) => (
          <li key={e.key}>
            <strong>{e.label}</strong> ({e.fullName}) — {e.rightsHolder}.
            <br />
            <span className="text-muted-foreground">{e.licenseNote}</span>
          </li>
        ))}
      </ul>
      <p>
        The default is <strong>Pickthall</strong> (public domain) so the
        app never ships with a copyright-restricted translation as the
        default. When a translation requires attribution, QuranVid
        automatically adds an attribution line to the bottom-left of the
        exported video.
      </p>

      <h2>Background images</h2>
      <p>
        The 7 preset background images (Mountain Dawn, Desert Dusk, Deep
        Ocean, Misty Forest, Starlit Night, Mosque Gold, Arabesque) were
        AI-generated and released to the public domain (CC0). You may
        also upload your own custom background — you are responsible for
        ensuring you have the rights to use it.
      </p>

      <h2>Fonts</h2>
      <ul>
        <li>
          <strong>Inter</strong> — UI text and English translation. SIL
          Open Font License.
        </li>
        <li>
          <strong>Amiri</strong> — Arabic, Uthmani style. SIL Open Font
          License.
        </li>
        <li>
          <strong>Scheherazade New</strong> — Arabic, Naskh style. SIL
          Open Font License.
        </li>
      </ul>

      <h2>Open source</h2>
      <p>
        QuranVid&apos;s source code is MIT-licensed. See the{' '}
        <Link href="/terms" className="text-primary underline underline-offset-2">
          Terms of Service
        </Link>{' '}
        and the LICENSE + NOTICES files in the repository for full
        licensing details.
      </p>

      <h2>Feedback</h2>
      <p>
        Found a bug or have a feature request? Open an issue on the
        project repository. We welcome contributions.
      </p>
    </LegalPage>
  )
}
