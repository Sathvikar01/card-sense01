'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CardGrid } from '@/components/cards/card-grid'
import { CardFilters } from '@/components/cards/card-filters'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { CreditCardListItem } from '@/types/credit-card'

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
        params.set('limit', '200')
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

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative shrink-0">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 max-h-[80vh] overflow-y-auto">
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
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading cards…' : (
            <>
              Showing <span className="font-semibold text-foreground">{cards.length}</span> card{cards.length !== 1 ? 's' : ''}
              {activeFiltersCount > 0 && ' (filtered)'}
            </>
          )}
        </p>
      </div>

      <div>
        <CardGrid cards={cards} loading={loading} />
      </div>
    </div>
  )
}
