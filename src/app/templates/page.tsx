'use client'

import { useState } from 'react'
import { templatePresets } from '@/lib/templatePresets'
import { templateSteps, templatesFooterLinks, templatesHeaderLinks } from '@/lib/content/site'
import { useApplyTemplate } from '@/hooks/useApplyTemplate'
import { CategoryTabs, type TemplateCategory } from '@/components/site/CategoryTabs'
import { FeatureGrid } from '@/components/site/FeatureGrid'
import { MarketingFooter } from '@/components/site/MarketingFooter'
import { MissionBanner } from '@/components/site/MissionBanner'
import { PageSection } from '@/components/site/PageSection'
import { SectionHeader } from '@/components/site/SectionHeader'
import { SiteHeader } from '@/components/site/SiteHeader'
import { TemplateGrid } from '@/components/site/TemplateGrid'
import { TemplatesHero } from '@/components/site/TemplatesHero'

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all')
  const applyTemplate = useApplyTemplate()
  const templates =
    activeCategory === 'all' ? templatePresets : templatePresets.filter((t) => t.type === activeCategory)

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader links={templatesHeaderLinks} />
      <TemplatesHero />
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      <TemplateGrid templates={templates} onSelect={applyTemplate} />
      <PageSection className="py-12 sm:py-16 bg-card border-y border-border">
        <SectionHeader
          centered
          className="mb-10"
          title="How templates work"
          subtitle="Pick a template → it loads everything → you tweak + export"
        />
        <FeatureGrid items={templateSteps} className="grid sm:grid-cols-3 gap-6" />
      </PageSection>
      <MissionBanner size="medium" title="Every share is Sadaqah Jariyah">
        When someone benefits from a Quran reel you shared, you earn reward for every view. Pick a template, customize
        it, and share — the reward keeps growing long after you click post.
      </MissionBanner>
      <MarketingFooter links={templatesFooterLinks} />
    </div>
  )
}
