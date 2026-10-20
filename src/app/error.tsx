'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { captureException } from '@/lib/sentry'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureException(error, { digest: error.digest })
  }, [error])

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-background relative overflow-hidden">
      <div className="qv-ambient opacity-40" aria-hidden />
      <div className="relative max-w-md w-full rounded-2xl border border-destructive/25 bg-card shadow-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="grid place-items-center h-11 w-11 rounded-xl bg-destructive/12 text-destructive shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              কিছু একটা সমস্যা হয়েছে
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              পেজটি দেখাতে গিয়ে একটি সমস্যা হয়েছে। নিচের বোতাম চেপে আবার
              চেষ্টা করুন। বারবার হলে পেজটি রিফ্রেশ করুন।
            </p>
          </div>
        </div>
        {error.digest && (
          <p className="text-[10px] font-mono text-muted-foreground/60 break-all">
            কোড: {error.digest}
          </p>
        )}
        <Button onClick={reset} className="w-full" size="sm">
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          আবার চেষ্টা করুন
        </Button>
      </div>
    </div>
  )
}
