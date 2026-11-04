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

      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col justify-center outline-none">
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <h1 className="max-w-3xl text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-7xl">
            The right credit card for how you spend.
          </h1>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => setAuthRedirect('/advisor')}>
              Find my card
            </Button>
            <Button size="lg" variant="outline" onClick={() => setAuthRedirect('/cards')}>
              Browse cards
            </Button>
          </div>
        </section>

        <section
          aria-label="Cards in the catalog"
          className="relative overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
        >
          <div className="marquee-track gap-5">
            {[...SHOWCASE_CARDS, ...SHOWCASE_CARDS].map((id, i) => (
              <div key={`${id}-${i}`} aria-hidden={i >= SHOWCASE_CARDS.length} className="shrink-0">
                <CreditCardVisual cardId={id} size="md" />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-8 text-xs text-muted-foreground sm:px-6">
        <span>Not financial advice.</span>
        <nav className="flex gap-5">
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
        </nav>
      </footer>
    </div>
  )
}
