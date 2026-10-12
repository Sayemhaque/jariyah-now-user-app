import { X } from 'lucide-react'
import { Drawer } from 'vaul'

interface SettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function SettingsDrawer({ open, onOpenChange, children }: SettingsDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 outline-none">
          <div className="relative bg-card rounded-t-2xl border-t border-border shadow-2xl">
            <Drawer.Handle className="!bg-primary/25" />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="overflow-y-auto max-h-[85vh] p-4 scrollbar-thin">{children}</div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
