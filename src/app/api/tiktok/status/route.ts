import { NextResponse, type NextRequest } from 'next/server'
import { fetchPostStatus } from '@/lib/tiktok/api'
import { notConfigured, notConnected, readSession, tiktokApp, tiktokErrorResponse } from '@/lib/tiktok/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const app = tiktokApp(request)
  if (!app) return notConfigured()
  const session = readSession(request, app)
  if (!session) return notConnected()
  const publishId = request.nextUrl.searchParams.get('publishId')
  if (!publishId) return NextResponse.json({ error: 'publishId is required', code: 'invalid_request' }, { status: 400 })
  try {
    return NextResponse.json(await fetchPostStatus(session.accessToken, publishId))
  } catch (error) {
    return tiktokErrorResponse(error, 'status')
  }
}
