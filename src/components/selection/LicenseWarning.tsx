import { AlertTriangle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function LicenseWarning({ note }: { note: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-500/15 text-amber-500 shrink-0">
            <AlertTriangle className="h-3 w-3" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-popover">
          <p className="text-xs leading-relaxed">{note}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
