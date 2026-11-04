import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { EmptyState } from '@/components/shared/empty-state'
import { ProfilePageClient } from './profile-client'
import {
  getCreditScoreHistoryWithFallback,
  getProfileWithFallback,
} from '@/lib/profile/profile-compat'

export const metadata: Metadata = { title: 'Profile' }

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
    return <EmptyState title="Couldn’t load your profile" />
  }

  return <ProfilePageClient profile={profile} cibilHistory={cibilHistory} />
}
