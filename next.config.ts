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
 *   - media from 'self' + https://verses.quran.com (the reciter audio CDN)
 *   - connect to 'self' + https://api.alquran.cloud + https://api.quran.com
 *     (the upstream Quran APIs; the browser calls alquran.cloud directly
 *     for text, and our /api/timings proxy calls quran.com server-side)
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
      "media-src 'self' https://verses.quran.com",
      "connect-src 'self' https://api.alquran.cloud https://api.quran.com https://verses.quran.com",
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
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
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
