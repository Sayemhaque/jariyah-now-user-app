import { cn } from '@/lib/utils'

interface FadeLayerProps {
  visible: boolean
  className: string
  children: React.ReactNode
}

export function FadeLayer({ visible, className, children }: FadeLayerProps) {
  return (
    <div
      className={cn(
        'absolute transition-opacity duration-300 pointer-events-none',
        visible ? 'opacity-100' : 'opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
