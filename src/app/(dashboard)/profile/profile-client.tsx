'use client'

import { useRouter } from 'next/navigation'
import { PersonalInfoForm } from '@/components/profile/personal-info-form'
import { FinancialInfoForm } from '@/components/profile/financial-info-form'
import { CibilHistoryChart } from '@/components/profile/cibil-history-chart'
import { UserCardsManager } from '@/components/profile/user-cards-manager'
import { PageHeader } from '@/components/shared/page-header'
import { Section } from '@/components/shared/section'

interface ProfilePageClientProps {
  profile: {
    id: string
    email: string | null
    full_name: string | null
    phone: string | null
    city: string | null
    annual_income: number | null
    employment_type: string | null
    employer_name: string | null
    primary_bank: string | null
    has_fixed_deposit: boolean | null
    fd_amount: number | null
    credit_score: number | null
    credit_score_date: string | null
    created_at: string
    updated_at: string
  }
  cibilHistory: Array<{
    id: string
    credit_score: number
    score_date: string
    score_source: string | null
    notes: string | null
  }>
}

export function ProfilePageClient({ profile, cibilHistory }: ProfilePageClientProps) {
  const router = useRouter()
  const handleUpdate = () => router.refresh()

  return (
    <div>
      <PageHeader title={profile.full_name || 'Profile'} />

      <div className="space-y-8">
        <ProfileSection title="Personal">
          <PersonalInfoForm
            initialData={{
              full_name: profile.full_name,
              email: profile.email,
              phone: profile.phone,
              city: profile.city,
            }}
            onUpdate={handleUpdate}
          />
        </ProfileSection>

        <ProfileSection title="Finances">
          <FinancialInfoForm
            initialData={{
              employment_type: profile.employment_type,
              employer_name: profile.employer_name,
              annual_income: profile.annual_income,
              primary_bank: profile.primary_bank,
              has_fixed_deposit: profile.has_fixed_deposit,
              fd_amount: profile.fd_amount,
            }}
            onUpdate={handleUpdate}
          />
        </ProfileSection>

        <ProfileSection title="Cards">
          <UserCardsManager />
        </ProfileSection>

        <ProfileSection title="CIBIL score">
          <CibilHistoryChart history={cibilHistory} onUpdate={handleUpdate} />
        </ProfileSection>
      </div>
    </div>
  )
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Section title={title}>
      <div className="pt-2">{children}</div>
    </Section>
  )
}
