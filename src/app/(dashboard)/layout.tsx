import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DashboardRoutePrefetch } from '@/components/layout/dashboard-route-prefetch'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createClient } from '@/lib/supabase/server'
import { DbHealthBanner } from '@/components/layout/db-health-banner'
import { ChatbotWidget } from '@/components/chatbot/chatbot-widget'
import { getProfileWithFallback } from '@/lib/profile/profile-compat'
import { OnboardingTrigger } from '@/components/onboarding/onboarding-trigger'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User'
  const userEmail = user?.email || ''
  const profile = user
    ? await getProfileWithFallback(supabase, { userId: user.id, email: user.email ?? null })
    : null

  return (
    <TooltipProvider>
      <div className="cardsense-shell min-h-screen">
        <DashboardRoutePrefetch />

        {/* Unified Navbar - replaces Sidebar + Topbar */}
        <Navbar userName={userName} userEmail={userEmail} />
        <OnboardingTrigger profile={profile} />

        {/* Main content area - full width, no sidebar offset */}
        <main className="flex-1 pb-20 md:pb-8">
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
