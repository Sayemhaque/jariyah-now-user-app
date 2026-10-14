import { NextResponse, type NextRequest } from 'next/server'
import { getEnv } from '@/lib/env'
import { TikTokApiError, type TikTokApp } from './api'
import { openSession, sessionCookie, type TikTokSession } from './session'

export const cookiePath = '/api/tiktok'

export function tiktokApp(request: NextRequest): TikTokApp | null {
  const env = getEnv()
  if (!env.TIKTOK_CLIENT_KEY || !env.TIKTOK_CLIENT_SECRET) return null
  return {
    clientKey: env.TIKTOK_CLIENT_KEY,
    clientSecret: env.TIKTOK_CLIENT_SECRET,
    redirectUri: env.TIKTOK_REDIRECT_URI ?? `${request.nextUrl.origin}/api/tiktok/callback`,
  }
}

export const mediaOrigin = (request: NextRequest) => getEnv().TIKTOK_MEDIA_ORIGIN ?? request.nextUrl.origin

export function readSession(request: NextRequest, app: TikTokApp): TikTokSession | null {
  return openSession(request.cookies.get(sessionCookie)?.value, app.clientSecret)
}

export const cookieOptions = (maxAgeSec: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: cookiePath,
  maxAge: maxAgeSec,
})

export const notConfigured = () => NextResponse.json({ error: 'TikTok is not configured on the server', code: 'not_configured' }, { status: 503 })
export const notConnected = () => NextResponse.json({ error: 'Connect your TikTok account first', code: 'not_connected' }, { status: 401 })

export function tiktokErrorResponse(error: unknown, label: string) {
  if (error instanceof TikTokApiError) {
    const expired = error.code === 'access_token_invalid' || error.status === 401
    return NextResponse.json({ error: error.message, code: expired ? 'not_connected' : error.code }, { status: expired ? 401 : 400 })
  }
  console.error(`[tiktok/${label}]`, error)
  return NextResponse.json({ error: error instanceof Error ? error.message : 'TikTok request failed', code: 'unknown' }, { status: 500 })
}
