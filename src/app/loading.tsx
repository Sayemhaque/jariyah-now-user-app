import { Loader2 } from 'lucide-react'

/**
 * Route-level loading state. Shown by Next.js while server components in
 * this segment are fetching data (the Surah list, in our case). Keeping
 * this at the route level means the user sees a meaningful skeleton
 * immediately instead of a blank page.
 */
export default function Loading() {
  return (
    <div className="min-h-screen grid place-items-center bg-background relative overflow-hidden">
      <div className="qv-ambient" aria-hidden />
      <div className="relative flex flex-col items-center gap-4 text-muted-foreground">
        <div className="relative">
          <div className="qv-processing-glow absolute inset-0 rounded-full bg-primary/25 blur-xl" aria-hidden />
          <div className="qv-processing-ring absolute -inset-1 rounded-full opacity-80" aria-hidden />
          <div className="relative grid place-items-center h-16 w-16 rounded-full bg-card shadow-lg border border-border">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        </div>
        <p className="text-sm font-medium">Loading Jariyah Now…</p>
      </div>
    </div>
  )
}
