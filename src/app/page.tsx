'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Examples } from '@/components/landing/examples'
import { EDGE, Hero } from '@/components/landing/hero'
import { Logo } from '@/components/shared/logo'
import { AuthModal } from '@/components/shared/auth-modal'
import { Button } from '@/components/ui/button'

const FACTS = [
  'Fees counted after waivers, not before.',
  'Rewards worked out on what you actually spend.',
  'Eligibility checked before you apply.',
  'Free, and no bank pays to be ranked.',
]

/** Light from top to bottom: hero and card rows, four worked examples, what we check, a quiet footer. */
export default function HomePage() {
  const router = useRouter()
  const [authRedirect, setAuthRedirect] = useState<string | null>(null)
  const start = () => setAuthRedirect('/advisor')
  const browse = () => setAuthRedirect('/cards')

  // Supabase email links land on "/" with ?code=…; hand them to the callback route.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('code')) router.replace(`/auth/callback?${params.toString()}`)
  }, [router])

  return (
    <div className="flex min-h-dvh flex-col">
      <AuthModal open={authRedirect !== null} onClose={() => setAuthRedirect(null)} redirectTo={authRedirect ?? '/dashboard'} />

      <header className="absolute inset-x-0 top-0 z-30 flex h-16 items-center justify-between" style={{ paddingInline: EDGE }}>
        <Link href="/" aria-label="CardSense home" className="flex">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setAuthRedirect('/dashboard')}>
            Sign in
          </Button>
          <Button size="sm" className="hidden sm:inline-flex" onClick={start}>
            Find my card
          </Button>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="outline-none">
        <Hero onStart={start} onBrowse={browse} />

        <Examples />

        <section aria-labelledby="facts-heading" className="grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:items-center lg:gap-8" style={{ paddingInline: EDGE }}>
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
              <Button size="lg" onClick={start}>
                Find my card
              </Button>
              <Button size="lg" variant="outline" onClick={browse}>
                Browse all cards
              </Button>
            </div>
          </div>
          {/* Generated still life, graded so its paper is the page's paper; the soft mask hides any seam. */}
          <div className="relative aspect-[3/2] [mask-image:radial-gradient(ellipse_closest-side_at_center,#000_70%,transparent)] lg:col-span-5 lg:aspect-square">
            <Image src="/images/landing/card-on-receipt.webp" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
        </section>
      </main>

      <footer className="mt-auto flex flex-col gap-6 pb-10 pt-16 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between" style={{ paddingInline: EDGE }}>
        <Logo />
        <span>Not financial advice. Estimates use published rates, before caps and offers.</span>
        <nav aria-label="Legal" className="flex gap-6">
          <Link href="/privacy" className="tap hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="tap hover:text-foreground">Terms</Link>
        </nav>
      </footer>
    </div>
  )
}
