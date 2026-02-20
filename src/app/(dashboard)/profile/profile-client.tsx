'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PersonalInfoForm } from '@/components/profile/personal-info-form'
import { FinancialInfoForm } from '@/components/profile/financial-info-form'
import { CibilHistoryChart } from '@/components/profile/cibil-history-chart'
import { UserCardsManager } from '@/components/profile/user-cards-manager'
import {
  User,
  Wallet,
  TrendingUp,
  Trash2,
  CreditCard,
  Briefcase,
  Shield,
  MapPin,
  Mail,
  Phone,
  CalendarDays,
  Building2,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

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

const EMPLOYMENT_LABELS: Record<string, string> = {
  salaried: 'Salaried',
  self_employed: 'Self Employed',
  business_owner: 'Business Owner',
  freelancer: 'Freelancer',
  student: 'Student',
  retired: 'Retired',
  unemployed: 'Unemployed',
  other: 'Other',
}

export function ProfilePageClient({ profile, cibilHistory }: ProfilePageClientProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('personal')
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
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete account')
        return
      }
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

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  const initials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  const formatIncome = (income: number | null) => {
    if (!income) return '--'
    if (income >= 100000) return `\u20B9${(income / 100000).toFixed(1)}L`
    if (income >= 1000) return `\u20B9${(income / 1000).toFixed(0)}K`
    return `\u20B9${income}`
  }

  const getScoreLabel = (score: number | null) => {
    if (!score) return null
    if (score >= 750) return { text: 'Excellent', color: 'text-emerald-600' }
    if (score >= 700) return { text: 'Good', color: 'text-blue-600' }
    if (score >= 650) return { text: 'Fair', color: 'text-amber-600' }
    return { text: 'Needs Work', color: 'text-red-600' }
  }

  const scoreLabel = getScoreLabel(profile.credit_score)

  const infoItems = [
    { icon: Mail, label: 'Email', value: profile.email },
    { icon: Phone, label: 'Phone', value: profile.phone ? `+91 ${profile.phone}` : null },
    { icon: MapPin, label: 'City', value: profile.city },
    { icon: Briefcase, label: 'Employment', value: EMPLOYMENT_LABELS[profile.employment_type || ''] },
    { icon: Building2, label: 'Employer', value: profile.employer_name },
    { icon: CreditCard, label: 'Primary Bank', value: profile.primary_bank },
  ].filter((item) => item.value)

  return (
    <div className="space-y-6 pb-8">
      {/* ── Profile Hero ── */}
      <div className="relative overflow-hidden rounded-3xl border border-[#d4a017]/20 bg-gradient-to-br from-[#fdf3d7]/60 via-background to-[#fdf3d7]/30">
        {/* Background blurs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#d4a017]/8 blur-[80px]" />
          <div className="absolute -bottom-10 right-10 h-48 w-48 rounded-full bg-[#e8c04a]/6 blur-[60px]" />
        </div>

        <div className="relative z-10 p-6 sm:p-8">
          {/* Top row: avatar + name */}
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b8860b] to-[#d4a017] text-3xl font-bold text-white shadow-lg shadow-[#b8860b]/25 ring-4 ring-background">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {profile.full_name || 'Your Profile'}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                {profile.email && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {profile.email}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Joined {memberSince}
                </span>
                {profile.city && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick info pills */}
          {infoItems.length > 3 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {infoItems.slice(3).map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm"
                >
                  <item.icon className="h-3 w-3" />
                  {item.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* CIBIL Score */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background p-4 transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">CIBIL Score</p>
              <p className="mt-1.5 text-3xl font-bold tabular-nums text-foreground">
                {profile.credit_score || '--'}
              </p>
              {scoreLabel && (
                <p className={`mt-0.5 text-xs font-medium ${scoreLabel.color}`}>
                  {scoreLabel.text}
                </p>
              )}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
              <Shield className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Annual Income */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background p-4 transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">Annual Income</p>
              <p className="mt-1.5 text-3xl font-bold tabular-nums text-foreground">
                {formatIncome(profile.annual_income)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm">
              <Wallet className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Employment */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background p-4 transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">Employment</p>
              <p className="mt-1.5 text-xl font-bold text-foreground">
                {EMPLOYMENT_LABELS[profile.employment_type || ''] || '--'}
              </p>
              {profile.employer_name && (
                <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[140px]">{profile.employer_name}</p>
              )}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 shadow-sm">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Primary Bank */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background p-4 transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">Primary Bank</p>
              <p className="mt-1.5 text-xl font-bold text-foreground truncate max-w-[160px]">
                {profile.primary_bank || '--'}
              </p>
              {profile.has_fixed_deposit && (
                <p className="mt-0.5 text-xs text-emerald-600 font-medium">Has FD</p>
              )}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-sm">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Accordion Sections ── */}
      <div className="space-y-3">
        {/* Personal Information */}
        <ProfileSection
          id="personal"
          title="Personal Information"
          description="Name, email, phone, and city"
          icon={User}
          iconGradient="from-blue-400 to-indigo-500"
          isExpanded={expandedSection === 'personal'}
          onToggle={() => toggleSection('personal')}
        >
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

        {/* Financial Information */}
        <ProfileSection
          id="financial"
          title="Financial Information"
          description="Income, employment, bank details, and FD"
          icon={Wallet}
          iconGradient="from-emerald-400 to-green-500"
          isExpanded={expandedSection === 'financial'}
          onToggle={() => toggleSection('financial')}
        >
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

        {/* My Cards */}
        <ProfileSection
          id="cards"
          title="My Cards"
          description="Credit and debit cards you own"
          icon={CreditCard}
          iconGradient="from-[#b8860b] to-[#d4a017]"
          isExpanded={expandedSection === 'cards'}
          onToggle={() => toggleSection('cards')}
        >
          <UserCardsManager />
        </ProfileSection>

        {/* CIBIL Score History */}
        <ProfileSection
          id="cibil"
          title="CIBIL Score History"
          description="Track your credit score over time"
          icon={TrendingUp}
          iconGradient="from-amber-400 to-orange-500"
          isExpanded={expandedSection === 'cibil'}
          onToggle={() => toggleSection('cibil')}
        >
          <CibilHistoryChart history={cibilHistory} onUpdate={handleUpdate} />
        </ProfileSection>
      </div>

      {/* ── Danger Zone ── */}
      <div className="rounded-2xl border border-red-200/60 bg-red-50/30 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
            <p className="text-xs text-red-600/70 mt-0.5">
              Permanently delete your account and all associated data
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400 hover:text-red-700"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete Account
          </Button>
        </div>
      </div>

      {/* ── Delete Confirmation ── */}
      <AnimatePresence>
        {showDeleteDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowDeleteDialog(false)
                setConfirmText('')
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-md rounded-2xl bg-background border border-border p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Delete account</h3>
                    <p className="text-sm text-muted-foreground">This cannot be undone</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  All your profile data, spending history, cards, and recommendations will be permanently deleted.
                  Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm.
                </p>

                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="mb-4 font-mono"
                  autoFocus
                />

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false)
                      setConfirmText('')
                    }}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Accordion Section Component ── */

interface ProfileSectionProps {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  iconGradient: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function ProfileSection({
  title,
  description,
  icon: Icon,
  iconGradient,
  isExpanded,
  onToggle,
  children,
}: ProfileSectionProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background transition-shadow hover:shadow-sm">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 sm:p-5 text-left transition-colors hover:bg-muted/30"
      >
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${iconGradient} shadow-sm`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 px-4 py-5 sm:px-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
