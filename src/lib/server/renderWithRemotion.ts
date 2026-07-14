import path from 'node:path'
import os from 'node:os'
import { getAdvanceAtMs } from '@/lib/advanceTiming'
import { logger } from '@/lib/logger'

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

  inputProps.preLooped = false

  logger.info('remotion render starting', {
    slides: slides.length,
    totalFrames,
    fps,
    concurrency,
    outputPath,
    preLooped: false,
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
