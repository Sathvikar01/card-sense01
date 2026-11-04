import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DashboardRoutePrefetch } from '@/components/layout/dashboard-route-prefetch'
import { DbHealthBanner } from '@/components/layout/db-health-banner'
import { OnboardingTrigger } from '@/components/onboarding/onboarding-trigger'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createClient } from '@/lib/supabase/server'
import { getProfileWithFallback } from '@/lib/profile/profile-compat'

const PROFILE_LOAD_TIMEOUT_MS = 4000

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers()
  const e2eBypassKey = process.env.CARDSENSE_E2E_BYPASS_KEY
  const isE2ERequest = Boolean(e2eBypassKey) && requestHeaders.get('x-cardsense-e2e') === e2eBypassKey

  const { user, profile } = await withTimeout(
    (async () => {
      try {
        const supabase = await createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return { user: null, profile: null }

        const profile = await getProfileWithFallback(supabase, { userId: user.id, email: user.email ?? null })
        return { user, profile }
      } catch {
        return { user: null, profile: null }
      }
    })(),
    PROFILE_LOAD_TIMEOUT_MS,
    { user: null, profile: null }
  )

  if (!user && !isE2ERequest) redirect('/login')

  const userName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'

  return (
    <TooltipProvider>
      <DashboardRoutePrefetch />
      <Navbar userName={userName} userEmail={user?.email || ''} />
      <OnboardingTrigger profile={profile} />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <div className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6 md:pb-20 md:pt-10">
          <DbHealthBanner />
          {children}
        </div>
      </main>
      <MobileNav />
    </TooltipProvider>
  )
}
