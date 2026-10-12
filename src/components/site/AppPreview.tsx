import { Sparkles } from 'lucide-react'
import { DeviceFrame } from './DeviceFrame'
import { PageSection } from './PageSection'
import { SectionHeader } from './SectionHeader'

export function AppPreview() {
  return (
    <PageSection className="py-12 sm:py-20 relative">
      <SectionHeader
        centered
        display={false}
        className="mb-12"
        pillIcon={Sparkles}
        pillLabel="Live in the browser"
        title="Everything runs in your browser"
        subtitle="No software to install. Preview, edit, and export — all without leaving the page."
      />
      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] blur-2xl opacity-60 -z-10" aria-hidden />
          <DeviceFrame device="desktop" />
        </div>
        <div className="hidden lg:block w-[200px] shrink-0 qv-phone-float">
          <div className="relative">
            <div className="absolute -inset-6 bg-primary/20 rounded-full blur-2xl qv-phone-glow -z-10" aria-hidden />
            <DeviceFrame device="mobile" />
          </div>
        </div>
      </div>
    </PageSection>
  )
}
