'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CardGrid } from '@/components/cards/card-grid'
import { CardFilters } from '@/components/cards/card-filters'
import { CompareBar } from '@/components/cards/compare-bar'
import { PageHeader } from '@/components/shared/page-header'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { CreditCardListItem } from '@/types/credit-card'

export default function CardsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [cards, setCards] = useState<CreditCardListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [bank, setBank] = useState(searchParams.get('bank') || '')
  const [cardType, setCardType] = useState(searchParams.get('type') || '')
  const [network, setNetwork] = useState(searchParams.get('network') || '')
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
      network: normalize(network),
      maxFee: normalize(maxFee),
      sortBy: sortBy || 'popularity',
    }
  }, [bank, cardType, network, debouncedSearch, maxFee, sortBy])

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
        if (normalizedFilters.network) params.set('network', normalizedFilters.network)
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
    setNetwork('')
    setMaxFee('')
    setSortBy('popularity')
    router.push('/cards')
  }

  const handleFilterChange = (
    filterType: 'bank' | 'cardType' | 'network' | 'maxFee',
    value: string
  ) => {
    switch (filterType) {
      case 'bank':
        setBank(value)
        break
      case 'cardType':
        setCardType(value)
        break
      case 'network':
        setNetwork(value)
        break
      case 'maxFee':
        setMaxFee(value)
        break
    }
  }

  const activeFiltersCount = [bank, cardType, network, maxFee]
    .filter((value) => Boolean(value) && value !== 'all')
    .length

  return (
    <div>
      <PageHeader title="Cards">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              Filter
              {activeFiltersCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-xs font-semibold text-pine">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-full flex-col p-0 sm:w-[380px]">
            <SheetHeader className="flex-row items-center justify-between px-5 pb-0 pt-5">
              <SheetTitle className="text-base font-semibold">Filter</SheetTitle>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="mr-8 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">
              <CardFilters
                bank={bank}
                cardType={cardType}
                network={network}
                maxFee={maxFee}
                sortBy={sortBy}
                onBankChange={(value) => handleFilterChange('bank', value)}
                onCardTypeChange={(value) => handleFilterChange('cardType', value)}
                onNetworkChange={(value) => handleFilterChange('network', value)}
                onMaxFeeChange={(value) => handleFilterChange('maxFee', value)}
                onSortByChange={setSortBy}
              />
            </div>
          </SheetContent>
        </Sheet>
      </PageHeader>

      <div className="mb-8">
        <Input
          type="search"
          name="card-search"
          aria-label="Search cards"
          autoComplete="off"
          placeholder="Search cards or banks"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white"
        />
      </div>

      <CardGrid cards={cards} loading={loading} />
      <CompareBar />
    </div>
  )
}
