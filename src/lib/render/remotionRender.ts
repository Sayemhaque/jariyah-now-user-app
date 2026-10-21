import { bundle } from '@remotion/bundler'
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer'
import { execFileSync } from 'node:child_process'
import { readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import type { CardProps } from '@/lib/cards/types'

const env = process.env

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

export async function renderCards(cards: CardProps[], outDir: string): Promise<Buffer[]> {
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

export async function renderVideo(props: object, outPath: string) {
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

export async function renderStillFrame(props: object, frame: number, output: string): Promise<void> {
  const serveUrl = await bundledServeUrl()
  const inputProps = props as Record<string, unknown>
  const browserExecutable = env.BROWSER_EXECUTABLE || null
  const composition = await selectComposition({ serveUrl, id: 'AyatVideo', inputProps, browserExecutable })
  await renderStill({ composition, serveUrl, inputProps, frame: Math.min(frame, composition.durationInFrames - 1), output, imageFormat: 'jpeg', jpegQuality: 88, scale: 0.5, browserExecutable })
}

export function extractCover(videoPath: string, atMs: number, outPath: string): Buffer {
  execFileSync(env.FFMPEG_BIN || 'ffmpeg', ['-v', 'error', '-y', '-ss', (atMs / 1000).toFixed(2), '-i', videoPath, '-frames:v', '1', '-q:v', '2', outPath])
  return readFileSync(outPath)
}

export function makeReelSafe(rawPath: string, outPath: string) {
  execFileSync(env.FFMPEG_BIN || 'ffmpeg', ['-v', 'error', '-y', '-i', rawPath, '-c', 'copy', '-use_editlist', '0', '-movflags', '+faststart', outPath])
  rmSync(rawPath)
}
