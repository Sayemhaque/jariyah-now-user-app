import { Sparkles } from 'lucide-react'
import { landingFeatures, landingFooterLinks, landingHeaderLinks, landingMetadata, landingSteps } from '@/lib/content/site'
import { AppPreview } from '@/components/site/AppPreview'
import { CtaSection } from '@/components/site/CtaSection'
import { FeatureGrid } from '@/components/site/FeatureGrid'
import { LandingHero } from '@/components/site/LandingHero'
import { MarketingFooter } from '@/components/site/MarketingFooter'
import { MissionBanner } from '@/components/site/MissionBanner'
import { PageSection } from '@/components/site/PageSection'
import { SectionHeader } from '@/components/site/SectionHeader'
import { SiteHeader } from '@/components/site/SiteHeader'
import { TemplatesShowcase } from '@/components/site/TemplatesShowcase'

export const metadata = landingMetadata

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader links={landingHeaderLinks} />
      <LandingHero />
      <AppPreview />
      <PageSection id="how-it-works" className="py-16 sm:py-24 bg-card/70 border-y border-border/80 backdrop-blur-sm">
        <SectionHeader
          className="mb-14"
          pillIcon={Sparkles}
          pillLabel="Four simple steps"
          title="Your reel in 4 steps"
          subtitle="Simple, fast, and completely free"
        />
        <FeatureGrid items={landingSteps} delayStepMs={80} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6" />
      </PageSection>
      <PageSection className="py-16 sm:py-24">
        <SectionHeader
          className="mb-14"
          pillIcon={Sparkles}
          pillLabel="Why creators choose us"
          title="Built for impact, designed for sharing"
        />
        <FeatureGrid items={landingFeatures} delayStepMs={60} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" />
      </PageSection>
      <TemplatesShowcase />
      <MissionBanner size="large" title="Why we're called Jariyah Now">
        <strong className="text-foreground">Sadaqah Jariyah</strong> is the ongoing charity that keeps rewarding you —
        long after the original act. When someone benefits from a Quran reel you shared, you earn reward for every
        view, every heart, every share.{' '}
        <span className="qv-gradient-text font-semibold">Share once, earn forever.</span> That’s the mission behind
        Jariyah Now: make it effortless to turn the words of Allah into beautiful, shareable content that keeps giving.
      </MissionBanner>
      <CtaSection />
      <MarketingFooter links={landingFooterLinks} showCredits />
    </div>
  )
}
