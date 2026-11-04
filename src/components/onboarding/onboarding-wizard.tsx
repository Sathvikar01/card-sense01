'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trackInteraction } from '@/lib/interactions/client'

export interface OnboardingProfileSnapshot {
  full_name?: string | null
  city?: string | null
  employment_type?: string | null
  annual_income?: number | null
  primary_bank?: string | null
  credit_score?: number | null
  onboarding_completed?: boolean | null
}

interface OnboardingWizardProps {
  open: boolean
  initialProfile: OnboardingProfileSnapshot | null
  onClose: () => void
  onCompleted: () => void
}

const CREDIT_BANDS = [
  { value: 'no_history', label: 'No credit history', score: 0 },
  { value: 'below_650', label: 'Below 650', score: 620 },
  { value: '650_699', label: '650 - 699', score: 675 },
  { value: '700_749', label: '700 - 749', score: 725 },
  { value: '750_plus', label: '750+', score: 780 },
] as const

export function OnboardingWizard({
  open,
  initialProfile,
  onClose,
  onCompleted,
}: OnboardingWizardProps) {
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState(initialProfile?.full_name || '')
  const [city, setCity] = useState(initialProfile?.city || '')
  const [employmentType, setEmploymentType] = useState(initialProfile?.employment_type || '')
  const [annualIncome, setAnnualIncome] = useState(initialProfile?.annual_income || 0)
  const [primaryBank, setPrimaryBank] = useState(initialProfile?.primary_bank || '')
  const [creditBand, setCreditBand] = useState(() => {
    const score = initialProfile?.credit_score || 0
    if (score >= 750) return '750_plus'
    if (score >= 700) return '700_749'
    if (score >= 650) return '650_699'
    if (score > 0) return 'below_650'
    return 'no_history'
  })
  const [ownsCards, setOwnsCards] = useState(false)
  const [cardName, setCardName] = useState('')
  const [cardBank, setCardBank] = useState('')

  const selectedBand = useMemo(
    () => CREDIT_BANDS.find((item) => item.value === creditBand),
    [creditBand]
  )

  const canSubmit = Boolean(
    fullName.trim() &&
      city.trim() &&
      employmentType &&
      annualIncome > 0 &&
      primaryBank.trim() &&
      creditBand
  )

  const saveProfile = async () => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName.trim(),
        city: city.trim(),
        employment_type: employmentType,
        annual_income: annualIncome,
        primary_bank: primaryBank.trim(),
        onboarding_completed: true,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as { message?: string }).message || 'Failed to save profile')
    }
  }

  const saveCreditScore = async () => {
    if (!selectedBand || selectedBand.score === 0) return
    const today = new Date().toISOString().slice(0, 10)
    await fetch('/api/profile/cibil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credit_score: selectedBand.score,
        score_date: today,
        score_source: 'manual',
        notes: 'Captured during onboarding',
      }),
    })
  }

  const saveOwnedCard = async () => {
    if (!ownsCards || !cardName.trim() || !cardBank.trim()) return
    const res = await fetch('/api/cards/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        card_name: cardName.trim(),
        bank_name: cardBank.trim(),
        notes: 'Added during onboarding',
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as { message?: string }).message || 'Failed to save your card')
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit) return

    setSaving(true)
    try {
      await saveProfile()
      await Promise.all([saveCreditScore(), saveOwnedCard()])

      await trackInteraction('onboarding_completed', {
        page: '/dashboard',
        entityType: 'onboarding',
        metadata: {
          employmentType,
          annualIncome,
          creditBand,
          ownsCards,
        },
      })

      onCompleted()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save your details. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent aria-describedby={undefined} className="max-h-[calc(100dvh-1rem)] max-w-xl overflow-y-auto overscroll-contain p-0 sm:max-h-[calc(100dvh-2rem)]" showCloseButton>
        <DialogHeader className="px-6 pt-6 text-left">
          <DialogTitle className="text-lg">About you</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="onboarding-name">Name</Label>
              <Input
                id="onboarding-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboarding-city">City</Label>
              <Input
                id="onboarding-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Mumbai"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Employment</Label>
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="self_employed">Self-employed</SelectItem>
                  <SelectItem value="business_owner">Business owner</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboarding-income">Annual income (₹)</Label>
              <Input
                id="onboarding-income"
                type="number"
                min={0}
                value={annualIncome || ''}
                onChange={(event) => setAnnualIncome(Number(event.target.value) || 0)}
                placeholder="6,00,000"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="onboarding-bank">Primary bank</Label>
              <Input
                id="onboarding-bank"
                value={primaryBank}
                onChange={(event) => setPrimaryBank(event.target.value)}
                placeholder="HDFC Bank"
              />
            </div>
            <div className="space-y-2">
              <Label>Credit score</Label>
              <Select value={creditBand} onValueChange={setCreditBand}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_BANDS.map((band) => (
                    <SelectItem key={band.value} value={band.value}>
                      {band.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Have a credit card?</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={ownsCards ? 'default' : 'outline'}
                onClick={() => setOwnsCards(true)}
              >
                Yes
              </Button>
              <Button type="button" variant={!ownsCards ? 'default' : 'outline'} onClick={() => setOwnsCards(false)}>
                No
              </Button>
            </div>

            {ownsCards && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  value={cardName}
                  onChange={(event) => setCardName(event.target.value)}
                  placeholder="Card name"
                />
                <Input
                  value={cardBank}
                  onChange={(event) => setCardBank(event.target.value)}
                  placeholder="Bank"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 pb-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Later
          </Button>
          <Button type="button" disabled={saving || !canSubmit} onClick={handleSubmit}>
            {saving ? 'Saving…' : 'Done'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
