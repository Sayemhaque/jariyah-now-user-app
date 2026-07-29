import { NextResponse } from 'next/server'
import { getEnv } from '@/lib/env'
import { createJob } from '@/lib/renderJobStore'
import { randomUUID } from 'node:crypto'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const env = getEnv()
    const token = env.GITHUB_TOKEN
    const owner = env.GITHUB_OWNER
    const repo = env.GITHUB_REPO

    if (!token || !owner || !repo) {
      return NextResponse.json(
        { error: 'GitHub token and repo not configured on server' },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { slides } = body

    if (!slides?.length) {
      return NextResponse.json({ error: 'No slides provided' }, { status: 400 })
    }

    const jobId = randomUUID()
    const job = createJob(jobId)

    const webhookUrl = `${request.url.replace('/start', '/webhook')}`

    const ghaPayload = {
      ref: 'main',
      inputs: {
        jobId,
        webhookUrl,
        props: JSON.stringify(body),
      },
    }

    const ghaRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/render-video.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'jariyah-now',
        },
        body: JSON.stringify(ghaPayload),
      },
    )

    if (!ghaRes.ok) {
      const errText = await ghaRes.text().catch(() => 'unknown')
      console.error('[render/start] GHA dispatch failed:', ghaRes.status, errText)
      const statusCode = ghaRes.status === 401 ? 500 : 502
      return NextResponse.json(
        { error: `GitHub dispatch failed (${ghaRes.status}): ${errText}` },
        { status: statusCode },
      )
    }

    return NextResponse.json({ jobId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Render start failed'
    console.error('[render/start]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
