import type { MetadataRoute } from 'next'

/**
 * sitemap.ts — generated at build time by Next.js.
 *
 * Lists the public-facing pages so search engines can discover them. The
 * /api/* routes are intentionally excluded (they're not for crawling).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const routes = ['/', '/app', '/about', '/terms', '/privacy']

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '/' ? 1 : route === '/app' ? 0.9 : 0.5,
  }))
}
