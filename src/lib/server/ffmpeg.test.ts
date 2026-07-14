import { describe, expect, it, vi } from 'vitest'
import { EventEmitter } from 'node:events'

import {
  mapFfmpegProgressLineToRatio,
  parseFfmpegTimestampToSeconds,
  runFfmpeg,
} from './ffmpeg'

vi.mock('node:child_process', () => ({ spawn: vi.fn() }))

import { spawn } from 'node:child_process'

function mockProcess() {
  const stdout = new EventEmitter() as EventEmitter & { readable: boolean }
  stdout.readable = true
  const stderr = new EventEmitter() as EventEmitter & { readable: boolean }
  stderr.readable = true
  const proc = new EventEmitter() as EventEmitter & {
    stdout: EventEmitter
    stderr: EventEmitter
  }
  proc.stdout = stdout
  proc.stderr = stderr
  return proc
}

describe('parseFfmpegTimestampToSeconds', () => {
  it('parses ffmpeg hh:mm:ss timestamps', () => {
    expect(parseFfmpegTimestampToSeconds('00:00:12.500')).toBe(12.5)
  })

  it('returns null for invalid timestamps', () => {
    expect(parseFfmpegTimestampToSeconds('nope')).toBeNull()
  })
})

describe('mapFfmpegProgressLineToRatio', () => {
  it('maps out_time lines into a 0..1 ratio', () => {
    expect(mapFfmpegProgressLineToRatio('out_time=00:00:05.000', 10)).toBe(0.5)
  })

  it('maps out_time_ms lines into a 0..1 ratio', () => {
    expect(mapFfmpegProgressLineToRatio('out_time_ms=5000000', 10)).toBe(0.5)
  })

  it('maps out_time_us lines into a 0..1 ratio', () => {
    expect(mapFfmpegProgressLineToRatio('out_time_us=5000000', 10)).toBe(0.5)
  })

  it('returns 0 for zero out_time_us', () => {
    expect(mapFfmpegProgressLineToRatio('out_time_us=0', 10)).toBe(0)
  })

  it('caps ratio at 1 for out_time_us exceeding duration', () => {
    expect(mapFfmpegProgressLineToRatio('out_time_us=20000000000', 10)).toBe(1)
  })

  it('returns null for negative out_time_us', () => {
    expect(mapFfmpegProgressLineToRatio('out_time_us=-1', 10)).toBeNull()
  })

  it('returns null for NaN out_time_us', () => {
    expect(mapFfmpegProgressLineToRatio('out_time_us=notanumber', 10)).toBeNull()
  })

  it('ignores unrelated progress lines', () => {
    expect(mapFfmpegProgressLineToRatio('speed=1.0x', 10)).toBeNull()
  })

  it('returns null for out_time with invalid timestamp', () => {
    expect(mapFfmpegProgressLineToRatio('out_time=notime', 10)).toBeNull()
  })

  it('returns null when durationSec is zero or negative', () => {
    expect(mapFfmpegProgressLineToRatio('out_time=00:00:05.000', 0)).toBeNull()
    expect(mapFfmpegProgressLineToRatio('out_time=00:00:05.000', -1)).toBeNull()
    expect(mapFfmpegProgressLineToRatio('out_time_ms=5000000', 0)).toBeNull()
    expect(mapFfmpegProgressLineToRatio('out_time_us=5000000000', 0)).toBeNull()
  })

  it('returns null for invalid out_time_ms', () => {
    expect(mapFfmpegProgressLineToRatio('out_time_ms=invalid', 10)).toBeNull()
    expect(mapFfmpegProgressLineToRatio('out_time_ms=-1000000', 10)).toBeNull()
  })
})

