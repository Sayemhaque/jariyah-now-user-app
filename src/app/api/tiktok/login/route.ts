import { randomBytes } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { authorizeUrl } from '@/lib/tiktok/api'
import { stateCookie } from '@/lib/tiktok/session'
import { cookieOptions, notConfigured, tiktokApp } from '@/lib/tiktok/server'

export const runtime = 'nodejs'

export function GET(request: NextRequest) {
  const app = tiktokApp(request)
  if (!app) return notConfigured()
  const state = randomBytes(16).toString('hex')
  const response = NextResponse.redirect(authorizeUrl(app, state))
  response.cookies.set(stateCookie, state, cookieOptions(600))
  return response
}
