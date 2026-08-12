import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DashboardRoutePrefetch } from '@/components/layout/dashboard-route-prefetch'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createClient } from '@/lib/supabase/server'
import { DbHealthBanner } from '@/components/layout/db-health-banner'
import { ChatbotWidget } from '@/components/chatbot/chatbot-widget'
import { getProfileWithFallback } from '@/lib/profile/profile-compat'
import { OnboardingTrigger } from '@/components/onboarding/onboarding-trigger'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

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
    if (timer) {
      clearTimeout(timer)
    }
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const requestHeaders = await headers()
  const e2eBypassKey = process.env.CARDSENSE_E2E_BYPASS_KEY
  const isE2ERequest =
    Boolean(e2eBypassKey) && requestHeaders.get('x-cardsense-e2e') === e2eBypassKey
  const { user, profile } = await withTimeout(
    (async () => {
      try {
        const supabase = await createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          return { user: null, profile: null }
        }

        const profile = await getProfileWithFallback(supabase, { userId: user.id, email: user.email ?? null })
        return { user, profile }
      } catch {
        return { user: null, profile: null }
      }
    })(),
    PROFILE_LOAD_TIMEOUT_MS,
    { user: null, profile: null }
  )

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User'
  const userEmail = user?.email || ''

  if (!user && !isE2ERequest) redirect('/login')

  return (
    <TooltipProvider>
      <div className="cardsense-shell min-h-screen">
        <DashboardRoutePrefetch />

        {/* Unified Navbar - replaces Sidebar + Topbar */}
        <Navbar userName={userName} userEmail={userEmail} />
        <OnboardingTrigger profile={profile} />

        {/* Main content area - full width, no sidebar offset */}
        <main id="main-content" tabIndex={-1} className="flex-1 pb-20 outline-none md:pb-8">
          <div className="pt-6 pb-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <DbHealthBanner />
              {children}
            </div>
          </div>
        </main>

        {/* Mobile Navigation - Mobile only */}
        <MobileNav />

        {/* Floating Chatbot Widget */}
        <ChatbotWidget />
      </div>
    </TooltipProvider>
  )
}
