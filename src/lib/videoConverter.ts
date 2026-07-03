import { FFmpeg } from '@ffmpeg/ffmpeg'

/**
 * Client-side WebM → MP4 converter using ffmpeg.wasm.
 *
 * After the Canvas + MediaRecorder pipeline produces a WebM blob, this module
 * transcodes it to MP4 (H.264 video + AAC audio) so the output works on
 * Instagram, Facebook, YouTube, and every other platform that requires MP4.
 *
 * The ffmpeg WASM core (~25MB) is loaded lazily on first use from /public/ffmpeg/.
 * COOP + COEP headers are required for SharedArrayBuffer.
 */

let ffmpegInstance: FFmpeg | null = null
let ffmpegLoadPromise: Promise<FFmpeg> | null = null

/**
 * Fetch a local file and create a blob URL from it.
 * This avoids the cross-origin issues that toBlobURL has with COEP.
 */
async function localToBlobURL(url: string, mimeType: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  const blob = new Blob([await response.arrayBuffer()], { type: mimeType })
  return URL.createObjectURL(blob)
}

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegInstance.loaded) return ffmpegInstance
  if (ffmpegLoadPromise) return ffmpegLoadPromise

  ffmpegLoadPromise = (async () => {
    const ffmpeg = new FFmpeg()
    // Load the core from our local /public/ffmpeg/ directory.
    // We create blob URLs manually to avoid COEP cross-origin issues.
    const coreURL = await localToBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript')
    const wasmURL = await localToBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm')
    await ffmpeg.load({ coreURL, wasmURL })
    ffmpegInstance = ffmpeg
    return ffmpeg
  })()

  return ffmpegLoadPromise
}

/**
 * Check if SharedArrayBuffer is available (required by ffmpeg.wasm).
 */
export function canConvertToMp4(): boolean {
  return typeof SharedArrayBuffer !== 'undefined'
}

export interface ConvertOptions {
  onProgress?: (ratio: number) => void
}

/**
 * Convert a WebM blob to MP4 (H.264 + AAC).
 *
 * Returns the MP4 blob. If ffmpeg.wasm can't run, returns the original WebM.
 */
export async function webmToMp4(
  webmBlob: Blob,
  options?: ConvertOptions,
): Promise<Blob> {
  if (!canConvertToMp4()) {
    console.warn('[videoConverter] SharedArrayBuffer unavailable — returning original WebM')
    return webmBlob
  }

  const ffmpeg = await getFFmpeg()

  if (options?.onProgress) {
    ffmpeg.on('progress', ({ progress }: { progress: number }) => {
      options.onProgress!(Math.max(0, Math.min(1, progress)))
    })
  }

  const inputName = 'input.webm'
  const outputName = 'output.mp4'

  // Write the WebM blob directly as a Uint8Array — avoids fetchFile's
  // internal fetch() which can fail under COEP restrictions.
  const webmBuffer = await webmBlob.arrayBuffer()
  await ffmpeg.writeFile(inputName, new Uint8Array(webmBuffer))

  await ffmpeg.exec([
    '-i', inputName,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    outputName,
  ])

  const data = await ffmpeg.readFile(outputName)
  const mp4Blob = new Blob([data], { type: 'video/mp4' })

  await ffmpeg.deleteFile(inputName)
  await ffmpeg.deleteFile(outputName)

  return mp4Blob
}
