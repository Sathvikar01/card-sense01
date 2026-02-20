import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { INDIAN_BANKS } from '@/lib/constants/banks'
import { Building2, CreditCard, Wallet, ArrowUpDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const NETWORK_OPTIONS = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'rupay', label: 'RuPay' },
  { value: 'amex', label: 'Amex' },
  { value: 'diners', label: 'Diners Club' },
]

const MAX_FEE_OPTIONS = [
  { value: '0', label: 'Free' },
  { value: '500', label: 'Up to Rs. 500' },
  { value: '1000', label: 'Up to Rs. 1,000' },
  { value: '2500', label: 'Up to Rs. 2,500' },
  { value: '5000', label: 'Up to Rs. 5,000' },
  { value: '10000', label: 'Up to Rs. 10,000' },
  { value: '999999', label: 'Any' },
]

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'fee_low', label: 'Fee: Low to High' },
  { value: 'fee_high', label: 'Fee: High to Low' },
  { value: 'reward_high', label: 'Rewards: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
]

interface CardFiltersProps {
  bank: string
  cardType: string
  network: string
  maxFee: string
  sortBy: string
  onBankChange: (value: string) => void
  onCardTypeChange: (value: string) => void
  onNetworkChange: (value: string) => void
  onMaxFeeChange: (value: string) => void
  onSortByChange: (value: string) => void
  onClearFilters: () => void
}

export function CardFilters({
  bank,
  cardType,
  network,
  maxFee,
  sortBy,
  onBankChange,
  onCardTypeChange,
  onNetworkChange,
  onMaxFeeChange,
  onSortByChange,
  onClearFilters,
}: CardFiltersProps) {
  return (
    <div className="p-5 space-y-6">
      {/* Bank */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Building2 className="h-3.5 w-3.5" />
          Bank
        </label>
        <Select value={bank || 'all'} onValueChange={onBankChange}>
          <SelectTrigger className="h-10 text-sm">
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

      {/* Card Type */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <CreditCard className="h-3.5 w-3.5" />
          Card Type
        </label>
        <div className="flex flex-wrap gap-2">
          {CARD_TYPES.map((type) => {
            const isActive = cardType === type.value
            return (
              <button
                key={type.value}
                onClick={() => onCardTypeChange(isActive ? 'all' : type.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
                  isActive
                    ? 'bg-foreground text-background border-foreground shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
                )}
              >
                {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Card Network */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Globe className="h-3.5 w-3.5" />
          Card Network
        </label>
        <div className="flex flex-wrap gap-2">
          {NETWORK_OPTIONS.map((option) => {
            const isActive = network === option.value
            return (
              <button
                key={option.value}
                onClick={() => onNetworkChange(isActive ? 'all' : option.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
                  isActive
                    ? 'bg-foreground text-background border-foreground shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Max Annual Fee */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Wallet className="h-3.5 w-3.5" />
          Max Annual Fee
        </label>
        <Select value={maxFee || 'all'} onValueChange={onMaxFeeChange}>
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Any</SelectItem>
              {MAX_FEE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <ArrowUpDown className="h-3.5 w-3.5" />
          Sort By
        </label>
        <Select value={sortBy || 'popularity'} onValueChange={onSortByChange}>
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Most Popular" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
