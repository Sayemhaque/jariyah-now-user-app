import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'
import { RECITERS } from '@/lib/reciters'
import { TRANSLATION_EDITIONS } from '@/lib/translations'

export const metadata: Metadata = {
  title: 'About — Jariyah Now',
  description: 'Data sources, reciter credits, and translation editions used by Jariyah Now.',
}

export default function AboutPage() {
  return (
    <LegalPage title="About Jariyah Now" lastUpdated="January 2026">
      <p>
        Jariyah Now is a free tool for creating short recitation videos from
        the Quran. The name comes from <strong>Sadaqah Jariyah</strong> — the
        ongoing charity that keeps rewarding you long after the original act.
        Every reel you publish and share becomes a source of continuous
        reward: each view, each heart, each reshare counts. Pick a surah and
        ayat range, choose a reciter, customize the look, and export a video
        with word-by-word highlighting and a translation — ready to share.
      </p>

      <h2>Data sources</h2>
      <p>
        Jariyah Now fetches its content from the following free, public APIs.
        We are grateful to the maintainers of these services.
      </p>
      <ul>
        <li>
          <a href="https://ummahapi.com" target="_blank" rel="noopener noreferrer">
            ummahapi.com
          </a>{' '}
          — Quran text (Uthmani script), translations across 12 languages,
          and reciter audio URLs. Serves as the primary text + translation source.
        </li>
        <li>
          <a href="https://quran.com" target="_blank" rel="noopener noreferrer">
            quran.com
          </a>{' '}
          — Word-level timing data used to synchronize the
          word-by-word highlighting with the reciter audio. Also used
          (optionally) for Tajweed HTML.
        </li>
        <li>
          <a href="https://everyayah.com" target="_blank" rel="noopener noreferrer">
            everyayah.com
          </a>{' '}
          — Reciter audio MP3s, hosted per-ayah for direct streaming.
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
        Jariyah Now offers {RECITERS.length} reciters via UmmahAPI. We are
        deeply grateful to each of them and their estates for making these
        recitations available.
      </p>
      <ul>
        {RECITERS.map((r) => (
          <li key={r.id}>
            <strong>{r.name}</strong>{' '}
            <span className="font-arabic-uthmani text-base">
              {r.arabicName}
            </span>
            {' '}— {r.style} style. Audio from everyayah.com.
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
        Jariyah Now lets you choose from {TRANSLATION_EDITIONS.length}{' '}
        translations across Bengali, English, Urdu, Turkish, Indonesian,
        French, German, Spanish, Malay, and Bosnian — all sourced from
        UmmahAPI. Each has its own license — pick the one that fits your
        use case.
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
        The default is <strong>Bengali (Muhiuddin Khan)</strong> so the
        app never ships with a copyright-restricted translation as the
        default. When a translation requires attribution, Jariyah Now
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
        Jariyah Now&apos;s source code is MIT-licensed. See the{' '}
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
