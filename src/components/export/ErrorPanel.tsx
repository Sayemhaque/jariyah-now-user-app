import { AlertCircle } from 'lucide-react'

export function ErrorPanel({ message }: { message: string | null }) {
  return (
    <div className="qv-card rounded-xl p-5 min-h-[280px] flex flex-col justify-center">
      <div className="flex items-start gap-3 text-sm text-destructive">
        <AlertCircle className="h-6 w-6 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium">Processing failed</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  )
}
