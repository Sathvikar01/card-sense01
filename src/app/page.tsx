'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { EDGE, Hero } from '@/components/landing/hero'
import { Logo } from '@/components/shared/logo'
import { AuthModal } from '@/components/shared/auth-modal'
import { Button } from '@/components/ui/button'

/** A hand of real card art, fanned from the middle. Seven reads as "every card" without a grid. */
const HAND = ['axis-ace', 'sbi-cashback', 'icici-sapphiro', 'hdfc-infinia', 'hdfc-regalia-gold', 'axis-magnus', 'amex-plat-travel']

const FACTS = [
  'Fees counted after waivers, not before.',
  'Rewards worked out on what you actually spend.',
  'Eligibility checked before you apply.',
  'Free, and no bank pays to be ranked.',
]

export default function HomePage() {
  const router = useRouter()
  const [authRedirect, setAuthRedirect] = useState<string | null>(null)

  // Supabase email links land on "/" with ?code=…; hand them to the callback route.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('code')) router.replace(`/auth/callback?${params.toString()}`)
  }, [router])

  return (
    <div className="flex min-h-dvh flex-col">
      <AuthModal open={authRedirect !== null} onClose={() => setAuthRedirect(null)} redirectTo={authRedirect ?? '/dashboard'} />

      <div className="relative bg-field text-field-foreground">
        <header className="absolute inset-x-0 top-0 z-30 flex h-16 items-center justify-between" style={{ paddingInline: EDGE }}>
          <Link href="/" aria-label="CardSense home" className="flex">
            <Logo onField />
          </Link>
          <Button variant="field" size="sm" onClick={() => setAuthRedirect('/dashboard')}>
            Sign in
          </Button>
        </header>
        <main id="main-content" tabIndex={-1} className="outline-none">
          <Hero onStart={() => setAuthRedirect('/advisor')} />
        </main>
      </div>

      <section aria-labelledby="details-heading" className="overflow-x-clip py-24 sm:py-32" style={{ paddingInline: EDGE }}>
        <div className="flex items-baseline justify-between gap-6">
          <h2 id="details-heading" className="max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Every major Indian card.
          </h2>
          <button type="button" onClick={() => setAuthRedirect('/cards')} className="tap hidden shrink-0 text-muted-foreground hover:text-foreground sm:block">
            Browse all cards
          </button>
        </div>
        {/* Built at 900×300, zoomed to the column. The middle card is upright and on top; each step out turns 6° more and sits lower. */}
        <div aria-hidden="true" className="mt-12 flex justify-center sm:mt-16">
          <ul className="relative h-[300px] w-[900px] shrink-0 [zoom:0.5] sm:[zoom:0.8] lg:[zoom:1.15]">
            {HAND.map((id, i) => {
              const step = i - (HAND.length - 1) / 2
              return (
                <li
                  key={id}
                  className="absolute left-0 top-0 origin-bottom drop-shadow-[0_12px_16px_rgb(22_48_43/0.16)]"
                  style={{ zIndex: 10 - Math.abs(step), transform: `translate(${i * 100}px, ${step * step * 7}px) rotate(${step * 6}deg)` }}
                >
                  <CreditCardVisual cardId={id} size="md" />
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="facts-heading" className="grid gap-12 pb-24 sm:pb-32 lg:grid-cols-12 lg:items-center lg:gap-8" style={{ paddingInline: EDGE }}>
        <div className="lg:col-span-7">
          <h2 id="facts-heading" className="text-3xl font-semibold tracking-tight sm:text-5xl">
            What we check for you.
          </h2>
          <ul className="mt-10 flex max-w-3xl flex-col gap-5 text-[clamp(1.375rem,2.2vw,1.75rem)] leading-snug">
            {FACTS.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => setAuthRedirect('/advisor')}>
              Find my card
            </Button>
            <Button size="lg" variant="outline" onClick={() => setAuthRedirect('/cards')}>
              Browse all cards
            </Button>
          </div>
        </div>
        {/* Generated still life, graded so its paper is the page's paper; the soft mask hides any seam. */}
        <div className="relative aspect-[3/2] [mask-image:radial-gradient(ellipse_closest-side_at_center,#000_70%,transparent)] lg:col-span-5 lg:aspect-square">
          <Image src="/images/landing/card-on-receipt.webp" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </div>
      </section>

      <footer className="relative mt-auto overflow-hidden bg-field text-field-foreground">
        {/* Generated still life on pine felt: a band above the wordmark on phones, the right of the footer on wide screens. */}
        <div className="absolute inset-x-0 top-0 h-64 [mask-image:linear-gradient(to_bottom,#000_50%,transparent)] sm:h-80 lg:inset-y-0 lg:left-auto lg:h-auto lg:w-[64%] lg:[mask-image:linear-gradient(to_right,transparent,#000_40%)]">
          <Image src="/images/landing/cards-on-felt.webp" alt="" fill sizes="(min-width: 1024px) 64vw, 100vw" className="object-cover object-right" />
        </div>
        <div className="relative pb-8 pt-60 sm:pt-72 lg:pt-48" style={{ paddingInline: EDGE }}>
          <p aria-hidden="true" className="text-[clamp(3.5rem,16vw,6rem)] font-semibold leading-none tracking-[-0.04em]">
            CardSense
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
            <span>Not financial advice. Estimates use published rates, before caps and offers.</span>
            <nav aria-label="Legal" className="flex gap-6">
              <Link href="/privacy" className="tap hover:underline">Privacy</Link>
              <Link href="/terms" className="tap hover:underline">Terms</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
