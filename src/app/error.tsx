'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Route-level error boundary. Catches any uncaught error thrown during
 * render or server-component data fetching for the segment below.
 *
 * This is the "last resort" UI — component-level errors should be caught
 * closer to the source with try/catch + a local fallback. This catches the
 * things that slip through.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // In production, this is where we'd ship the error to Sentry / Datadog.
    // For now, log it to the structured logger so it shows up in dev.
    console.error('[error-boundary]', error)
  }, [error])

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-background">
      <div className="max-w-md w-full rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-lg bg-destructive/15 text-destructive shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              Something went wrong
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              An unexpected error occurred while rendering this page. Try
              again — if it keeps happening, refresh the tab.
            </p>
          </div>
        </div>
        {error.digest && (
          <p className="text-[10px] font-mono text-muted-foreground/60 break-all">
            ref: {error.digest}
          </p>
        )}
        <Button onClick={reset} className="w-full" size="sm">
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Try again
        </Button>
      </div>
    </div>
  )
}
