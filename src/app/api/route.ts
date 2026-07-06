import { NextResponse } from 'next/server'

/**
 * GET /api
 *
 * Returns basic service info + links to the useful endpoints. This is the
 * API root — not a health check (see /api/health for that).
 */
export async function GET() {
  return NextResponse.json({
    name: 'Jariyah Now API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      timings: '/api/timings',
      render: '/api/render',
      renderStatus: '/api/render-status',
    },
    docs: '/about',
  })
}
