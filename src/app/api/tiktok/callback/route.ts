import { NextResponse, type NextRequest } from 'next/server'
import { exchangeCode } from '@/lib/tiktok/api'
import { callbackPage } from '@/lib/tiktok/callbackPage'
import { sealSession, sessionCookie, stateCookie } from '@/lib/tiktok/session'
import { cookieOptions, cookiePath, tiktokApp } from '@/lib/tiktok/server'

export const runtime = 'nodejs'

const page = (ok: boolean, message: string) =>
  new NextResponse(callbackPage(ok, message), { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } })

export async function GET(request: NextRequest) {
  const app = tiktokApp(request)
  if (!app) return page(false, 'TikTok is not configured on the server.')
  const params = request.nextUrl.searchParams
  const code = params.get('code')
  const expected = request.cookies.get(stateCookie)?.value
  if (params.get('error') || !code) return page(false, 'TikTok login was cancelled.')
  if (!expected || params.get('state') !== expected) return page(false, 'TikTok login expired. Please try again.')
  try {
    const session = await exchangeCode(app, code)
    const response = page(true, 'TikTok connected')
    response.cookies.set(sessionCookie, sealSession(session, app.clientSecret), cookieOptions(Math.floor((session.expiresAt - Date.now()) / 1000)))
    response.cookies.delete({ name: stateCookie, path: cookiePath })
    return response
  } catch (error) {
    console.error('[tiktok/callback]', error)
    return page(false, 'Could not connect TikTok. Please try again.')
  }
}
