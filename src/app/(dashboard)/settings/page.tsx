import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { SettingsClient } from './settings-client'

export const metadata: Metadata = {
  title: 'Settings | CardSense India',
  description: 'Manage your account settings, notifications, and preferences',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'User'

  return (
    <SettingsClient
      userId={user.id}
      email={user.email ?? ''}
      displayName={displayName}
      provider={user.app_metadata?.provider ?? 'email'}
      createdAt={user.created_at}
    />
  )
}
