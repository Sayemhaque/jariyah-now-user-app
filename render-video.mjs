import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { put } from '@vercel/blob'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

async function main() {
  const jobId = process.env.JOB_ID
  const webhookUrl = process.env.WEBHOOK_URL
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  const propsPath = join(process.cwd(), 'input-props.json')

  console.log('JOB_ID:', process.env.JOB_ID ? 'present' : 'MISSING')
  console.log('WEBHOOK_URL:', process.env.WEBHOOK_URL ? 'present' : 'MISSING')
  console.log('BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? 'present' : 'MISSING')

  if (!jobId || !webhookUrl || !blobToken) {
    const missing = []
    if (!jobId) missing.push('JOB_ID')
    if (!webhookUrl) missing.push('WEBHOOK_URL')
    if (!blobToken) missing.push('BLOB_READ_WRITE_TOKEN')
    console.error('Missing required env vars:', missing.join(', '))
    process.exit(1)
  }

  const inputProps = JSON.parse(readFileSync(propsPath, 'utf-8'))

  console.log('Bundling Remotion entry point...')
  const serveUrl = await bundle({
    entryPoint: join(process.cwd(), 'src/remotion/Root.tsx'),
    webpackOverride: (config) => {
      config.resolve = config.resolve ?? {}
      config.resolve.alias = {
        ...(config.resolve.alias),
        '@': join(process.cwd(), 'src'),
      }
      return config
    },
  })
  console.log('Bundle ready:', serveUrl)

  const composition = await selectComposition({
    serveUrl,
    id: 'AyatVideo',
    inputProps,
  })
  console.log('Composition selected:', composition.id, composition.durationInFrames, 'frames')

  const outDir = join(process.cwd(), 'out')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, 'video.mp4')

  console.log('Rendering video...')
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: outPath,
    inputProps,
    imageFormat: 'jpeg',
    enforceAudioTrack: true,
    logLevel: 'info',
  })
  console.log('Render complete')

  const fileBuffer = readFileSync(outPath)
  const blobPath = `exports/${jobId}.mp4`

  console.log('Uploading to Vercel Blob...')
  const blob = await put(blobPath, fileBuffer, {
    access: 'public',
    token: blobToken,
  })
  console.log('Uploaded:', blob.url)

  const payload = JSON.stringify({ url: blob.url, jobId })
  const callbackUrl = `${webhookUrl}?jobId=${encodeURIComponent(jobId)}&url=${encodeURIComponent(blob.url)}`

  console.log('Calling webhook:', callbackUrl)
  const res = await fetch(callbackUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  })
  if (!res.ok) {
    console.error('Webhook call failed:', res.status)
    return
  }
  console.log('Webhook success')
}

main().catch((err) => {
  console.error('Render failed:', err)
  process.exit(1)
})
