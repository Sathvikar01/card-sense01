// Step 3: Banking Information

'use client'

import { useBeginnerFlowStore } from '@/lib/store/beginner-flow-store'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { INDIAN_BANKS } from '@/lib/constants/banks'
import { Building2 } from 'lucide-react'

export function BankingStep() {
  const {
    primaryBank,
    hasSavingsAccount,
    hasFD,
    fdAmount,
    updateField,
  } = useBeginnerFlowStore()

  const handleBankChange = (value: string) => {
    updateField('primaryBank', value)
  }

  const handleSavingsAccountChange = (checked: boolean) => {
    updateField('hasSavingsAccount', checked)
  }

  const handleFDChange = (checked: boolean) => {
    updateField('hasFD', checked)
    if (!checked) {
      updateField('fdAmount', undefined)
    }
  }

  const handleFDAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0) {
      updateField('fdAmount', value)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Banking Relationship
        </CardTitle>
        <CardDescription>
          Your existing banking relationships can improve approval chances
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Bank */}
        <div className="space-y-2">
          <Label htmlFor="primaryBank">
            Primary Bank <span className="text-red-500">*</span>
          </Label>
          <Select value={primaryBank} onValueChange={handleBankChange}>
            <SelectTrigger id="primaryBank">
              <SelectValue placeholder="Select your primary bank" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {INDIAN_BANKS.map((bank) => (
                <SelectItem key={bank} value={bank}>
                  {bank}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            The bank where you hold your main savings or salary account
          </p>
        </div>

        {/* Has Savings Account */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasSavingsAccount"
              checked={hasSavingsAccount}
              onCheckedChange={(checked) => handleSavingsAccountChange(checked as boolean)}
            />
            <Label
              htmlFor="hasSavingsAccount"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I have a savings account with this bank
            </Label>
          </div>
          {hasSavingsAccount && (
            <div className="ml-6 rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-sm text-green-800">
                Great! Having an existing relationship with the bank significantly improves your chances of credit card approval.
              </p>
            </div>
          )}
        </div>

        {/* Has Fixed Deposit */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasFD"
              checked={hasFD}
              onCheckedChange={(checked) => handleFDChange(checked as boolean)}
            />
            <Label
              htmlFor="hasFD"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I have a Fixed Deposit (FD)
            </Label>
          </div>

          {hasFD && (
            <div className="ml-6 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="fdAmount">
                  FD Amount
                </Label>
                <div className="flex items-center gap-2 max-w-xs">
                  <Input
                    id="fdAmount"
                    type="number"
                    min={0}
                    value={fdAmount || ''}
                    onChange={handleFDAmountChange}
                    placeholder="Enter FD amount"
                  />
                </div>
                {fdAmount && fdAmount > 0 && (
                  <p className="text-sm text-gray-600">
                    {formatCurrency(fdAmount)}
                  </p>
                )}
              </div>

              {fdAmount && fdAmount >= 10000 && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-sm text-blue-800">
                    <strong>FD-backed credit cards:</strong> With an FD of {formatCurrency(fdAmount)}, you may be eligible for secured credit cards even with no credit history. The FD acts as collateral.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Helpful tip */}
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <p className="text-sm text-gray-700">
            <strong>Tip:</strong> Cards from your primary bank are easier to get approved. If you don&apos;t have a bank account yet, consider opening one first to build a banking relationship.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
