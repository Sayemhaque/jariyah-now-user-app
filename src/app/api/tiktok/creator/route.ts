import { NextResponse, type NextRequest } from 'next/server'
import { queryCreatorInfo } from '@/lib/tiktok/api'
import { notConfigured, notConnected, readSession, tiktokApp, tiktokErrorResponse } from '@/lib/tiktok/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const app = tiktokApp(request)
  if (!app) return notConfigured()
  const session = readSession(request, app)
  if (!session) return notConnected()
  try {
    return NextResponse.json({ creator: await queryCreatorInfo(session.accessToken) })
  } catch (error) {
    return tiktokErrorResponse(error, 'creator')
  }
}
