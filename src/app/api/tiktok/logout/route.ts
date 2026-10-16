import { NextResponse } from 'next/server'
import { sessionCookie } from '@/lib/tiktok/session'
import { cookiePath } from '@/lib/tiktok/server'

export const runtime = 'nodejs'

export function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete({ name: sessionCookie, path: cookiePath })
  return response
}
