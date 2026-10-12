/**
 * Daily Quran reel: pick today's surah, render it with Remotion, and post it
 * to YouTube Shorts, Facebook Reels, Instagram Reels and TikTok.
 *
 * Run by .github/workflows/daily-reel.yml every day at 22:00 Asia/Dhaka.
 * Locally:  DRY_RUN=1 npx tsx daily-reel.ts
 *
 * Env (all optional unless noted):
 *   DRY_RUN=1            render only, don't post
 *   SURAH=112            force a surah instead of the daily pick
 *   RECITER=alafasy      reciter id, or "random" (default) for the rotation
 *   TRANSLATION=bengali  UmmahAPI translation key
 *   PLATFORMS=youtube,facebook,instagram,tiktok   (default: all configured)
 *   MAX_DURATION_SEC=85  QUALITY=1080p  EXTRA_HASHTAGS="JariyahNow,Bangladesh"
 *   BROWSER_EXECUTABLE=/path/to/chrome   use a local Chrome instead of downloading one
 *   + platform credentials — see src/lib/social/config.ts
 */
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildDailyVideo } from '@/lib/daily/buildVideo'
import { loadSocialConfig, parsePlatforms } from '@/lib/social/config'
import { uploadToYouTube } from '@/lib/social/youtube'
import { uploadToFacebookReels, uploadToInstagramReels } from '@/lib/social/meta'
import { uploadToTikTok } from '@/lib/social/tiktok'
import type { Platform, UploadInput, UploadResult } from '@/lib/social/types'

const env = process.env

function summary(line: string) {
  console.log(line)
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `${line}\n`)
}

async function render(props: object, outPath: string) {
  console.log('Bundling Remotion entry point...')
  const serveUrl = await bundle({
    entryPoint: join(process.cwd(), 'src/remotion/Root.tsx'),
    webpackOverride: (config) => {
      config.resolve = config.resolve ?? {}
      config.resolve.alias = { ...(config.resolve.alias as object), '@': join(process.cwd(), 'src') }
      return config
    },
  })
  const inputProps = props as Record<string, unknown>
  // Remotion downloads its own headless Chrome unless one is provided.
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

async function main() {
  const video = await buildDailyVideo({
    surahOverride: env.SURAH ? Number(env.SURAH) : undefined,
    reciterId: env.RECITER || 'random',
    translationKey: env.TRANSLATION || 'bengali',
    maxDurationSec: env.MAX_DURATION_SEC ? Number(env.MAX_DURATION_SEC) : 85,
    quality: (env.QUALITY as '480p' | '720p' | '1080p') || '1080p',
    extraHashtags: env.EXTRA_HASHTAGS ? env.EXTRA_HASHTAGS.split(',') : undefined,
  })

  summary(`## Daily reel — ${video.dateKey}`)
  summary(
    `Surah ${video.surah.number} ${video.surah.name}, ayat ${video.fromAyat}-${video.toAyat} · ` +
      `${video.reciter.name} · ${(video.durationMs / 1000).toFixed(1)}s`,
  )
  summary(`**Title:** ${video.meta.title}\n`)

  const outDir = join(process.cwd(), 'out')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, `daily-${video.dateKey}.mp4`)
  writeFileSync(join(outDir, `daily-${video.dateKey}.json`), JSON.stringify(video, null, 2))

  await render(video.props, outPath)
  const buf = readFileSync(outPath)
  console.log(`Rendered ${outPath} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`)

  if (env.DRY_RUN === '1' || env.DRY_RUN === 'true') {
    summary('Dry run — not posting.')
    return
  }

  const cfg = loadSocialConfig(env)
  const input: UploadInput = { video: buf, meta: video.meta }
  const uploaders: Record<Platform, (() => Promise<UploadResult>) | null> = {
    youtube: cfg.youtube && (() => uploadToYouTube(cfg.youtube!, input)),
    facebook: cfg.facebook && (() => uploadToFacebookReels(cfg.facebook!, input)),
    instagram: cfg.instagram && (() => uploadToInstagramReels(cfg.instagram!, input)),
    tiktok: cfg.tiktok && (() => uploadToTikTok(cfg.tiktok!, input)),
  }

  // One platform failing must not stop the others.
  const failures: string[] = []
  summary('| Platform | Result |\n|---|---|')
  for (const platform of parsePlatforms(env.PLATFORMS)) {
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
  console.error('Daily reel failed:', err)
  process.exit(1)
})
