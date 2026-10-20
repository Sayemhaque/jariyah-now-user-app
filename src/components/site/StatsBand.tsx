import { homeStats } from '@/lib/content/home'
import { CountUp } from './CountUp'
import { Reveal } from './Reveal'

export function StatsBand() {
  return (
    <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-amber-100/40 to-primary/10" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {homeStats.map((stat, i) => (
          <Reveal key={stat.label} delayMs={i * 90} className="rounded-2xl border border-white/70 bg-white/70 p-5 text-center shadow-sm backdrop-blur">
            <p className="font-display qv-gradient-text text-4xl font-bold sm:text-5xl"><CountUp value={stat.value} /></p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground sm:text-base">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
