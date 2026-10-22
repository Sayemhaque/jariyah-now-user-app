import { appendFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildDailyPost, type DailyImagePost, type DailyVideo } from '@/lib/daily/buildVideo'
import { dailyConfig } from '@/lib/daily/dailyConfig'
import { scheduledPostTime } from '@/lib/daily/plan'
import { isSlotPosted, markSlotPosted } from '@/lib/daily/postedMarker'
import { loadSocialConfig } from '@/lib/social/config'
import { uploadToYouTube } from '@/lib/social/youtube'
import { uploadToFacebookReels, uploadToInstagramReels } from '@/lib/social/meta'
import { postImagesToInstagram, type ImagePostInput } from '@/lib/social/metaImages'
import { withTemporaryUrls } from '@/lib/social/temporaryVideoUrl'
import { extractCover, makeReelSafe, renderCards, renderVideo } from '@/lib/render/remotionRender'
import { uploadToTikTok } from '@/lib/social/tiktok'
import type { Platform, UploadInput, UploadResult } from '@/lib/social/types'
import type { ContentMode } from '@/lib/collections/types'

const env = process.env

function summary(line: string) {
  console.log(line)
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `${line}\n`)
}

const postNow = env.POST_NOW === 'true'
const plannedSlot = scheduledPostTime(new Date(), dailyConfig.postTimes)
const slot = postNow ? new Date() : (plannedSlot ?? new Date())
const isTestRun = Boolean(env.SURAH || env.PLATFORMS || env.MODE || env.DUA)

const markerToken = env.BLOB_READ_WRITE_TOKEN

async function main() {
  if (!postNow && !plannedSlot) {
    summary('No post is due around now — nothing to do.')
    return
  }
  if (!postNow && plannedSlot && markerToken && (await isSlotPosted(plannedSlot, markerToken))) {
    summary(`Already posted for ${slot.toISOString()} — this backup run has nothing to do.`)
    return
  }
  const post = await buildDailyPost({
    now: slot,
    surahOverride: env.SURAH ? Number(env.SURAH) : undefined,
    duaId: env.DUA || undefined,
    reciterId: dailyConfig.reciterId,
    translationKey: dailyConfig.translationKey,
    maxAyats: dailyConfig.maxAyats,
    postTimes: dailyConfig.postTimes,
    quality: dailyConfig.quality,
    extraHashtags: dailyConfig.extraHashtags,
    ffmpegBin: env.FFMPEG_BIN || 'ffmpeg',
    maxDurationSec: dailyConfig.maxDurationSec,
    contentRotation: env.MODE ? [env.MODE as ContentMode] : undefined,
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
  await renderVideo(video.props, rawPath)
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
  const cover = extractCover(outPath, dailyConfig.coverAtMs, join(outDir, `cover-${video.dateKey}.jpg`))
  const input: UploadInput = { video: buf, meta: video.meta, coverAtMs: dailyConfig.coverAtMs, cover }
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
      facebook: null,
      instagram: cfg.instagram && (() => postImagesToInstagram(cfg.instagram!, input)),
    })
  })
}

async function runUploads(uploaders: Record<Platform, (() => Promise<UploadResult>) | null>) {
  const failures: string[] = []
  const posted: string[] = []
  summary('| Platform | Result |\n|---|---|')
  const only = env.PLATFORMS?.split(',').map((p) => p.trim()).filter(Boolean)
  for (const platform of only?.length ? dailyConfig.platforms.filter((p) => only.includes(p)) : dailyConfig.platforms) {
    const upload = uploaders[platform]
    if (!upload) {
      summary(`| ${platform} | skipped (no credentials) |`)
      continue
    }
    try {
      const r = await upload()
      posted.push(`${platform} ${r.url ?? r.id}`)
      summary(`| ${platform} | ✅ ${r.url ?? r.id}${r.note ? ` — ${r.note}` : ''} |`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      failures.push(platform)
      console.error(`[${platform}]`, msg)
      summary(`| ${platform} | ❌ ${msg.replace(/\|/g, '/').slice(0, 300)} |`)
    }
  }

  if (markerToken && plannedSlot && posted.length && !isTestRun) await markSlotPosted(plannedSlot, markerToken, posted.join('\n'))
  if (failures.length) {
    throw new Error(`Upload failed on: ${failures.join(', ')}`)
  }
}

main().catch((err) => {
  console.error('Daily post failed:', err)
  process.exit(1)
})
