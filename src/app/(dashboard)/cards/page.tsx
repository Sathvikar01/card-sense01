'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CardGrid } from '@/components/cards/card-grid'
import { CardFilters } from '@/components/cards/card-filters'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import type { CreditCardListItem } from '@/types/credit-card'

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'fee_low', label: 'Fee: Low to High' },
  { value: 'fee_high', label: 'Fee: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
]

export default function CardsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [cards, setCards] = useState<CreditCardListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [bank, setBank] = useState(searchParams.get('bank') || '')
  const [cardType, setCardType] = useState(searchParams.get('type') || '')
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'popularity')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '')

  const abortRef = useRef<AbortController | null>(null)
  const responseCacheRef = useRef<Map<string, CreditCardListItem[]>>(new Map())

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 300)

    return () => window.clearTimeout(timer)
  }, [search])

  const normalizedFilters = useMemo(() => {
    const normalize = (value: string) => (value === 'all' ? '' : value)

    return {
      search: debouncedSearch,
      bank: normalize(bank),
      cardType: normalize(cardType),
      maxFee: normalize(maxFee),
      sortBy: sortBy || 'popularity',
    }
  }, [bank, cardType, debouncedSearch, maxFee, sortBy])

  useEffect(() => {
    const cacheKey = JSON.stringify(normalizedFilters)

    const fetchCards = async () => {
      const cachedCards = responseCacheRef.current.get(cacheKey)
      if (cachedCards) {
        setCards(cachedCards)
        setLoading(false)
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (normalizedFilters.search) params.set('search', normalizedFilters.search)
        if (normalizedFilters.bank) params.set('bank', normalizedFilters.bank)
        if (normalizedFilters.cardType) params.set('type', normalizedFilters.cardType)
        if (normalizedFilters.maxFee) params.set('maxFee', normalizedFilters.maxFee)
        if (normalizedFilters.sortBy) params.set('sortBy', normalizedFilters.sortBy)
        params.set('fields', 'summary')
        params.set('limit', '60')
        params.set('offset', '0')

        const response = await fetch('/api/cards?' + params.toString(), {
          signal: controller.signal,
        })
        const data = await response.json()

        if (response.ok) {
          const nextCards = (data.cards || []) as CreditCardListItem[]
          responseCacheRef.current.set(cacheKey, nextCards)
          if (responseCacheRef.current.size > 50) {
            const oldestKey = responseCacheRef.current.keys().next().value
            if (oldestKey) {
              responseCacheRef.current.delete(oldestKey)
            }
          }
          setCards(nextCards)
        } else {
          console.error('Failed to fetch cards:', data.error)
          setCards([])
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return
        }
        console.error('Error fetching cards:', error)
        setCards([])
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchCards()

    return () => {
      abortRef.current?.abort()
    }
  }, [normalizedFilters])

  const handleClearFilters = () => {
    setSearch('')
    setBank('')
    setCardType('')
    setMaxFee('')
    setSortBy('popularity')
    router.push('/cards')
  }

  const handleFilterChange = (
    filterType: 'bank' | 'cardType' | 'maxFee',
    value: string
  ) => {
    switch (filterType) {
      case 'bank':
        setBank(value)
        break
      case 'cardType':
        setCardType(value)
        break
      case 'maxFee':
        setMaxFee(value)
        break
    }
  }

  const activeFiltersCount = [bank, cardType, maxFee]
    .filter((value) => Boolean(value) && value !== 'all')
    .length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Browse Credit Cards
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Explore and compare credit cards from top Indian banks
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by card name, bank, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="hidden md:block w-48">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort By</SelectLabel>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <CardFilters
              bank={bank}
              cardType={cardType}
              maxFee={maxFee}
              sortBy={sortBy}
              onBankChange={(value) => handleFilterChange('bank', value)}
              onCardTypeChange={(value) => handleFilterChange('cardType', value)}
              onMaxFeeChange={(value) => handleFilterChange('maxFee', value)}
              onSortByChange={setSortBy}
              onClearFilters={handleClearFilters}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-6">
            <CardFilters
              bank={bank}
              cardType={cardType}
              maxFee={maxFee}
              sortBy={sortBy}
              onBankChange={(value) => handleFilterChange('bank', value)}
              onCardTypeChange={(value) => handleFilterChange('cardType', value)}
              onMaxFeeChange={(value) => handleFilterChange('maxFee', value)}
              onSortByChange={setSortBy}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <CardGrid cards={cards} loading={loading} />
        </div>
      </div>
    </div>
  )
}
