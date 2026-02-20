import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { ProfilePageClient } from './profile-client'
import {
  getCreditScoreHistoryWithFallback,
  getProfileWithFallback,
} from '@/lib/profile/profile-compat'

export const metadata: Metadata = {
  title: 'Profile | CardSense India',
  description: 'Manage your profile, financial information, and CIBIL score history',
}

async function getProfileData() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [profile, cibilHistory] = await Promise.all([
    getProfileWithFallback(supabase, { userId: user.id, email: user.email ?? null }),
    getCreditScoreHistoryWithFallback(supabase, user.id),
  ])

  return {
    profile,
    cibilHistory,
  }
}

export default async function ProfilePage() {
  const { profile, cibilHistory } = await getProfileData()

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>
        <div className="rounded-xl border border-red-200/60 bg-red-50/30 p-4">
          <p className="text-red-700 text-sm">
            Failed to load profile. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return <ProfilePageClient profile={profile} cibilHistory={cibilHistory} />
}
