import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy — Jariyah Now',
  description: 'How Jariyah Now handles your data.',
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="January 2026">
      <p>
        This Privacy Policy explains what data Jariyah Now collects, how it
        is used, and the choices you have. We designed the Service to
        collect as little as possible.
      </p>

      <h2>1. The short version</h2>
      <ul>
        <li>We do not require an account. We do not collect your name, email, or any contact information.</li>
        <li>We do not use analytics, tracking pixels, or advertising SDKs.</li>
        <li>The selections you make in the builder (surah, ayat range, reciter, settings) are stored only in your browser&apos;s memory — never sent to our server.</li>
        <li>Custom background images you upload never leave your browser.</li>
        <li>We log IP addresses for rate limiting and abuse prevention. We do not link them to any identity.</li>
        <li>Rendered videos are produced in your browser and never uploaded to our servers.</li>
      </ul>

      <h2>2. Data we do not collect</h2>
      <p>
        Jariyah Now does <strong>not</strong> collect or process:
      </p>
      <ul>
        <li>Names, email addresses, phone numbers, or any contact information</li>
        <li>Account credentials (the Service has no accounts)</li>
        <li>Precise geolocation</li>
        <li>Browsing history outside the Service</li>
        <li>The specific surah/ayat selections you make</li>
        <li>The videos you export (they are rendered in your browser and never uploaded)</li>
        <li>Custom background images you upload (they are read by the browser via FileReader and stored in memory only)</li>
      </ul>

      <h2>3. Data we temporarily process</h2>

      <h3>3.1 IP addresses (for rate limiting)</h3>
      <p>
        When you export a video, our server receives your IP address. We
        use it solely to enforce the rate limit (3 renders per hour per
        IP). The IP is included in structured log lines for the rate-limit
        decision and for diagnosing abuse. Logs are retained for up to 30
        days, then deleted. We do not link IP addresses to any identity,
        because we have no identity to link them to.
      </p>

      <h3>3.2 Request metadata</h3>
      <p>
        Each request to our API includes standard HTTP headers (User-Agent,
        Referer, Origin). We log a request ID and the requesting IP for
        debugging and abuse prevention. We do not log request bodies.
      </p>

      <h3>3.3 Cached Quran data</h3>
      <p>
        When you select a surah and ayat range, your browser fetches the
        Quran text, translation, and word timings from our API routes
        (which proxy UmmahAPI and quran.com). This data is cached at
        the CDN edge (Cloudflare/Vercel) and in your browser. The cache
        keys are the surah number, ayat number, reciter ID, and
        translation edition — none of which identify you personally.
      </p>

      <h2>4. Cookies</h2>
      <p>
        Jariyah Now does not set any cookies of its own. The hosting provider
        (e.g. Vercel) may set infrastructure cookies for load balancing
        or session affinity; these are not used for tracking.
      </p>
      <p>
        We do not use a cookie consent banner because we do not set
        non-essential cookies.
      </p>

      <h2>5. Third-party services</h2>
      <p>
        When you use Jariyah Now, your browser makes direct requests to the
        following third-party services. Their privacy policies apply to
        those requests:
      </p>
      <ul>
        <li>
          <a href="https://ummahapi.com" target="_blank" rel="noopener noreferrer">
            ummahapi.com
          </a>{' '}
          — Quran text, translations, and reciter audio URLs. Their privacy policy applies.
        </li>
        <li>
          <a href="https://quran.com" target="_blank" rel="noopener noreferrer">
            quran.com
          </a>{' '}
          — Word-timing data (proxied through our server to avoid CORS).
          Their privacy policy applies.
        </li>
        <li>
          <a href="https://everyayah.com" target="_blank" rel="noopener noreferrer">
            everyayah.com
          </a>{' '}
          — Reciter audio MP3s, loaded directly by your browser.
        </li>
        <li>
          <a href="https://fonts.googleapis.com" target="_blank" rel="noopener noreferrer">
            Google Fonts
          </a>{' '}
          — The Inter, Amiri, and Scheherazade fonts. Google&apos;s
          privacy policy applies.
        </li>
      </ul>

      <h2>6. Data retention</h2>
      <ul>
        <li>Server logs (including IPs): up to 30 days, then automatically deleted.</li>
        <li>Render job records: in-memory only, lost when the server restarts. Never persisted to disk.</li>
        <li>CDN cache of Quran data: up to 7 days, then revalidated.</li>
        <li>Browser memory (your selections, custom background): cleared when you close the tab.</li>
      </ul>

      <h2>7. Your rights</h2>
      <p>
        Because we do not collect personal data tied to an identity, most
        data-subject rights (access, correction, deletion) are
        automatically satisfied: there is nothing to access, correct, or
        delete. If you want server logs associated with your IP purged
        before the 30-day retention window, contact the maintainers via
        the repository&apos;s issue tracker with the approximate date and
        time of your request.
      </p>

      <h2>8. Children&apos;s privacy</h2>
      <p>
        The Service is not directed at children under 13, and we do not
        knowingly collect data from children. If you believe a child has
        used the Service, contact us — there is no data to delete, but we
        can block the IP if needed.
      </p>

      <h2>9. Security</h2>
      <p>
        All API requests are validated server-side. Rate limiting and bot
        filtering protect the API from abuse. Custom background images
        never leave your browser, so there is no upload-attack surface.
        We do not store secrets in client bundles.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The
        &quot;Last updated&quot; date at the top reflects the most recent
        revision. Material changes will be noted on the About page.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about this Privacy Policy can be directed to the
        project maintainers via the repository&apos;s issue tracker.
      </p>

      <p className="text-xs text-muted-foreground mt-8">
        This is a draft Privacy Policy. Have it reviewed by a qualified
        attorney and your hosting provider&apos;s DPO before relying on
        it for a production deployment, especially if you operate in the
        EU (GDPR) or California (CCPA).
      </p>
    </LegalPage>
  )
}
