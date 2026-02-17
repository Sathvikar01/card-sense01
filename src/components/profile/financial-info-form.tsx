'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Wallet } from 'lucide-react'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
          // Ignore response parsing failures and fall back to generic message.
        }
        throw new Error(message)
      }

      toast.success('Financial information updated successfully')
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-600" />
          Financial Information
        </CardTitle>
        <CardDescription>
          Help us recommend the best credit cards based on your financial profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Employment Type */}
            <FormField
              control={form.control}
              name="employment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
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
                  <FormLabel>Employer/Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter employer or business name" {...field} />
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
                  <FormLabel>Annual Income (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 600000"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Your gross annual income helps determine card eligibility
                  </FormDescription>
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
                  <FormLabel>Primary Bank</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary bank" />
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
                  <FormDescription>
                    Some banks offer pre-approved cards to existing customers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fixed Deposit Toggle */}
            <FormField
              control={form.control}
              name="has_fixed_deposit"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Fixed Deposit (FD)</FormLabel>
                    <FormDescription>
                      Do you have a fixed deposit with any bank?
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
              <FormField
                control={form.control}
                name="fd_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fixed Deposit Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 100000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      FD-backed credit cards are easier to get approved
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
