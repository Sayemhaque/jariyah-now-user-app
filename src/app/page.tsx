import { Sparkles } from 'lucide-react'
import { landingFeatures, landingFooterLinks, landingHeaderLinks, landingMetadata, landingSteps } from '@/lib/content/site'
import { AppPreview } from '@/components/site/AppPreview'
import { AudienceSection } from '@/components/site/AudienceSection'
import { CtaSection } from '@/components/site/CtaSection'
import { FaqSection } from '@/components/site/FaqSection'
import { FeatureGrid } from '@/components/site/FeatureGrid'
import { LandingHero } from '@/components/site/LandingHero'
import { MarketingFooter } from '@/components/site/MarketingFooter'
import { MissionBanner } from '@/components/site/MissionBanner'
import { PageSection } from '@/components/site/PageSection'
import { SectionHeader } from '@/components/site/SectionHeader'
import { SiteHeader } from '@/components/site/SiteHeader'
import { StatsBand } from '@/components/site/StatsBand'
import { StorySection } from '@/components/site/StorySection'
import { TemplatesShowcase } from '@/components/site/TemplatesShowcase'
import { HadithGallery } from '@/components/templates/HadithGallery'

export const metadata = landingMetadata

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader links={landingHeaderLinks} />
      <LandingHero />
      <StatsBand />
      <StorySection />
      <AppPreview />
      <HadithGallery />
      <PageSection id="how-it-works" className="py-16 sm:py-24 bg-card/70 border-y border-border/80 backdrop-blur-sm">
        <SectionHeader
          className="mb-14"
          pillIcon={Sparkles}
          pillLabel="চারটি সহজ ধাপ"
          title="৪ ধাপে আপনার ভিডিও"
          subtitle="সহজ, দ্রুত এবং একদম ফ্রি"
        />
        <FeatureGrid items={landingSteps} delayStepMs={80} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6" />
      </PageSection>
      <PageSection className="py-16 sm:py-24">
        <SectionHeader
          className="mb-14"
          pillIcon={Sparkles}
          pillLabel="কেন সবাই আমাদের বেছে নেন"
          title="মানুষের উপকারে, শেয়ারের জন্য তৈরি"
        />
        <FeatureGrid items={landingFeatures} delayStepMs={60} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" />
      </PageSection>
      <AudienceSection />
      <TemplatesShowcase />
      <MissionBanner size="large" title="আমাদের নাম কেন Jariyah Now">
        <strong className="text-foreground">সদকায়ে জারিয়া</strong> হলো এমন দান, যার সওয়াব কাজ শেষ হওয়ার পরেও চলতে
        থাকে। আপনার শেয়ার করা কুরআন ভিডিও থেকে কেউ উপকার পেলে, প্রতিটি দেখা, প্রতিটি লাইক, প্রতিটি শেয়ারের জন্য
        আপনিও সওয়াব পাবেন।{' '}
        <span className="qv-gradient-text font-semibold">একবার শেয়ার, সওয়াব চিরকাল।</span> এটাই Jariyah Now-এর
        লক্ষ্য: আল্লাহর বাণীকে খুব সহজে সুন্দর ভিডিও ও ছবিতে রূপ দেওয়া, যা মানুষের কাছে পৌঁছে উপকার করতেই থাকবে।
      </MissionBanner>
      <FaqSection />
      <CtaSection />
      <MarketingFooter links={landingFooterLinks} showCredits />
    </div>
  )
}
