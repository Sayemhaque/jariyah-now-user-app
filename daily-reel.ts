import { bundle } from '@remotion/bundler'
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer'
import { execFileSync } from 'node:child_process'
import { appendFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { buildDailyPost, type DailyImagePost, type DailyVideo } from '@/lib/daily/buildVideo'
import { dailyConfig } from '@/lib/daily/dailyConfig'
import { loadSocialConfig } from '@/lib/social/config'
import { uploadToYouTube } from '@/lib/social/youtube'
import { uploadToFacebookReels, uploadToInstagramReels } from '@/lib/social/meta'
import { postImagesToFacebook, postImagesToInstagram, type ImagePostInput } from '@/lib/social/metaImages'
import { withTemporaryUrls } from '@/lib/social/temporaryVideoUrl'
import type { CardProps } from '@/lib/cards/types'
import { uploadToTikTok } from '@/lib/social/tiktok'
import type { Platform, UploadInput, UploadResult } from '@/lib/social/types'

const env = process.env

function summary(line: string) {
  console.log(line)
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `${line}\n`)
}

let serveUrlPromise: Promise<string> | null = null

function bundledServeUrl(): Promise<string> {
  if (serveUrlPromise) return serveUrlPromise
  console.log('Bundling Remotion entry point...')
  serveUrlPromise = bundle({
    entryPoint: join(process.cwd(), 'src/remotion/Root.tsx'),
    webpackOverride: (config) => {
      config.resolve = config.resolve ?? {}
      config.resolve.alias = { ...(config.resolve.alias as object), '@': join(process.cwd(), 'src') }
      return config
    },
  })
  return serveUrlPromise
}

async function renderCards(cards: CardProps[], outDir: string): Promise<Buffer[]> {
  const serveUrl = await bundledServeUrl()
  const browserExecutable = env.BROWSER_EXECUTABLE || null
  const images: Buffer[] = []
  for (const [index, card] of cards.entries()) {
    const inputProps = card as unknown as Record<string, unknown>
    const composition = await selectComposition({ serveUrl, id: 'QuoteCard', inputProps, browserExecutable })
    const output = join(outDir, `card-${index + 1}.jpg`)
    await renderStill({ composition, serveUrl, inputProps, output, imageFormat: 'jpeg', jpegQuality: 95, browserExecutable })
    images.push(readFileSync(output))
    console.log(`Rendered ${output}`)
  }
  return images
}

async function render(props: object, outPath: string) {
  const serveUrl = await bundledServeUrl()
  const inputProps = props as Record<string, unknown>
  const browserExecutable = env.BROWSER_EXECUTABLE || null
  const composition = await selectComposition({ serveUrl, id: 'AyatVideo', inputProps, browserExecutable })
  console.log(`Rendering ${composition.durationInFrames} frames at ${composition.width}x${composition.height}...`)
  let lastPct = -10
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: outPath,
    inputProps,
    imageFormat: 'jpeg',
    pixelFormat: 'yuv420p',
    colorSpace: 'bt709',
    audioBitrate: '128k',
    enforceAudioTrack: true,
    browserExecutable,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100)
      if (pct >= lastPct + 10) {
        lastPct = pct
        console.log(`  render ${pct}%`)
      }
    },
  })
}

function makeReelSafe(rawPath: string, outPath: string) {
  execFileSync(env.FFMPEG_BIN || 'ffmpeg', ['-v', 'error', '-y', '-i', rawPath, '-c', 'copy', '-use_editlist', '0', '-movflags', '+faststart', outPath])
  rmSync(rawPath)
}

