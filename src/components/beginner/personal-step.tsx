// Step 1: Personal Information

'use client'

import { useBeginnerFlowStore } from '@/lib/store/beginner-flow-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card,CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCircle } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function PersonalStep() {
  const { age, city, updateField } = useBeginnerFlowStore()
  const ageInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus age input on mount
  useEffect(() => {
    ageInputRef.current?.focus()
  }, [])

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value)) {
      updateField('age', Math.min(65, Math.max(18, value)))
    }
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('city', e.target.value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-blue-600" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Let&apos;s start with some basic information about you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Age Input */}
        <div className="space-y-2">
          <Label htmlFor="age">
            Age <span className="text-red-500">*</span>
          </Label>
          <Input
            ref={ageInputRef}
            id="age"
            type="number"
            min={18}
            max={65}
            value={age}
            onChange={handleAgeChange}
            placeholder="Enter your age"
            className="max-w-xs"
          />
          <p className="text-sm text-gray-500">
            You must be between 18 and 65 years old. Some cards are available from 18+ (especially FD-backed secured cards).
          </p>
        </div>

        {/* City Input */}
        <div className="space-y-2">
          <Label htmlFor="city">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            type="text"
            value={city}
            onChange={handleCityChange}
            placeholder="e.g., Mumbai, Delhi, Bangalore"
            className="max-w-md"
          />
          <p className="text-sm text-gray-500">
            Your city helps us recommend cards with local benefits and availability
          </p>
        </div>

        {/* Validation hint */}
        {(!age || age < 18 || age > 65 || !city.trim()) && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-800">
              Please fill in both age and city to continue
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
