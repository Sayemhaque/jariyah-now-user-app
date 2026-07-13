import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  getBackgroundPresetByKey,
  getEffectiveBackgroundUrl,
  isExportSafeBackgroundVideo,
} from '@/lib/backgroundPresets'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'
import { updateRenderJob } from '@/lib/jobStore'
import { logger } from '@/lib/logger'
import type { RenderBody } from '@/lib/schemas'
import { runFfmpeg } from '@/lib/server/ffmpeg'
import { renderAyatOverlayPng } from '@/lib/server/overlay'

const OUTPUT_SIZE = {
  portrait: { width: 720, height: 1280 },
  landscape: { width: 1280, height: 720 },
} as const

interface RenderStagePaths {
  workspacePath: string
  normalizedBackgroundPath: string
  concatenatedAudioPath: string
  finalOutputPath: string
  overlaysDir: string
  audioDir: string
}

function clampProgress(progress: number): number {
  return Math.max(0, Math.min(1, progress))
}

function updateJobProgress(
  jobId: string,
  progress: number,
  patch: Record<string, unknown> = {},
) {
  updateRenderJob(jobId, {
    status: 'rendering',
    progress: clampProgress(progress),
    ...patch,
  })
}

function toPublicAssetPath(assetUrl: string): string {
  return path.join(process.cwd(), 'public', assetUrl.replace(/^\//, ''))
}

function getRenderPaths(jobId: string): RenderStagePaths {
  const workspacePath = path.join(os.tmpdir(), `jariyahnow-render-${jobId}`)
  return {
    workspacePath,
    normalizedBackgroundPath: path.join(workspacePath, 'background.mp4'),
    concatenatedAudioPath: path.join(workspacePath, 'audio.m4a'),
    finalOutputPath: path.join(workspacePath, 'final.mp4'),
    overlaysDir: path.join(workspacePath, 'overlays'),
    audioDir: path.join(workspacePath, 'audio'),
  }
}

function getTotalDurationSec(slides: RenderBody['slides']): number {
  const ms = slides.reduce((sum, slide) => sum + Math.max(0, slide.audioDurationMs || 0), 0)
  return Math.max(0.25, ms / 1000)
}

async function ensureWorkspace(paths: RenderStagePaths) {
  await fs.mkdir(paths.workspacePath, { recursive: true })
  await fs.mkdir(paths.audioDir, { recursive: true })
  await fs.mkdir(paths.overlaysDir, { recursive: true })
}

function zeroPad(index: number): string {
  return String(index).padStart(3, '0')
}

async function downloadAyatAudio(
  body: RenderBody,
  paths: RenderStagePaths,
  jobId: string,
): Promise<string[]> {
  const audioPaths: string[] = []
  for (let i = 0; i < body.slides.length; i++) {
    const slide = body.slides[i]!
    const response = await fetchWithTimeout(slide.audioUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch audio for ayat ${slide.surahNumber}:${slide.ayatNumber}`)
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    const audioPath = path.join(paths.audioDir, `${zeroPad(i + 1)}.mp3`)
    await fs.writeFile(audioPath, buffer)
    audioPaths.push(audioPath)
    updateJobProgress(jobId, 0.03 + ((i + 1) / body.slides.length) * 0.12)
  }
  return audioPaths
}

async function concatenateAudio(
  audioPaths: string[],
  outputPath: string,
  totalDurationSec: number,
  jobId: string,
): Promise<void> {
  const concatFile = path.join(path.dirname(outputPath), 'audio-concat.txt')
  const list = audioPaths
    .map((audioPath) => `file '${audioPath.replaceAll("'", "'\\''")}'`)
    .join('\n')
  await fs.writeFile(concatFile, list, 'utf8')

  const result = await runFfmpeg(
    [
      '-f', 'concat',
      '-safe', '0',
      '-i', concatFile,
      '-vn',
      '-c:a', 'aac',
      '-b:a', '160k',
      '-movflags', '+faststart',
      '-progress', 'pipe:2',
      '-y',
      outputPath,
    ],
    {
      durationSec: totalDurationSec,
      onProgress: (ratio) => updateJobProgress(jobId, 0.35 + ratio * 0.15),
    },
  )

  if (result.code !== 0) {
    throw new Error(`FFmpeg audio concat failed: ${result.stderr || 'unknown ffmpeg error'}`)
  }
}

function buildScaleCropFilter(width: number, height: number): string {
  return [
    `scale=${width}:${height}:force_original_aspect_ratio=increase`,
    `crop=${width}:${height}`,
    'fps=24',
    'format=yuv420p',
  ].join(',')
}

async function normalizeBackground(
  backgroundInputPath: string,
  outputPath: string,
  width: number,
  height: number,
  totalDurationSec: number,
  jobId: string,
): Promise<void> {
  const result = await runFfmpeg(
    [
      '-stream_loop', '-1',
      '-i', backgroundInputPath,
      '-an',
      '-vf', buildScaleCropFilter(width, height),
      '-t', totalDurationSec.toFixed(3),
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-progress', 'pipe:2',
      '-y',
      outputPath,
    ],
    {
      durationSec: totalDurationSec,
      onProgress: (ratio) => updateJobProgress(jobId, 0.15 + ratio * 0.2),
    },
  )

  if (result.code !== 0) {
    throw new Error(`FFmpeg background normalize failed: ${result.stderr || 'unknown ffmpeg error'}`)
  }
}

async function generateOverlays(
  body: RenderBody,
  paths: RenderStagePaths,
  jobId: string,
): Promise<string[]> {
  const { width, height } = OUTPUT_SIZE[body.orientation]
  const overlayPaths: string[] = []

  for (let i = 0; i < body.slides.length; i++) {
    const slide = body.slides[i]!
    const overlayPath = path.join(paths.overlaysDir, `${zeroPad(i + 1)}.png`)
    await renderAyatOverlayPng({
      slide,
      settings: body.settings,
      orientation: body.orientation,
      ayatIndex: i,
      totalAyats: body.slides.length,
      width,
      height,
      reciterName: body.reciterName,
      attributionLine: body.attributionLine,
      outputPath: overlayPath,
    })
    overlayPaths.push(overlayPath)
    updateJobProgress(jobId, 0.5 + ((i + 1) / body.slides.length) * 0.2)
  }

  return overlayPaths
}

export function buildFinalOverlayFilter(slides: RenderBody['slides']): string {
  let elapsedSec = 0
  let currentLabel = '[0:v]'
  const parts: string[] = []

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]!
    const endSec = elapsedSec + Math.max(0.01, slide.audioDurationMs / 1000)
    const outputLabel = i === slides.length - 1 ? '[vout]' : `[v${i + 1}]`
    const overlayInput = `[${i + 2}:v]`
    parts.push(
      `${currentLabel}${overlayInput}overlay=0:0:enable='between(t,${elapsedSec.toFixed(3)},${endSec.toFixed(3)})'${outputLabel}`,
    )
    currentLabel = outputLabel
    elapsedSec = endSec
  }

  return parts.join(';')
}

async function cleanupIntermediates(paths: RenderStagePaths) {
  const entries = await fs.readdir(paths.workspacePath)
  await Promise.all(
    entries
      .filter((entry) => entry !== path.basename(paths.finalOutputPath))
      .map((entry) => fs.rm(path.join(paths.workspacePath, entry), { recursive: true, force: true })),
  )
}

export async function renderQuranVideoJob(jobId: string, body: RenderBody): Promise<void> {
  const paths = getRenderPaths(jobId)
  const { width, height } = OUTPUT_SIZE[body.orientation]
  const totalDurationSec = getTotalDurationSec(body.slides)

  try {
    await ensureWorkspace(paths)
    updateRenderJob(jobId, {
      workspacePath: paths.workspacePath,
      outputPath: paths.finalOutputPath,
      status: 'rendering',
      progress: 0.01,
    })

    const effectiveBackgroundUrl = getEffectiveBackgroundUrl(
      body.settings.backgroundPreset,
      body.settings.backgroundImage,
      body.orientation,
    )
    if (!isExportSafeBackgroundVideo(body.settings.backgroundPreset, effectiveBackgroundUrl)) {
      throw new Error('This background video is not optimized for server rendering yet.')
    }

    const preset = getBackgroundPresetByKey(body.settings.backgroundPreset)
    if (!preset?.isVideo) {
      throw new Error('Server render currently supports Quran exports with preset video backgrounds only.')
    }

    const backgroundInputPath = toPublicAssetPath(effectiveBackgroundUrl)
    await fs.access(backgroundInputPath)

    updateJobProgress(jobId, 0.02)
    const audioPaths = await downloadAyatAudio(body, paths, jobId)
    await normalizeBackground(
      backgroundInputPath,
      paths.normalizedBackgroundPath,
      width,
      height,
      totalDurationSec,
      jobId,
    )
    await concatenateAudio(audioPaths, paths.concatenatedAudioPath, totalDurationSec, jobId)
    const overlayPaths = await generateOverlays(body, paths, jobId)

    const args = [
      '-i', paths.normalizedBackgroundPath,
      '-i', paths.concatenatedAudioPath,
      ...overlayPaths.flatMap((overlayPath) => ['-i', overlayPath]),
      '-filter_complex', buildFinalOverlayFilter(body.slides),
      '-map', '[vout]',
      '-map', '1:a:0',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '160k',
      '-movflags', '+faststart',
      '-shortest',
      '-progress', 'pipe:2',
      '-y',
      paths.finalOutputPath,
    ]

    const result = await runFfmpeg(args, {
      durationSec: totalDurationSec,
      onProgress: (ratio) => updateJobProgress(jobId, 0.7 + ratio * 0.3),
    })

    if (result.code !== 0) {
      throw new Error(`FFmpeg final encode failed: ${result.stderr || 'unknown ffmpeg error'}`)
    }

    await cleanupIntermediates(paths)
    updateRenderJob(jobId, {
      status: 'done',
      progress: 1,
      outputPath: paths.finalOutputPath,
      downloadUrl: `/api/render-download?jobId=${encodeURIComponent(jobId)}`,
    })
  } catch (error) {
    logger.error('server render failed', {
      jobId,
      error: error instanceof Error ? error.message : String(error),
    })
    await fs.rm(paths.workspacePath, { recursive: true, force: true }).catch(() => {})
    updateRenderJob(jobId, {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown render failure',
    })
  }
}
