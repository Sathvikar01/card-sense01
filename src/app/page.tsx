'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { Logo } from '@/components/shared/logo'
import { AuthModal } from '@/components/shared/auth-modal'
import { Button } from '@/components/ui/button'

const SHOWCASE_CARDS = [
  'hdfc-regalia-gold',
  'sbi-cashback',
  'icici-amazon-pay',
  'axis-ace',
  'hdfc-millennia',
  'idfc-first-wow',
  'amex-membership-rewards',
  'hdfc-diners-club-black',
  'icici-sapphiro',
  'indusind-legend',
  'au-lit',
  'yes-first-preferred',
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
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <AuthModal
        open={authRedirect !== null}
        onClose={() => setAuthRedirect(null)}
        redirectTo={authRedirect ?? '/dashboard'}
      />

      <header className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="CardSense home" className="flex">
          <Logo />
        </Link>
        <Button variant="ghost" size="sm" onClick={() => setAuthRedirect('/dashboard')}>
          Sign in
        </Button>
      </header>

      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col justify-between outline-none">
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-28">
          <h1 className="max-w-3xl text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[5.5rem]">
            The card that fits how you spend.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground sm:text-xl">
            Five questions, then a ranked shortlist of Indian cards with real fees.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => setAuthRedirect('/advisor')}>
              Find my card
            </Button>
            <Button size="lg" variant="outline" onClick={() => setAuthRedirect('/cards')}>
              Browse cards
            </Button>
          </div>
        </section>

        {/* A still row you can swipe: no autoplay, so nothing moves without a pause control (WCAG 2.2.2). */}
        <section aria-label="Cards in the catalog" className="bg-inverse py-16 sm:py-24">
          <ul className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:none] sm:px-[max(1.5rem,calc((100%-72rem)/2+1.5rem))]">
            {SHOWCASE_CARDS.map((id) => (
              <li key={id} className="shrink-0 snap-start">
                <CreditCardVisual cardId={id} size="md" />
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="bg-inverse text-sm text-inverse-foreground">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pb-8 sm:px-6">
          <span>Not financial advice.</span>
          <nav aria-label="Legal" className="flex gap-6">
            <Link href="/privacy" className="tap hover:underline">Privacy</Link>
            <Link href="/terms" className="tap hover:underline">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
