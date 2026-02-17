'use client'

import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PersonalInfoForm } from '@/components/profile/personal-info-form'
import { FinancialInfoForm } from '@/components/profile/financial-info-form'
import { CibilHistoryChart } from '@/components/profile/cibil-history-chart'
import { User, Wallet, TrendingUp } from 'lucide-react'

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

  const handleUpdate = () => {
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="cibil" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">CIBIL History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <PersonalInfoForm
            initialData={{
              full_name: profile.full_name,
              email: profile.email,
              phone: profile.phone,
              city: profile.city,
            }}
            onUpdate={handleUpdate}
          />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="cibil" className="space-y-6">
          <CibilHistoryChart
            history={cibilHistory}
            onUpdate={handleUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
