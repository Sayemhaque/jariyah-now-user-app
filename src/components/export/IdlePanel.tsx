import { Film } from 'lucide-react'

export function IdlePanel() {
  return (
    <div className="qv-card rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[280px] gap-3">
      <div className="grid place-items-center h-14 w-14 rounded-2xl bg-primary/10 text-primary">
        <Film className="h-7 w-7" />
      </div>
      <div>
        <p className="font-medium text-sm">ভিডিও তৈরির জন্য প্রস্তুত</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[240px]">
          মান বেছে নিন, তারপর <span className="font-medium text-foreground">ভিডিও তৈরি করুন</span>{' '}
          বোতামে চাপুন।
        </p>
      </div>
    </div>
  )
}
