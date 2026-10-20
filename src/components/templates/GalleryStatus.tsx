import { Loader2 } from 'lucide-react'

export function GalleryStatus({ isLoading, failed, empty }: { isLoading: boolean; failed: boolean; empty: boolean }) {
  if (isLoading) return <Loader2 className="mx-auto my-12 h-6 w-6 animate-spin text-primary" />
  if (failed) return <p className="py-12 text-center text-sm text-muted-foreground">এই মুহূর্তে হাদিস আনা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।</p>
  if (empty) return <p className="py-12 text-center text-sm text-muted-foreground">এই অধ্যায়ে ছোট সহিহ হাদিস নেই — অন্য একটি অধ্যায় বেছে নিন।</p>
  return null
}
