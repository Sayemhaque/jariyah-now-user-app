import { Users } from 'lucide-react'
import { audiences } from '@/lib/content/home'
import { PageSection } from './PageSection'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

export function AudienceSection() {
  return (
    <PageSection className="py-16 sm:py-24">
      <SectionHeader className="mb-12" pillIcon={Users} pillLabel="সবার জন্য" title="কারা ব্যবহার করছেন Jariyah Now" subtitle="যে কেউ, যেকোনো বয়সে — কয়েকটি চাপেই" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {audiences.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delayMs={i * 110} className="qv-card-premium qv-hover-lift rounded-2xl p-6">
            <span className="qv-icon-chip mb-4 h-12 w-12"><Icon className="h-6 w-6" /></span>
            <h3 className="mb-2 text-lg font-bold">{title}</h3>
            <p className="leading-relaxed text-muted-foreground">{text}</p>
          </Reveal>
        ))}
      </div>
    </PageSection>
  )
}
