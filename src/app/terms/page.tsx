import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service — QuranVid',
  description: 'The terms governing your use of QuranVid.',
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="January 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and
        use of the QuranVid web application (the &quot;Service&quot;). By
        using the Service, you agree to these Terms. If you do not agree,
        do not use the Service.
      </p>

      <h2>1. What the Service does</h2>
      <p>
        QuranVid is a free tool that lets you select a passage of the
        Quran, choose a reciter, customize the visual style, and export a
        short video with word-by-word highlighting and an English
        translation. The Service fetches Quran text, translations,
        reciter audio, and timing data from third-party APIs at runtime
        and renders the video in your browser.
      </p>

      <h2>2. Accounts</h2>
      <p>
        The Service does not require an account. We do not collect a
        username, email address, or password. Your selections (surah,
        ayat range, reciter, customization settings) are stored only in
        your browser&apos;s memory and are lost when you close the tab.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree NOT to:</p>
      <ul>
        <li>
          Use the Service for any unlawful purpose or in violation of any
          local, state, national, or international law.
        </li>
        <li>
          Attempt to overload, crash, or reverse-engineer the Service, its
          APIs, or the third-party APIs it depends on.
        </li>
        <li>
          Bypass the rate limits, bot filters, or other usage controls
          described in the Privacy Policy.
        </li>
        <li>
          Use the Service to generate content that is hateful, harassing,
          or that promotes violence.
        </li>
        <li>
          Resell, sublicense, or commercialize access to the Service
          itself. (You may, however, freely distribute the videos you
          create — see Section 5.)
        </li>
      </ul>

      <h2>4. Rate limits</h2>
      <p>
        To keep the Service available to everyone, we limit the number of
        video exports per IP address. The current limit is 3 renders per
        hour. We may change this limit at any time. If you hit the limit,
        wait for the window to reset or use a different network.
      </p>

      <h2>5. Content licensing — READ THIS</h2>
      <p>
        The videos you create with QuranVid contain third-party content
        (Quran text, translations, reciter audio). <strong>You are
        responsible</strong> for complying with the license of each
        component in any video you distribute.
      </p>

      <h3>5.1 Quran text (Arabic)</h3>
      <p>
        The Arabic Quran text is the word of God and is not subject to
        copyright. It is sourced from{' '}
        <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer">
          Tanzil.net
        </a>{' '}
        via{' '}
        <a href="https://alquran.cloud" target="_blank" rel="noopener noreferrer">
          alquran.cloud
        </a>
        .
      </p>

      <h3>5.2 Translations</h3>
      <p>
        Different translations have different licenses. QuranVid shows the
        license summary for each edition in the sidebar. Specifically:
      </p>
      <ul>
        <li>
          <strong>Pickthall</strong> (default): public domain. You may
          distribute freely.
        </li>
        <li>
          <strong>Saheeh International</strong>: permitted for
          non-commercial use with attribution.
        </li>
        <li>
          <strong>Clear Quran (Dr. Mustafa Khattab)</strong>: permitted
          for non-commercial use with attribution to the Furqan Institute.
        </li>
        <li>
          <strong>Muhammad Asad</strong>: COPYRIGHTED by Dar al-Andalus
          Ltd. Personal reading only — a separate written license is
          required for any public distribution, including in videos.
          QuranVid shows a warning badge when this edition is selected.
        </li>
      </ul>
      <p>
        When a translation requires attribution, QuranVid automatically
        adds an attribution line to the bottom-left of the exported video.
        Attribution alone does not satisfy the Muhammad Asad license —
        you must obtain a separate license from Dar al-Andalus.
      </p>

      <h3>5.3 Reciter audio</h3>
      <p>
        Reciter audio is streamed from the{' '}
        <a href="https://quran.com" target="_blank" rel="noopener noreferrer">
          quran.com
        </a>{' '}
        CDN. Rights belong to the reciters and their estates. Non-commercial
        use with attribution is widely accepted; commercial use requires
        permission from the rights holder. We encourage you to credit the
        reciter by name in any video description when publishing.
      </p>

      <h3>5.4 Background images</h3>
      <p>
        The 7 preset background images are AI-generated and released to
        the public domain (CC0). If you upload your own custom
        background, you are solely responsible for ensuring you have the
        rights to use it.
      </p>

      <h2>6. No warranty</h2>
      <p>
        The Service is provided &quot;as is&quot; and &quot;as
        available&quot;, without warranty of any kind. We do not guarantee
        that the Service will be uninterrupted, error-free, or that the
        third-party APIs will remain available. The Quran text and
        translations are sourced from third parties; we are not
        responsible for their accuracy.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, the maintainers of
        QuranVid shall not be liable for any indirect, incidental,
        special, consequential, or punitive damages, or any loss of data,
        arising out of your use of the Service.
      </p>

      <h2>8. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. The &quot;Last
        updated&quot; date at the top of this page reflects the most
        recent revision. Continued use of the Service after changes
        constitutes acceptance of the new Terms.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these Terms can be directed to the project
        maintainers via the repository&apos;s issue tracker.
      </p>

      <p className="text-xs text-muted-foreground mt-8">
        This is a draft Terms of Service. Have it reviewed by a qualified
        attorney before relying on it for a production deployment.
      </p>
    </LegalPage>
  )
}
