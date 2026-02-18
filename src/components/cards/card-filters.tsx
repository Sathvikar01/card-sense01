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
import { X, Building2, CreditCard, Wallet, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const CARD_TYPES = [
  { value: 'entry_level', label: 'Entry Level', emoji: '🌱' },
  { value: 'cashback', label: 'Cashback', emoji: '💰' },
  { value: 'rewards', label: 'Rewards', emoji: '🎁' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'fuel', label: 'Fuel', emoji: '⛽' },
  { value: 'premium', label: 'Premium', emoji: '💎' },
  { value: 'super_premium', label: 'Super Premium', emoji: '👑' },
  { value: 'business', label: 'Business', emoji: '💼' },
  { value: 'secured', label: 'Secured', emoji: '🔒' },
]

const MAX_FEE_OPTIONS = [
  { value: '0', label: 'Free' },
  { value: '500', label: '≤ ₹500' },
  { value: '1000', label: '≤ ₹1K' },
  { value: '2500', label: '≤ ₹2.5K' },
  { value: '5000', label: '≤ ₹5K' },
  { value: '10000', label: '≤ ₹10K' },
  { value: '999999', label: 'Any' },
]

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'fee_low', label: 'Fee: Low → High' },
  { value: 'fee_high', label: 'Fee: High → Low' },
  { value: 'name', label: 'Name: A → Z' },
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
  const hasActiveFilters = (bank && bank !== 'all') || (cardType && cardType !== 'all') || (maxFee && maxFee !== 'all')
  const activeCount = [bank, cardType, maxFee].filter(v => v && v !== 'all').length

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">Filters</span>
          {activeCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Bank */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <Building2 className="h-3.5 w-3.5" />
          Bank
        </div>
        <Select value={bank || 'all'} onValueChange={onBankChange}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="All Banks" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
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

      {/* Card Type — chip grid */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <CreditCard className="h-3.5 w-3.5" />
          Card Type
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CARD_TYPES.map((type) => {
            const isActive = cardType === type.value
            return (
              <button
                key={type.value}
                onClick={() => onCardTypeChange(isActive ? 'all' : type.value)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150',
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:border-blue-400 hover:text-blue-600'
                )}
              >
                {type.emoji} {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Max Fee — pill row */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <Wallet className="h-3.5 w-3.5" />
          Max Annual Fee
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MAX_FEE_OPTIONS.map((option) => {
            const isActive = maxFee === option.value
            return (
              <button
                key={option.value}
                onClick={() => onMaxFeeChange(isActive ? '' : option.value)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150',
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:border-emerald-400 hover:text-emerald-600'
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <ArrowUpDown className="h-3.5 w-3.5" />
          Sort By
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {SORT_OPTIONS.map((option) => {
            const isActive = sortBy === option.value
            return (
              <button
                key={option.value}
                onClick={() => onSortByChange(option.value)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 text-center',
                  isActive
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:border-violet-400 hover:text-violet-600'
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