async function main() {
  const post = await buildDailyPost({
    surahOverride: env.SURAH ? Number(env.SURAH) : undefined,
    reciterId: dailyConfig.reciterId,
    translationKey: dailyConfig.translationKey,
    maxAyats: dailyConfig.maxAyats,
    postTimes: dailyConfig.postTimes,
    quality: dailyConfig.quality,
    extraHashtags: dailyConfig.extraHashtags,
    ffmpegBin: env.FFMPEG_BIN || 'ffmpeg',
    contentRotation: dailyConfig.contentRotation,
    textLanguage: dailyConfig.textLanguage,
  })

  summary(`## Daily post — ${post.dateKey}`)
  summary(post.label)
  summary(`**Title:** ${post.meta.title}\n`)
  if (post.kind === 'images') return postImages(post)
  return postVideo(post)
}

const isDryRun = () => env.DRY_RUN === '1' || env.DRY_RUN === 'true'

async function postVideo(video: DailyVideo) {
  const outDir = join(process.cwd(), 'out')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, `daily-${video.dateKey}.mp4`)

  const rawPath = join(outDir, `raw-${video.dateKey}.mp4`)
  await render(video.props, rawPath)
  makeReelSafe(rawPath, outPath)
  const buf = readFileSync(outPath)
  console.log(`Rendered ${outPath} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`)

  if (isDryRun()) {
    summary('Dry run — not posting.')
    return
  }

  const cfg = loadSocialConfig({
    ...env,
    YOUTUBE_PRIVACY_STATUS: dailyConfig.youtubePrivacy,
    TIKTOK_PRIVACY_LEVEL: dailyConfig.tiktokPrivacy,
  })
  const input: UploadInput = { video: buf, meta: video.meta, coverAtMs: dailyConfig.coverAtMs }
  const uploaders: Record<Platform, (() => Promise<UploadResult>) | null> = {
    youtube: cfg.youtube && (() => uploadToYouTube(cfg.youtube!, input)),
    facebook: cfg.facebook && (() => uploadToFacebookReels(cfg.facebook!, input)),
    instagram: cfg.instagram && (() => uploadToInstagramReels(cfg.instagram!, input)),
    tiktok: cfg.tiktok && (() => uploadToTikTok(cfg.tiktok!, input)),
  }

  await runUploads(uploaders)
}

async function postImages(post: DailyImagePost) {
  const outDir = join(process.cwd(), 'out', `images-${post.dateKey}`)
  mkdirSync(outDir, { recursive: true })
  const images = await renderCards(post.cards, outDir)
  if (isDryRun()) {
    summary('Dry run — not posting.')
    return
  }
  const token = env.BLOB_READ_WRITE_TOKEN
  if (!token) throw new Error('Image posts need the BLOB_READ_WRITE_TOKEN secret so Instagram and Facebook can fetch the images')
  const cfg = loadSocialConfig({ ...env })
  const files = images.map((data) => ({ data, contentType: 'image/jpeg', extension: 'jpg' }))
  await withTemporaryUrls(files, token, async (imageUrls) => {
    const input: ImagePostInput = { imageUrls, meta: post.meta }
    await runUploads({
      youtube: null,
      tiktok: null,
      facebook: cfg.facebook && (() => postImagesToFacebook(cfg.facebook!, input)),
      instagram: cfg.instagram && (() => postImagesToInstagram(cfg.instagram!, input)),
    })
  })
}

async function runUploads(uploaders: Record<Platform, (() => Promise<UploadResult>) | null>) {
  const failures: string[] = []
  summary('| Platform | Result |\n|---|---|')
  for (const platform of dailyConfig.platforms) {
    const upload = uploaders[platform]
    if (!upload) {
      summary(`| ${platform} | skipped (no credentials) |`)
      continue
    }
    try {
      const r = await upload()
      summary(`| ${platform} | ✅ ${r.url ?? r.id}${r.note ? ` — ${r.note}` : ''} |`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      failures.push(platform)
      console.error(`[${platform}]`, msg)
      summary(`| ${platform} | ❌ ${msg.replace(/\|/g, '/').slice(0, 300)} |`)
    }
  }

  if (failures.length) {
    throw new Error(`Upload failed on: ${failures.join(', ')}`)
  }
}

main().catch((err) => {
  console.error('Daily post failed:', err)
  process.exit(1)
})
