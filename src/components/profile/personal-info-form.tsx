'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, User } from 'lucide-react'
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
          // Ignore response parsing failures and fall back to generic message.
        }
        throw new Error(message)
      }

      toast.success('Personal information updated successfully')
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
          <User className="h-5 w-5 text-blue-600" />
          Personal Information
        </CardTitle>
        <CardDescription>Update your personal details and contact information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="bg-gray-50" />
                  </FormControl>
                  <FormDescription>
                    Your email cannot be changed. Contact support if you need to update it.
                  </FormDescription>
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
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="9876543210"
                      type="tel"
                      maxLength={10}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>10-digit Indian mobile number</FormDescription>
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
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mumbai, Delhi, Bangalore" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your city helps us recommend cards with local benefits
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
