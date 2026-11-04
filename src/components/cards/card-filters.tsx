import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { INDIAN_BANKS } from '@/lib/constants/banks'

const CARD_TYPES = [
  { value: 'entry_level', label: 'Entry level' },
  { value: 'cashback', label: 'Cashback' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'travel', label: 'Travel' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'premium', label: 'Premium' },
  { value: 'super_premium', label: 'Super premium' },
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
  { value: '500', label: 'Up to ₹500' },
  { value: '1000', label: 'Up to ₹1,000' },
  { value: '2500', label: 'Up to ₹2,500' },
  { value: '5000', label: 'Up to ₹5,000' },
  { value: '10000', label: 'Up to ₹10,000' },
  { value: '999999', label: 'Any' },
]

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popular' },
  { value: 'fee_low', label: 'Lowest fee' },
  { value: 'fee_high', label: 'Highest fee' },
  { value: 'reward_high', label: 'Highest rewards' },
  { value: 'name', label: 'Name' },
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
}: CardFiltersProps) {
  return (
    <div className="p-5 space-y-6">
      {/* Bank */}
      <div className="space-y-2.5">
        <p className="text-sm font-medium">Bank</p>
        <Select value={bank || 'all'} onValueChange={onBankChange}>
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="All banks" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All banks</SelectItem>
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
        <p className="text-sm font-medium">Type</p>
        <ToggleGroup
          type="single"
          aria-label="Type"
          value={cardType || ''}
          onValueChange={(value) => onCardTypeChange(value || 'all')}
        >
          {CARD_TYPES.map((type) => (
            <ToggleGroupItem key={type.value} value={type.value}>
              {type.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Card Network */}
      <div className="space-y-2.5">
        <p className="text-sm font-medium">Network</p>
        <ToggleGroup
          type="single"
          aria-label="Network"
          value={network || ''}
          onValueChange={(value) => onNetworkChange(value || 'all')}
        >
          {NETWORK_OPTIONS.map((option) => (
            <ToggleGroupItem key={option.value} value={option.value}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Max Annual Fee */}
      <div className="space-y-2.5">
        <p className="text-sm font-medium">Annual fee</p>
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
        <p className="text-sm font-medium">Sort</p>
        <Select value={sortBy || 'popularity'} onValueChange={onSortByChange}>
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Popular" />
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
