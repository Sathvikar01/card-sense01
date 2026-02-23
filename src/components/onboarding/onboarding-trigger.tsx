'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  const initiallyComplete = useMemo(() => isComplete(profile), [profile])
  const [complete, setComplete] = useState(initiallyComplete)
  const [open, setOpen] = useState(!initiallyComplete)
  const repromptTimerRef = useRef<number | null>(null)

  const clearReprompt = () => {
    if (repromptTimerRef.current) {
      window.clearTimeout(repromptTimerRef.current)
      repromptTimerRef.current = null
    }
  }

  useEffect(() => {
    if (!open || complete) return
    void trackInteraction('onboarding_opened', {
      page: '/dashboard',
      entityType: 'onboarding',
    })
  }, [open, complete])

  useEffect(() => {
    return () => clearReprompt()
  }, [])

  if (complete) return null

  const handleClose = () => {
    setOpen(false)
    void trackInteraction('onboarding_skipped', {
      page: '/dashboard',
      entityType: 'onboarding',
    })

    clearReprompt()
    repromptTimerRef.current = window.setTimeout(() => {
      setOpen(true)
    }, 15000)
  }

  const handleCompleted = () => {
    clearReprompt()
    setComplete(true)
    setOpen(false)
  }

  return (
    <OnboardingWizard
      open={open}
      onClose={handleClose}
      onCompleted={handleCompleted}
      initialProfile={profile}
    />
  )
}
