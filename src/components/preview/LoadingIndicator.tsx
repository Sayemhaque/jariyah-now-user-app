import { Loader2 } from 'lucide-react'

export function LoadingIndicator() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#0a0f1a]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
