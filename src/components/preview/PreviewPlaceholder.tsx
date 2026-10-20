import { Loader2, Sparkles } from 'lucide-react'
import { useBuilderStore } from '@/lib/store'

export function PreviewPlaceholder() {
  const loading = useBuilderStore((s) => s.loadingAyats)
  const error = useBuilderStore((s) => s.ayatError)

  return (
    <div className="absolute inset-0 grid place-items-center text-center text-white/70 px-6 bg-[#0a0f1a]">
      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm">আয়াত লোড হচ্ছে…</span>
        </div>
      ) : error ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-sm">
          <div className="grid place-items-center h-14 w-14 rounded-2xl bg-primary/10 ring-1 ring-primary/20 mx-auto">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-white/90">আপনার কুরআন ভিডিও এখানে দেখা যাবে</p>
            <p className="text-xs text-white/55 leading-relaxed">
              সূরা, আয়াত ও কারী বেছে নিন, তারপর{' '}
              <span className="text-primary font-medium">আয়াত লোড করুন</span> চাপুন। এখানে প্রিভিউ দেখতে পাবেন।
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
