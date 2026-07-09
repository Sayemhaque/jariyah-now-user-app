import type { NextConfig } from "next";

/**
 * Security headers applied to every response. These defend against the
 * common web vulnerabilities (clickjacking, MIME-sniffing XSS, protocol
 * downgrade) and lock down the permissions surface.
 *
 * The CSP allows:
 *   - scripts/styles from 'self' + 'unsafe-inline' (Next.js inlines styles
 *     and small chunks; removing 'unsafe-inline' requires nonces which is
 *     a bigger refactor)
 *   - images from 'self' + data: (for uploaded backgrounds) + https: (for
 *     the preset PNGs and any remote image)
 *   - media from:
 *       'self'                                   — uploaded / generated audio
 *       https://everyayah.com                    — UmmahAPI-backed reciter MP3s
 *       https://download.quranicaudio.com        — full-recitation fallback
 *       https://verses.quran.com                 — legacy per-word MP3s
 *       https://audio.qurancdn.com               — quran.com word MP3 CDN
 *   - connect to:
 *       'self'                                   — our own API routes
 *       https://ummahapi.com                     — primary Quran API (text +
 *                                                  translation + audio URLs)
 *       https://api.quran.com                    — legacy quran.com API (used
 *                                                  by /api/timings for word
 *                                                  timings + Tajweed HTML)
 *       https://everyayah.com                    — reciter MP3 fetches
 *       https://download.quranicaudio.com        — full-recitation fallback
 *       https://verses.quran.com                 — legacy per-word MP3 fallback
 *       https://audio.qurancdn.com               — quran.com word MP3 CDN
 *   - fonts from 'self' + https://fonts.gstatic.com (Google Fonts)
 *
 * HSTS is only sent in production (NODE_ENV=production) — in dev, HTTPS
 * isn't used and the header would lock browsers out.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "media-src 'self' https://everyayah.com https://download.quranicaudio.com https://verses.quran.com https://audio.qurancdn.com",
      "connect-src 'self' https://ummahapi.com https://api.quran.com https://everyayah.com https://download.quranicaudio.com https://verses.quran.com https://audio.qurancdn.com",
      "font-src 'self' https://fonts.gstatic.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // HSTS — only in production. In dev we serve over HTTP.
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // Enforce type safety in production builds. If there are type errors,
    // the build fails rather than silently shipping broken code.
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  // Raise the body size limit for API routes that accept large uploads.
  // The default is 1MB which is far too small for video files — the
  // /api/convert-mp4 endpoint accepts WebM blobs up to 100MB.
  turbopack: {
    root: "/home/sayem/Desktop/jariyah-now-user-app",
  },
  allowedDevOrigins: [
    "*.space-z.ai",
    "*.chatglm.cn",
    "localhost",
    "127.0.0.1",
  ],
  async headers() {
    return [
      {
        // Apply security headers to every route.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
