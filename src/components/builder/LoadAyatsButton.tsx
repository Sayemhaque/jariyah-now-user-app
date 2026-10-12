import { Download, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { useAyatLoader } from '@/hooks/useAyatLoader'

export function LoadAyatsButton({ loader }: { loader: ReturnType<typeof useAyatLoader> }) {
  const { loadAyats, isFetching, hasAyats, canLoad } = loader
  const [Icon, label] = isFetching
    ? [Loader2, 'Loading ayats…']
    : hasAyats
      ? [RefreshCw, 'Reload ayats']
      : [Download, 'Load ayats']

  return (
    <Button onClick={loadAyats} disabled={isFetching || !canLoad} className="w-full font-semibold" size="default">
      <Icon className={isFetching ? 'h-4 w-4 mr-1.5 animate-spin' : 'h-4 w-4 mr-1.5'} />
      {label}
    </Button>
  )
}
