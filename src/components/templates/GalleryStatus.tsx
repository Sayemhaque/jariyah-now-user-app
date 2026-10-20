import { Loader2 } from 'lucide-react'

export function GalleryStatus({ isLoading, failed, empty }: { isLoading: boolean; failed: boolean; empty: boolean }) {
  if (isLoading) return <Loader2 className="mx-auto my-12 h-6 w-6 animate-spin text-primary" />
  if (failed) return <p className="py-12 text-center text-sm text-muted-foreground">Could not load hadith right now. Please try again in a moment.</p>
  if (empty) return <p className="py-12 text-center text-sm text-muted-foreground">No short authentic hadith in this chapter — try another chapter.</p>
  return null
}