describe('runFfmpeg', () => {
  it('resolves with code 0 and stderr on success', async () => {
    const proc = mockProcess()
    vi.mocked(spawn).mockReturnValue(proc as any)

    const promise = runFfmpeg(['-i', 'in.mp4', 'out.mp4'])
    proc.stderr.emit('data', Buffer.from('encoded 100 frames'))
    proc.emit('close', 0)

    const result = await promise
    expect(result.code).toBe(0)
    expect(result.stderr).toContain('encoded 100 frames')
  })

  it('resolves with non-zero exit code', async () => {
    const proc = mockProcess()
    vi.mocked(spawn).mockReturnValue(proc as any)

    const promise = runFfmpeg(['-i', 'bad.mp4'])
    proc.emit('close', 1)

    const result = await promise
    expect(result.code).toBe(1)
  })

  it('rejects on spawn error', async () => {
    const proc = mockProcess()
    vi.mocked(spawn).mockReturnValue(proc as any)

    const promise = runFfmpeg(['-invalid'])
    proc.emit('error', new Error('ENOENT'))

    await expect(promise).rejects.toThrow('ENOENT')
  })

  it('calls onProgress with ratio for out_time lines', async () => {
    const proc = mockProcess()
    vi.mocked(spawn).mockReturnValue(proc as any)
    const onProgress = vi.fn()

    const promise = runFfmpeg(['-i', 'in.mp4'], {
      durationSec: 10,
      onProgress,
    })
    proc.stderr.emit('data', Buffer.from('out_time=00:00:05.000\n'))
    proc.emit('close', 0)

    await promise
    expect(onProgress).toHaveBeenCalledWith(0.5)
  })

  it('calls onProgress with ratio for out_time_ms lines', async () => {
    const proc = mockProcess()
    vi.mocked(spawn).mockReturnValue(proc as any)
    const onProgress = vi.fn()

    const promise = runFfmpeg(['-i', 'in.mp4'], {
      durationSec: 10,
      onProgress,
    })
    proc.stderr.emit('data', Buffer.from('out_time_ms=7500000\n'))
    proc.emit('close', 0)

    await promise
    expect(onProgress).toHaveBeenCalledWith(0.75)
  })

  it('calls onProgress with final ratio from leftover stderr buffer on close', async () => {
    const proc = mockProcess()
    vi.mocked(spawn).mockReturnValue(proc as any)
    const onProgress = vi.fn()

    const promise = runFfmpeg(['-i', 'in.mp4'], {
      durationSec: 10,
      onProgress,
    })
    proc.stderr.emit('data', Buffer.from('out_time=00:00:03.000'))
    proc.emit('close', 0)

    await promise
    expect(onProgress).toHaveBeenCalledWith(0.3)
  })

  it('does not call onProgress when durationSec is not set', async () => {
    const proc = mockProcess()
    vi.mocked(spawn).mockReturnValue(proc as any)
    const onProgress = vi.fn()

    const promise = runFfmpeg(['-i', 'in.mp4'], { onProgress })
    proc.stderr.emit('data', Buffer.from('out_time=00:00:05.000\n'))
    proc.emit('close', 0)

    await promise
    expect(onProgress).not.toHaveBeenCalled()
  })

  it('handles null exit code with nullish coalescing', async () => {
    const proc = mockProcess()
    vi.mocked(spawn).mockReturnValue(proc as any)

    const promise = runFfmpeg(['-i', 'in.mp4'])
    proc.emit('close', null)

    const result = await promise
    expect(result.code).toBe(-1)
  })

  it('handles progress mixed with non-progress stderr lines', async () => {
    const proc = mockProcess()
    vi.mocked(spawn).mockReturnValue(proc as any)
    const onProgress = vi.fn()

    const promise = runFfmpeg(['-i', 'in.mp4'], {
      durationSec: 10,
      onProgress,
    })
    proc.stderr.emit(
      'data',
      Buffer.from('frame=  100 fps=25\nout_time=00:00:05.000\nspeed=1.0x\n'),
    )
    proc.emit('close', 0)

    await promise
    expect(onProgress).toHaveBeenCalledTimes(1)
    expect(onProgress).toHaveBeenCalledWith(0.5)
  })
})
