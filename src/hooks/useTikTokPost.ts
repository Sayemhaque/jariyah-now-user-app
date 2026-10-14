import { useEffect, useRef, useState } from 'react'
import { fetchTikTokStatus, startTikTokPost } from '@/lib/tiktok/client'
import { emptyPostForm, isPrivacyAllowed, postBlockers, type CreatorInfo, type TikTokPostForm } from '@/lib/tiktok/rules'

export type PostPhase = 'editing' | 'posting' | 'processing' | 'published' | 'failed'

const pollEveryMs = 5000
const maxPolls = 60
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function normalized(next: TikTokPostForm): TikTokPostForm {
  const form = next.commercial ? next : { ...next, yourBrand: false, brandedContent: false }
  return form.privacyLevel && !isPrivacyAllowed(form, form.privacyLevel) ? { ...form, privacyLevel: null } : form
}

export function useTikTokPost(jobId: string, creator: CreatorInfo, durationSec: number, defaultTitle: string) {
  const [form, setForm] = useState<TikTokPostForm>({ ...emptyPostForm, title: defaultTitle })
  const [phase, setPhase] = useState<PostPhase>('editing')
  const [message, setMessage] = useState<string | null>(null)
  const alive = useRef(true)
  useEffect(() => () => void (alive.current = false), [])

  const update = (patch: Partial<TikTokPostForm>) => setForm((current) => normalized({ ...current, ...patch }))
  const blockers = postBlockers(form, creator, durationSec)

  const follow = async (publishId: string) => {
    for (let i = 0; i < maxPolls && alive.current; i++) {
      await wait(pollEveryMs)
      const { status, failReason } = await fetchTikTokStatus(publishId).catch(() => ({ status: 'PROCESSING', failReason: null }))
      if (status === 'PUBLISH_COMPLETE') return setPhase('published')
      if (status === 'FAILED') {
        setMessage(failReason ?? 'TikTok could not publish this video.')
        return setPhase('failed')
      }
    }
  }

  const submit = async () => {
    if (blockers.length) return
    setPhase('posting')
    setMessage(null)
    try {
      const publishId = await startTikTokPost(jobId, form)
      setPhase('processing')
      await follow(publishId)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'TikTok could not publish this video.')
      setPhase('failed')
    }
  }

  return { form, update, blockers, phase, message, submit, retry: () => setPhase('editing') }
}
