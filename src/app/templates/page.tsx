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
import { ReadyVideos } from '@/components/templates/ReadyVideos'

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all')
  const applyTemplate = useApplyTemplate()
  const templates =
    activeCategory === 'all' ? templatePresets : templatePresets.filter((t) => t.type === activeCategory)

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader links={templatesHeaderLinks} />
      <TemplatesHero />
      <ReadyVideos />
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      <TemplateGrid templates={templates} onSelect={applyTemplate} />
      <PageSection className="py-12 sm:py-16 bg-card border-y border-border">
        <SectionHeader
          centered
          className="mb-10"
          title="টেমপ্লেট কীভাবে কাজ করে"
          subtitle="টেমপ্লেট বেছে নিন → সব নিজে থেকেই বসে যাবে → চাইলে বদলে ডাউনলোড করুন"
        />
        <FeatureGrid items={templateSteps} className="grid sm:grid-cols-3 gap-6" />
      </PageSection>
      <MissionBanner size="medium" title="প্রতিটি শেয়ার হতে পারে সদকায়ে জারিয়া">
        আপনার শেয়ার করা কুরআন ভিডিও থেকে কেউ উপকার পেলে, প্রতিটি দেখার জন্য আপনিও সওয়াব পাবেন। একটি টেমপ্লেট
        বেছে নিন, নিজের মতো সাজিয়ে শেয়ার করুন — পোস্ট করার পরেও সওয়াব বাড়তেই থাকবে।
      </MissionBanner>
      <MarketingFooter links={templatesFooterLinks} />
    </div>
  )
}
