import { cn } from '@/lib/utils'

const sizes = {
  large: 'h-14 w-14 sm:h-16 sm:w-16 bg-white/15 hover:bg-white/25',
  small: 'h-9 w-9 sm:h-10 sm:w-10 bg-white/10 hover:bg-white/20 disabled:opacity-30',
}

interface GlassButtonProps {
  size: keyof typeof sizes
  onPress: () => void
  disabled?: boolean
  children: React.ReactNode
}

export function GlassButton({ size, onPress, disabled, children }: GlassButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onPress()
      }}
      className={cn(
        'rounded-full backdrop-blur-md flex items-center justify-center text-white transition-colors pointer-events-auto',
        sizes[size],
      )}
    >
      {children}
    </button>
  )
}
