'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { OnboardingWizard, type OnboardingProfileSnapshot } from '@/components/onboarding/onboarding-wizard'
import { trackInteraction } from '@/lib/interactions/client'

interface OnboardingTriggerProps {
  profile: OnboardingProfileSnapshot | null
}

const isComplete = (profile: OnboardingProfileSnapshot | null) => {
  if (!profile) return false
  return Boolean(
    profile.onboarding_completed === true &&
      profile.full_name?.trim() &&
      profile.city?.trim() &&
      profile.employment_type?.trim() &&
      profile.primary_bank?.trim() &&
      profile.annual_income &&
      profile.annual_income > 0 &&
      profile.credit_score &&
      profile.credit_score >= 300
  )
}

export function OnboardingTrigger({ profile }: OnboardingTriggerProps) {
  const pathname = usePathname()
  const initiallyComplete = useMemo(() => isComplete(profile), [profile])
  const [completedInSession, setCompletedInSession] = useState(false)
  const [dismissedForSession, setDismissedForSession] = useState(false)
  const complete = initiallyComplete || completedInSession
  const shouldPromptOnThisPage = pathname === '/dashboard'
  const open = !complete && !dismissedForSession && shouldPromptOnThisPage

  useEffect(() => {
    if (!open || complete) return
    void trackInteraction('onboarding_opened', {
      page: '/dashboard',
      entityType: 'onboarding',
    })
  }, [open, complete])

  const handleClose = () => {
    setDismissedForSession(true)
    void trackInteraction('onboarding_skipped', {
      page: '/dashboard',
      entityType: 'onboarding',
    })
  }

  const handleCompleted = () => {
    setCompletedInSession(true)
  }

  if (complete) return null

  return (
    <OnboardingWizard
      open={open}
      onClose={handleClose}
      onCompleted={handleCompleted}
      initialProfile={profile}
    />
  )
}
