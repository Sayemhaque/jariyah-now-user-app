import type { StoryChapter } from '@/lib/content/home'

export function StoryChapterCard({ chapter, active }: { chapter: StoryChapter; active: boolean }) {
  const { icon: Icon } = chapter
  return (
    <li data-active={active} className="qv-story-chapter qv-card-premium rounded-3xl p-6 sm:p-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="qv-icon-chip h-12 w-12"><Icon className="h-6 w-6" /></span>
        <span className="text-sm font-semibold tracking-wide text-primary">{chapter.kicker}</span>
      </div>
      <h3 className="font-display mb-3 text-2xl font-bold sm:text-3xl">{chapter.title}</h3>
      <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{chapter.text}</p>
      {chapter.quote && <blockquote className="mt-5 border-l-4 border-amber-400 pl-4 text-base font-medium leading-relaxed">{chapter.quote}</blockquote>}
    </li>
  )
}
