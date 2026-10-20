'use client'

import { LazyRippleScene } from '@/components/three/lazyScenes'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { storyChapters } from '@/lib/content/home'
import { SectionHeader } from './SectionHeader'
import { StoryChapterCard } from './StoryChapterCard'

export function StorySection() {
  const { ref, progress, step } = useScrollProgress(storyChapters.length)
  return (
    <section ref={ref} id="story" className="relative px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeader centered className="mb-12" title="একটি শেয়ারের গল্প" subtitle="কীভাবে একটি ছোট পোস্ট হয়ে ওঠে সদকায়ে জারিয়া — নিচে স্ক্রল করে দেখুন" />
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="sticky top-16 z-20 h-[42vh] self-start overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-white via-primary/5 to-amber-50 shadow-xl sm:h-[52vh] lg:top-24 lg:h-[70vh]">
            <LazyRippleScene progress={progress} className="absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-primary/10">
              <div className="h-full origin-left bg-gradient-to-r from-primary to-amber-400" style={{ transform: 'scaleX(var(--story-progress, 0))' }} />
            </div>
          </div>
          <ol className="relative z-0 space-y-[22vh] pb-[12vh] lg:space-y-[34vh] lg:py-[14vh]">
            {storyChapters.map((chapter, i) => (
              <StoryChapterCard key={chapter.title} chapter={chapter} active={i === step} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
