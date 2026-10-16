import { NextResponse, type NextRequest } from 'next/server'
import { queryCreatorInfo, startDirectPost } from '@/lib/tiktok/api'
import { postRequestSchema } from '@/lib/tiktok/postRequest'
import { postBlockers, toPostInfo } from '@/lib/tiktok/rules'
import { mediaOrigin, notConfigured, notConnected, readSession, tiktokApp, tiktokErrorResponse } from '@/lib/tiktok/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const app = tiktokApp(request)
  if (!app) return notConfigured()
  const session = readSession(request, app)
  if (!session) return notConnected()
  const parsed = postRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid post request', code: 'invalid_request' }, { status: 400 })
  const { jobId, form } = parsed.data
  try {
    const creator = await queryCreatorInfo(session.accessToken)
    const blockers = postBlockers(form, creator, 0)
    if (!creator.privacyOptions.includes(form.privacyLevel)) blockers.push('That privacy option is not available for your account.')
    if (blockers.length) return NextResponse.json({ error: blockers[0], code: 'invalid_post' }, { status: 400 })
    const videoUrl = `${mediaOrigin(request)}/api/render/download?jobId=${encodeURIComponent(jobId)}`
    return NextResponse.json({ publishId: await startDirectPost(session.accessToken, toPostInfo(form), videoUrl) })
  } catch (error) {
    return tiktokErrorResponse(error, 'post')
  }
}
