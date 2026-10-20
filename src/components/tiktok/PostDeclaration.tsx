import { brandedContentUrl, musicUsageUrl, needsBrandedContentPolicy, type TikTokPostForm } from '@/lib/tiktok/rules'

const linkClass = 'font-medium text-primary underline-offset-2 hover:underline'

export function PostDeclaration({ form }: { form: TikTokPostForm }) {
  return (
    <p className="text-xs text-muted-foreground">
      পোস্ট করলে আপনি TikTok-এর{' '}
      {needsBrandedContentPolicy(form) && (
        <>
          <a href={brandedContentUrl} target="_blank" rel="noreferrer" className={linkClass}>ব্র্যান্ডেড কনটেন্ট নীতি</a> এবং{' '}
        </>
      )}
      <a href={musicUsageUrl} target="_blank" rel="noreferrer" className={linkClass}>মিউজিক ব্যবহারের শর্তে</a> সম্মতি দিচ্ছেন।
    </p>
  )
}
