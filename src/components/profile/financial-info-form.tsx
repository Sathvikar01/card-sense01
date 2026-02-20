'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const financialInfoSchema = z.object({
  employment_type: z.enum(['salaried', 'self_employed', 'student', 'retired', 'unemployed', 'other']).optional(),
  employer_name: z.string().max(200).optional().or(z.literal('')),
  annual_income: z
    .number()
    .min(0, 'Annual income must be positive')
    .max(100000000, 'Please enter a valid income')
    .optional()
    .or(z.literal(0)),
  primary_bank: z.string().max(100).optional().or(z.literal('')),
  has_fixed_deposit: z.boolean().optional(),
  fd_amount: z
    .number()
    .min(0, 'FD amount must be positive')
    .max(100000000, 'Please enter a valid amount')
    .optional()
    .or(z.literal(0)),
})

type FinancialInfoFormData = z.infer<typeof financialInfoSchema>

interface FinancialInfoFormProps {
  initialData: {
    employment_type: string | null
    employer_name: string | null
    annual_income: number | null
    primary_bank: string | null
    has_fixed_deposit: boolean | null
    fd_amount: number | null
  }
  onUpdate?: () => void
}

const EMPLOYMENT_TYPES = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'other', label: 'Other' },
]

const POPULAR_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India (SBI)',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Yes Bank',
  'IDFC First Bank',
  'RBL Bank',
  'Standard Chartered',
  'HSBC',
  'Citibank',
  'Other',
]

export function FinancialInfoForm({ initialData, onUpdate }: FinancialInfoFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const initialEmploymentType = EMPLOYMENT_TYPES.some(
    (type) => type.value === initialData.employment_type
  )
    ? (initialData.employment_type as FinancialInfoFormData['employment_type'])
    : undefined

  const form = useForm<FinancialInfoFormData>({
    resolver: zodResolver(financialInfoSchema),
    defaultValues: {
      employment_type: initialEmploymentType,
      employer_name: initialData.employer_name || '',
      annual_income: initialData.annual_income || 0,
      primary_bank: initialData.primary_bank || '',
      has_fixed_deposit: initialData.has_fixed_deposit || false,
      fd_amount: initialData.fd_amount || 0,
    },
  })

  const hasFD = form.watch('has_fixed_deposit')

  const onSubmit = async (data: FinancialInfoFormData) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employment_type: data.employment_type || null,
          employer_name: data.employer_name || null,
          annual_income: data.annual_income || null,
          primary_bank: data.primary_bank || null,
          has_fixed_deposit: data.has_fixed_deposit || false,
          fd_amount: data.has_fixed_deposit ? data.fd_amount || null : null,
        }),
      })

      if (!response.ok) {
        let message = 'Failed to update profile'
        try {
          const error = (await response.json()) as { message?: string; error?: string }
          message = error.message || error.error || message
        } catch {
          // Ignore
        }
        throw new Error(message)
      }

      toast.success('Financial information updated')
      onUpdate?.()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile. Please try again.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Employment Type */}
          <FormField
            control={form.control}
            name="employment_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Employment Type
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Employer Name */}
          <FormField
            control={form.control}
            name="employer_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Employer / Business
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., TCS, Infosys" className="h-10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Annual Income */}
          <FormField
            control={form.control}
            name="annual_income"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Annual Income ({'\u20B9'})
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">{'\u20B9'}</span>
                    <Input
                      type="number"
                      placeholder="e.g., 600000"
                      className="h-10 pl-8"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value || ''}
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-[0.7rem]">Gross annual income for card eligibility</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Primary Bank */}
          <FormField
            control={form.control}
            name="primary_bank"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Primary Bank
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {POPULAR_BANKS.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-[0.7rem]">Pre-approved cards may be available</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fixed Deposit Toggle */}
        <FormField
          control={form.control}
          name="has_fixed_deposit"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-medium text-foreground">Fixed Deposit (FD)</FormLabel>
                <FormDescription className="text-[0.7rem]">
                  FD-backed credit cards are easier to get approved
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* FD Amount (conditional) */}
        {hasFD && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fd_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-muted-foreground">
                    FD Amount ({'\u20B9'})
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">{'\u20B9'}</span>
                      <Input
                        type="number"
                        placeholder="e.g., 100000"
                        className="h-10 pl-8"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value || ''}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            size="sm"
            className="gap-2 bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white shadow-sm hover:shadow-md"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
