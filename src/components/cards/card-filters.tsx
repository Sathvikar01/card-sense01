import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { INDIAN_BANKS } from '@/lib/constants/banks'
import { X } from 'lucide-react'

const CARD_TYPES = [
  { value: 'entry_level', label: 'Entry Level' },
  { value: 'cashback', label: 'Cashback' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'travel', label: 'Travel' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'premium', label: 'Premium' },
  { value: 'super_premium', label: 'Super Premium' },
  { value: 'business', label: 'Business' },
  { value: 'secured', label: 'Secured' },
]

const MAX_FEE_OPTIONS = [
  { value: '0', label: 'Free Cards' },
  { value: '500', label: 'Up to ₹500' },
  { value: '1000', label: 'Up to ₹1,000' },
  { value: '2500', label: 'Up to ₹2,500' },
  { value: '5000', label: 'Up to ₹5,000' },
  { value: '10000', label: 'Up to ₹10,000' },
  { value: '999999', label: 'Any Fee' },
]

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'fee_low', label: 'Fee: Low to High' },
  { value: 'fee_high', label: 'Fee: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
]

interface CardFiltersProps {
  bank: string
  cardType: string
  maxFee: string
  sortBy: string
  onBankChange: (value: string) => void
  onCardTypeChange: (value: string) => void
  onMaxFeeChange: (value: string) => void
  onSortByChange: (value: string) => void
  onClearFilters: () => void
}

export function CardFilters({
  bank,
  cardType,
  maxFee,
  sortBy,
  onBankChange,
  onCardTypeChange,
  onMaxFeeChange,
  onSortByChange,
  onClearFilters,
}: CardFiltersProps) {
  const hasActiveFilters = bank || cardType || maxFee

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bank">Bank</Label>
          <Select value={bank} onValueChange={onBankChange}>
            <SelectTrigger id="bank">
              <SelectValue placeholder="All Banks" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Banks</SelectLabel>
                <SelectItem value="all">All Banks</SelectItem>
                {INDIAN_BANKS.map((bankName) => (
                  <SelectItem key={bankName} value={bankName}>
                    {bankName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardType">Card Type</Label>
          <Select value={cardType} onValueChange={onCardTypeChange}>
            <SelectTrigger id="cardType">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Card Types</SelectLabel>
                <SelectItem value="all">All Types</SelectItem>
                {CARD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxFee">Max Annual Fee</Label>
          <Select value={maxFee} onValueChange={onMaxFeeChange}>
            <SelectTrigger id="maxFee">
              <SelectValue placeholder="Any Fee" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Annual Fee</SelectLabel>
                {MAX_FEE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort By</Label>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger id="sortBy">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort Options</SelectLabel>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
