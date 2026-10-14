import { brandedContentUrl, musicUsageUrl, needsBrandedContentPolicy, type TikTokPostForm } from '@/lib/tiktok/rules'

const linkClass = 'font-medium text-primary underline-offset-2 hover:underline'

export function PostDeclaration({ form }: { form: TikTokPostForm }) {
  return (
    <p className="text-xs text-muted-foreground">
      By posting, you agree to TikTok&apos;s{' '}
      {needsBrandedContentPolicy(form) && (
        <>
          <a href={brandedContentUrl} target="_blank" rel="noreferrer" className={linkClass}>Branded Content Policy</a> and{' '}
        </>
      )}
      <a href={musicUsageUrl} target="_blank" rel="noreferrer" className={linkClass}>Music Usage Confirmation</a>.
    </p>
  )
}
