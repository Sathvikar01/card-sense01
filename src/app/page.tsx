import Link from 'next/link'
import { ArrowRight, CreditCard, Sparkles, ShieldCheck, TrendingUp } from 'lucide-react'

const navItems = ['Advisor', 'Log In', 'Catalog', 'India']

const valuePoints = [
  {
    title: 'Professional Recommendations',
    description: 'Clear, practical top card suggestions built from your profile and goals.',
    icon: Sparkles,
  },
  {
    title: 'Real Reward Math',
    description: 'See annual value, fee impact, and reasoned card ranking before applying.',
    icon: TrendingUp,
  },
  {
    title: 'Safe Eligibility Path',
    description: 'Avoid mismatch picks and focus on cards you can realistically get approved for.',
    icon: ShieldCheck,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">CARDSENSE</span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {navItems.map((item) => (
              <span key={item} className="text-sm font-medium text-muted-foreground">
                {item}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/signup" className="hidden text-sm font-semibold text-muted-foreground sm:inline-flex">
              Start Free
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <section className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
          <div className="space-y-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
                <CreditCard className="h-6 w-6" />
              </div>
              <p className="text-4xl font-semibold tracking-tight text-foreground">CARDSENSE</p>
            </div>

            <h1 className="cardsense-hero-title max-w-xl text-5xl leading-[1.02] text-foreground lg:text-6xl">
              Practical Card Intelligence
            </h1>

            <p className="max-w-xl text-2xl leading-relaxed text-muted-foreground">
              A professional AI-powered credit card advisor for precise and confident decisions.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25"
              >
                Get My Card Picks
              </Link>
              <Link
                href="/cards"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-7 py-3 text-lg font-semibold text-foreground"
              >
                Explore Card Catalog
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px] lg:min-h-[460px]">
            <div className="cardsense-card absolute inset-x-8 top-10 p-4">
              <div className="rounded-xl border border-border/70 bg-secondary/55 p-3">
                <div className="mb-3 h-9 rounded-lg border border-border/70 bg-background/70" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-background px-2 py-1.5 text-xs font-semibold text-foreground">87%</div>
                  <div className="rounded-md bg-background px-2 py-1.5 text-xs text-muted-foreground">Coverage</div>
                  <div className="rounded-md bg-background px-2 py-1.5 text-xs text-muted-foreground">Perks</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-border/70 bg-gradient-to-br from-[#163d90] via-[#1f5cc5] to-[#2f78eb] p-4 text-white">
                <div className="text-right text-xs tracking-[0.12em]">CARDSENSE</div>
                <div className="mt-8 text-sm opacity-90">**** **** **** 2209</div>
                <div className="mt-2 text-sm opacity-90">VALID THRU 07/30</div>
              </div>

              <div className="mt-4 space-y-2">
                {['Dining', 'Travel', 'Shopping', 'Utilities'].map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-lg border border-border/70 bg-background px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{item}</span>
                    <span className="font-semibold text-foreground">{(22 - index).toFixed(1)}k</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cardsense-card absolute right-0 top-28 w-44 p-4">
              <p className="text-4xl font-bold text-foreground">Rs 18,200</p>
              <p className="mt-1 text-sm text-muted-foreground">Projected yearly value</p>
            </div>

            <div className="cardsense-card absolute bottom-3 right-3 w-56 p-4">
              <div className="mx-auto h-28 w-28 rounded-full bg-[conic-gradient(#3b82f6_0_34%,#8ab6f7_34%_58%,#d8e6fb_58%_100%)] p-3">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">25%</p>
                    <p className="text-xs text-muted-foreground">Reward Mix</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 grid w-full max-w-7xl gap-5 md:grid-cols-3">
          {valuePoints.map((point) => {
            const Icon = point.icon
            return (
              <article key={point.title} className="cardsense-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">{point.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.description}</p>
              </article>
            )
          })}
        </section>

        <section className="mx-auto mt-16 w-full max-w-7xl">
          <div className="cardsense-card flex flex-col items-start justify-between gap-5 rounded-3xl p-8 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Ready to start
              </p>
              <p className="cardsense-hero-title mt-2 text-3xl text-foreground">
                Get your professional top 3 card picks now.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
