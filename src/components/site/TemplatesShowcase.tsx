import Link from 'next/link'
import { ArrowRight, LayoutGrid } from 'lucide-react'
import { getFeaturedTemplates, templatePresets } from '@/lib/templatePresets'
import { PageSection } from './PageSection'
import { SectionHeader } from './SectionHeader'
import { TemplateCard } from './TemplateCard'

export function TemplatesShowcase() {
  return (
    <PageSection className="py-16 sm:py-24 bg-card border-y border-border">
      <SectionHeader
        className="mb-12"
        narrowSubtitle
        pillIcon={LayoutGrid}
        pillLabel="One-click starting points"
        title="Start from a template"
        subtitle="Pre-configured reels for Quran verses, duas, and more. Each template auto-loads the surah, reciter, font, and colors — so you can publish in minutes."
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {getFeaturedTemplates().map((template) => (
          <TemplateCard key={template.id} template={template} href="/app" />
        ))}
      </div>
      <div className="text-center mt-10">
        <Link
          href="/templates"
          className="qv-btn-secondary inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold"
        >
          <LayoutGrid className="h-4 w-4 text-primary" />
          Browse all {templatePresets.length} templates
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </PageSection>
  )
}
