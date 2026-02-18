'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PersonalInfoForm } from '@/components/profile/personal-info-form'
import { FinancialInfoForm } from '@/components/profile/financial-info-form'
import { CibilHistoryChart } from '@/components/profile/cibil-history-chart'
import { User, Wallet, TrendingUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleUpdate = () => {
    router.refresh()
  }

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return
    setIsDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to delete account'); return }
      await supabase.auth.signOut()
      toast.success('Account deleted.')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
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

      {/* Delete Account */}
      <div className="pt-2 border-t border-gray-200">
        <Button
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete account</h3>
                <p className="text-sm text-gray-500">This cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              All your profile data, spending history, and recommendations will be permanently deleted.
              Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm.
            </p>

            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="mb-4 font-mono"
            />

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => { setShowDeleteDialog(false); setConfirmText('') }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'DELETE' || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete my account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
