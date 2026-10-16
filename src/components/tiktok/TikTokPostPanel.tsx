import { useTikTokPost } from '@/hooks/useTikTokPost'
import type { CreatorInfo } from '@/lib/tiktok/rules'
import { CaptionField } from './CaptionField'
import { CommercialDisclosure } from './CommercialDisclosure'
import { CreatorHeader } from './CreatorHeader'
import { InteractionToggles } from './InteractionToggles'
import { PostDeclaration } from './PostDeclaration'
import { PrivacySelect } from './PrivacySelect'
import { TikTokPostResult } from './TikTokPostResult'

interface TikTokPostPanelProps {
  jobId: string
  videoUrl: string
  creator: CreatorInfo
  durationSec: number
  defaultCaption: string
  onDisconnect: () => void
}

export function TikTokPostPanel({ jobId, videoUrl, creator, durationSec, defaultCaption, onDisconnect }: TikTokPostPanelProps) {
  const post = useTikTokPost(jobId, creator, durationSec, defaultCaption)
  const { form, update } = post
  const editing = post.phase === 'editing' || post.phase === 'posting'

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,220px)_1fr]">
      <video src={videoUrl} controls playsInline className="mx-auto aspect-[9/16] w-full max-w-[220px] rounded-xl bg-black object-contain" />
      <div className="space-y-4">
        <CreatorHeader creator={creator} onDisconnect={onDisconnect} />
        {!editing ? (
          <TikTokPostResult phase={post.phase} message={post.message} onRetry={post.retry} />
        ) : (
          <>
            <CaptionField value={form.title} onChange={(title) => update({ title })} />
            <PrivacySelect form={form} options={creator.privacyOptions} onChange={(privacyLevel) => update({ privacyLevel })} />
            <InteractionToggles form={form} creator={creator} onChange={update} />
            <CommercialDisclosure form={form} onChange={update} />
            <PostDeclaration form={form} />
            {post.blockers[0] && <p className="text-xs text-amber-600">{post.blockers[0]}</p>}
            <button
              type="button"
              disabled={post.blockers.length > 0 || post.phase === 'posting'}
              onClick={post.submit}
              className="qv-btn-primary inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {post.phase === 'posting' ? 'Posting…' : 'Post to TikTok'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
