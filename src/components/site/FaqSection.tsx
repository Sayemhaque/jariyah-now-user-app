import { ChevronDown, HelpCircle } from 'lucide-react'
import { homeFaqs } from '@/lib/content/home'
import { PageSection } from './PageSection'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

export function FaqSection() {
  return (
    <PageSection id="faq" className="border-t border-border/80 bg-card/60 py-16 sm:py-24" innerClassName="max-w-3xl">
      <SectionHeader centered className="mb-10" pillIcon={HelpCircle} pillLabel="প্রশ্ন ও উত্তর" title="সাধারণ জিজ্ঞাসা" />
      <div className="space-y-3">
        {homeFaqs.map((faq, i) => (
          <Reveal key={faq.q} delayMs={i * 70}>
            <details className="group qv-card-premium rounded-2xl px-5 py-4 open:shadow-lg">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold sm:text-lg">
                {faq.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-primary transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{faq.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </PageSection>
  )
}
