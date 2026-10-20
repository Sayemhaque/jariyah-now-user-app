import { ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PosterPlaceholder({ isLoading, onSettingsClick }: { isLoading: boolean; onSettingsClick: () => void }) {
  if (isLoading) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div className="space-y-3">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-base text-muted-foreground">লোড হচ্ছে, একটু অপেক্ষা করুন…</p>
        </div>
      </div>
    )
  }
  return (
    <div className="grid h-full place-items-center p-6 text-center">
      <div className="max-w-sm space-y-4">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary"><ImagePlus className="h-8 w-8" /></div>
        <h2 className="text-xl font-semibold">আপনার পোস্টার এখানে দেখা যাবে</h2>
        <p className="text-base leading-relaxed text-muted-foreground">ডান পাশের প্যানেল থেকে একটি হাদিস, জিকির বা দোয়া বেছে নিন। পোস্টার সঙ্গে সঙ্গে এখানে তৈরি হয়ে যাবে।</p>
        <Button onClick={onSettingsClick} className="h-12 px-6 text-base lg:hidden">বেছে নিতে এখানে চাপুন</Button>
      </div>
    </div>
  )
}
