import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import { getAdvanceAtMs } from '@/lib/advanceTiming'
import { logger } from '@/lib/logger'
import { runFfmpeg } from '@/lib/server/ffmpeg'

let cachedServeUrl: string | null = null

async function getServeUrl(): Promise<string> {
  if (cachedServeUrl) return cachedServeUrl
  const remotionBundle = await import('@remotion/bundler')
  const entryPoint = path.resolve(process.cwd(), 'src/remotion/Root.tsx')
  const webpackOverride = (config: Record<string, unknown>) => ({
    ...config,
    resolve: {
      ...(config.resolve as Record<string, unknown>),
      alias: {
        ...((config.resolve as Record<string, unknown>)?.alias as Record<string, string>),
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
  })
  // @ts-expect-error — bundle() accepts (entryPoint, onProgress?, options?) or a single options object depending on version
  cachedServeUrl = await remotionBundle.bundle(entryPoint, undefined, { webpackOverride })
  return cachedServeUrl
}

function computeTotalFrames(
  slides: { audioDurationMs: number; audioPauses?: { start: number; end: number; duration: number }[] }[],
  fps: number,
): number {
  return slides.reduce((sum, s) => {
    const advanceMs = getAdvanceAtMs(s, s.audioDurationMs)
    return sum + Math.round(advanceMs / 1000 * fps)
  }, 0)
}

async function probeVideoDuration(filePath: string): Promise<number | null> {
  return new Promise((resolve) => {
    const proc = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'csv=p=0',
      filePath,
    ])
    let output = ''
    proc.stdout.on('data', (chunk: Buffer) => { output += chunk.toString() })
    proc.on('close', (code) => {
      if (code !== 0) { resolve(null); return }
      const sec = Number(output.trim())
      resolve(Number.isFinite(sec) ? sec : null)
    })
    proc.on('error', () => resolve(null))
  })
}

async function isVideoNormalized(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn('ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=codec_name,pix_fmt,width,height,r_frame_rate',
      '-of', 'csv=p=0',
      filePath,
    ])
    let output = ''
    proc.stdout.on('data', (chunk: Buffer) => { output += chunk.toString() })
    proc.on('close', (code) => {
      if (code !== 0) { resolve(false); return }
      const parts = output.trim().split(',')
      if (parts.length < 5) { resolve(false); return }
      const [codec, pixFmt, widthStr, heightStr, frameRateStr] = parts.map((s) => s.trim())
      const width = Number(widthStr)
      const height = Number(heightStr)
      const fpsMatch = /^(\d+)/.exec(frameRateStr)
      const fps = fpsMatch ? Number(fpsMatch[1]) : 0
      const is1080p = (width === 1080 && height === 1920) || (width === 1920 && height === 1080)
      resolve(codec === 'h264' && pixFmt === 'yuv420p' && is1080p && fps === 30)
    })
    proc.on('error', () => resolve(false))
  })
}

async function syncLoopBackgroundVideo(
  sourceUrl: string,
  totalDurationSec: number,
  outputPath: string,
): Promise<{ path: string; looped: boolean }> {
  const sourcePath = path.join(process.cwd(), 'public', sourceUrl.replace(/^\//, ''))

  const sourceDurationSec = await probeVideoDuration(sourcePath)
  if (sourceDurationSec == null) {
    logger.warn('could not probe background video duration, skipping pre-loop', { sourceUrl })
    return { path: sourceUrl, looped: false }
  }

  if (sourceDurationSec >= totalDurationSec) {
    logger.info('background video already covers full duration, no pre-loop needed', {
      sourceDurationSec,
      totalDurationSec,
    })
    return { path: sourceUrl, looped: false }
  }

  const loopCount = Math.ceil(totalDurationSec / sourceDurationSec)
  logger.info('pre-looping background video', { sourceUrl, sourceDurationSec, totalDurationSec, loopCount })

  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  const normalized = await isVideoNormalized(sourcePath)
  if (normalized) {
    logger.info('source is normalized, using stream copy', { sourceUrl })
    await runFfmpeg([
      '-stream_loop', '-1',
      '-i', sourcePath,
      '-t', totalDurationSec.toFixed(3),
      '-c', 'copy',
      '-an',
      '-y', outputPath,
    ])
  } else {
    logger.info('source is not normalized, re-encoding with keyframe alignment', { sourceUrl })
    await runFfmpeg([
      '-stream_loop', '-1',
      '-i', sourcePath,
      '-t', totalDurationSec.toFixed(3),
      '-c:v', 'libx264', '-preset', 'veryfast',
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      '-g', '30', '-keyint_min', '30', '-sc_threshold', '0',
      '-an',
      '-y', outputPath,
    ], { durationSec: totalDurationSec })
  }

  const stats = await fs.stat(outputPath)
  logger.info('pre-loop complete', { outputPath, sizeBytes: stats.size, loopCount })
  return { path: outputPath, looped: true }
}

export async function renderWithRemotion(
  inputProps: Record<string, unknown>,
  outputPath: string,
  onProgress: (progress: number) => void,
): Promise<void> {
  const slides = inputProps.slides as
    | { audioDurationMs: number; audioPauses?: { start: number; end: number; duration: number }[] }[]
    | undefined

  if (!slides || slides.length === 0) {
    throw new Error('renderWithRemotion: inputProps.slides is empty or missing')
  }

  const fps = 30
  const totalFrames = computeTotalFrames(slides, fps)
  const concurrency = Math.max(1, os.cpus().length - 1)

  let preLooped = false
  const settings = inputProps.settings as Record<string, string> | undefined
  const backgroundImage = settings?.backgroundImage
  if (backgroundImage && backgroundImage.endsWith('.mp4')) {
    const totalSec = totalFrames / fps
    const loopedOutput = path.join(path.dirname(outputPath), 'bg_looped.mp4')
    const result = await syncLoopBackgroundVideo(backgroundImage, totalSec, loopedOutput)
    if (result.looped) {
      ;(inputProps.settings as Record<string, unknown>).backgroundImage = result.path
      preLooped = true
    }
  }

  inputProps.preLooped = preLooped

  logger.info('remotion render starting', {
    slides: slides.length,
    totalFrames,
    fps,
    concurrency,
    outputPath,
    preLooped,
  })

  const serveUrl = await getServeUrl()

  const { getCompositions, renderMedia } = await import('@remotion/renderer')

  const compositions = await getCompositions(serveUrl, {
    inputProps: { ...inputProps, isExport: true } as Record<string, unknown>,
  })
  const composition = compositions.find((c) => c.id === 'AyatVideo')
  if (!composition) {
    throw new Error('AyatVideo composition not found in Remotion bundle')
  }

  composition.durationInFrames = totalFrames
  composition.fps = fps

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps: { ...inputProps, isExport: true } as Record<string, unknown>,
    concurrency,
    chromiumOptions: {
      gl: null as unknown as undefined,
      disableWebSecurity: false,
    },
    onProgress: ({ progress }: { progress: number }) => onProgress(progress),
  })

  logger.info('remotion render complete', { outputPath })
}
