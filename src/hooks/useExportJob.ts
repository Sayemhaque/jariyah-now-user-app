import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { stageToPhase, type ProcessingPhase } from '@/lib/export/phases'
import { fetchRenderProgress, messageOf, pollIntervalMs, startRenderJob } from '@/lib/export/renderJob'

export type RenderStatus = 'idle' | 'processing' | 'done' | 'error'

interface JobState {
  status: RenderStatus
  progress: number
  phase: ProcessingPhase
  downloadUrl: string | null
  errorMessage: string | null
}

const idleJob: JobState = { status: 'idle', progress: 0, phase: 'composing', downloadUrl: null, errorMessage: null }

export function useExportJob(open: boolean) {
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [job, setJob] = useState<JobState>(idleJob)
  const [wasOpen, setWasOpen] = useState(open)
  if (wasOpen !== open) {
    setWasOpen(open)
    if (!open) setJob(idleJob)
  }

  const stopPolling = () => pollingRef.current && clearInterval(pollingRef.current)
  useEffect(() => {
    if (!open && pollingRef.current) clearInterval(pollingRef.current)
  }, [open])

  const fail = (error: unknown) => {
    stopPolling()
    setJob((current) => ({ ...current, status: 'error', errorMessage: messageOf(error) }))
    toast.error(messageOf(error))
  }

  const pollOnce = async (jobId: string) => {
    try {
      const data = await fetchRenderProgress(jobId)
      if (data.stage === 'done') {
        stopPolling()
        setJob((current) => ({ ...current, status: 'done', progress: 1, phase: 'finalizing', downloadUrl: data.url ?? null }))
        toast.success('Video ready as MP4!')
        return
      }
      const next = stageToPhase(data.stage, data.overallProgress ?? 0)
      if (next) setJob((current) => ({ ...current, ...next }))
    } catch (error) {
      fail(error)
    }
  }

  const start = async (body: object) => {
    setJob({ ...idleJob, status: 'processing', phase: 'uploading' })
    try {
      const jobId = await startRenderJob(body)
      pollingRef.current = setInterval(() => pollOnce(jobId), pollIntervalMs)
    } catch (error) {
      fail(error)
    }
  }

  return { ...job, start }
}
