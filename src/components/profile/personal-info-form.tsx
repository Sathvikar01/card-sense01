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

const personalInfoSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
  city: z.string().min(2, 'City is required').max(100).optional().or(z.literal('')),
})

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>

interface PersonalInfoFormProps {
  initialData: {
    full_name: string | null
    email: string | null
    phone: string | null
    city: string | null
  }
  onUpdate?: () => void
}

export function PersonalInfoForm({ initialData, onUpdate }: PersonalInfoFormProps) {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      full_name: initialData.full_name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      city: initialData.city || '',
    },
  })

  const onSubmit = async (data: PersonalInfoFormData) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.full_name,
          phone: data.phone || null,
          city: data.city || null,
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

      toast.success('Personal information updated')
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
          {/* Full Name */}
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Full Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" className="h-10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email (Read-only) */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled className="h-10 bg-muted/50 text-muted-foreground" />
                </FormControl>
                <FormDescription className="text-[0.7rem]">Cannot be changed</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">Mobile Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">+91</span>
                    <Input
                      placeholder="9876543210"
                      type="tel"
                      maxLength={10}
                      className="h-10 pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">City</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Mumbai, Delhi, Bangalore" className="h-10" {...field} />
                </FormControl>
                <FormDescription className="text-[0.7rem]">Helps recommend cards with local benefits</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
