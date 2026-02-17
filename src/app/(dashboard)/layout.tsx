import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DashboardRoutePrefetch } from '@/components/layout/dashboard-route-prefetch'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createClient } from '@/lib/supabase/server'
import { DbHealthBanner } from '@/components/layout/db-health-banner'

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

  return (
    <TooltipProvider>
      <div className="cardsense-shell min-h-screen">
        <DashboardRoutePrefetch />

        {/* Sidebar - Desktop only */}
        <Sidebar />

        {/* Main content area */}
        <div className="md:pl-72 flex min-h-screen flex-col">
          {/* Topbar */}
          <Topbar userName={userName} userEmail={userEmail} />

          {/* Page content */}
          <main className="flex-1 pb-20 md:pb-8">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                <DbHealthBanner />
                {children}
              </div>
            </div>
          </main>
        </div>

        {/* Mobile Navigation - Mobile only */}
        <MobileNav />
      </div>
    </TooltipProvider>
  )
}
