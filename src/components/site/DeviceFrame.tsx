import Image from 'next/image'

interface DeviceFrameProps {
  device: 'desktop' | 'mobile'
}

export function DeviceFrame({ device }: DeviceFrameProps) {
  if (device === 'mobile') {
    return (
      <div className="rounded-[2rem] border-[6px] border-foreground/85 bg-foreground/85 p-1 shadow-2xl">
        <div className="rounded-[1.5rem] overflow-hidden bg-background">
          <Image src="/landing/app-mobile.png" alt="Jariyah Now app — mobile view" width={390} height={844} sizes="200px" className="w-full h-auto block" />
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden ring-1 ring-primary/5">
      <div className="flex items-center gap-2 px-4 h-11 border-b border-border bg-gradient-to-b from-muted/80 to-muted/40">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-destructive/40" />
          <div className="h-3 w-3 rounded-full bg-amber-500/40" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/40" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3.5 py-1 rounded-full bg-card border border-border text-[10px] text-muted-foreground font-mono shadow-sm">
            jariyahnow.com/app
          </div>
        </div>
      </div>
      <Image
        src="/landing/app-desktop.png"
        alt="Jariyah Now app — desktop view"
        width={1440}
        height={900}
        sizes="(max-width: 1024px) 100vw, 960px"
        className="w-full h-auto block"
      />
    </div>
  )
}
