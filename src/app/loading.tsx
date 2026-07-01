import { Loader2 } from 'lucide-react'

/**
 * Route-level loading state. Shown by Next.js while server components in
 * this segment are fetching data (the Surah list, in our case). Keeping
 * this at the route level means the user sees a meaningful skeleton
 * immediately instead of a blank page.
 */
export default function Loading() {
  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm">Loading QuranVid…</p>
      </div>
    </div>
  )
}
