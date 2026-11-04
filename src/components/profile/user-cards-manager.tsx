'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Chevron } from '@/components/shared/glyph'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface UserCard {
  id: string
  card_name: string
  bank_name: string
  card_type: string
  last_four_digits: string | null
  is_active: boolean
  added_at: string
  notes: string | null
}

export function UserCardsManager() {
  const router = useRouter()
  const [cards, setCards] = useState<UserCard[]>([])
  const [catalogCards, setCatalogCards] = useState<Array<{ value: string; label: string; bank: string }>>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [cardName, setCardName] = useState('')
  const [bankName, setBankName] = useState('')
  const notes = ''
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [isManualEntry, setIsManualEntry] = useState(false)

  const fetchCards = useCallback(async () => {
    try {
      const [userCardsResponse, catalogResponse] = await Promise.all([
        fetch('/api/cards/user', { cache: 'no-store' }),
        fetch('/api/cards?fields=summary&limit=200', { cache: 'no-store' }),
      ])
      const userCardsData = await userCardsResponse.json()
      const catalogData = await catalogResponse.json()
      setCards(userCardsData.cards || [])
      setCatalogCards(
        (catalogData.cards || [])
          .map((card: { id: string; card_name: string; bank_name: string }) => ({
            value: card.id,
            label: card.card_name,
            bank: card.bank_name,
          }))
          .sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label))
      )
    } catch {
      setCards([])
      setCatalogCards([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const resetForm = () => {
    setCardName('')
    setBankName('')
    setIsManualEntry(false)
  }

  const handleAdd = async () => {
    if (!cardName.trim() || !bankName.trim()) {
      toast.error('Choose a card, or enter its name and bank')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/cards/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_name: cardName.trim(),
          bank_name: bankName.trim(),
          card_type: 'credit',
          notes: notes.trim() || '',
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message || 'Unable to add the card. Check your connection and try again.')
      }

      setDialogOpen(false)
      resetForm()
      await fetchCards()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add the card. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Remove at once and offer Undo, instead of asking first.
  const handleDelete = async (card: UserCard) => {
    setDeletingId(card.id)
    try {
      const res = await fetch(`/api/cards/user?id=${card.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      await fetchCards()
      router.refresh()
      toast(`${card.card_name} removed`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            await fetch('/api/cards/user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ card_name: card.card_name, bank_name: card.bank_name, card_type: 'credit', notes: card.notes || '' }),
            })
            await fetchCards()
            router.refresh()
          },
        },
      })
    } catch {
      toast.error('Unable to remove the card. Check your connection and try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const addCardDialog = (
    <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
      <DialogTrigger asChild>
        <Button size="sm" variant={cards.length === 0 ? 'default' : 'outline'}>
          Add card
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-2rem)]">
        <DialogHeader>
          <DialogTitle>Add card</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Card Name - Searchable Combobox */}
          {!isManualEntry ? (
            <div className="grid gap-2">
              <Label>Card</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="h-10 justify-between rounded-xl font-normal"
                  >
                    <span className={cardName ? 'text-foreground' : 'text-muted-foreground'}>
                      {cardName || 'Choose a card'}
                    </span>
                    <Chevron className="ml-2 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search cards" />
                    <CommandList>
                      <CommandEmpty>No card found.</CommandEmpty>
                      <CommandGroup>
                        {catalogCards.map((card) => (
                          <CommandItem
                            key={card.value}
                            value={card.label}
                            onSelect={() => {
                              setCardName(card.label)
                              setBankName(card.bank)
                              setComboboxOpen(false)
                            }}
                          >
                            <div>
                              <p className="text-sm font-medium">{card.label}</p>
                              <p className="text-xs text-muted-foreground">{card.bank}</p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandGroup>
                        <CommandItem
                          value="__manual_entry__"
                          onSelect={() => {
                            setIsManualEntry(true)
                            setCardName('')
                            setBankName('')
                            setComboboxOpen(false)
                          }}
                        >
                          <p className="text-sm text-muted-foreground">Can&apos;t find your card? Enter manually</p>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="card-name-manual">Card</Label>
                  <button
                    type="button"
                    onClick={() => { setIsManualEntry(false); setCardName(''); setBankName('') }}
                    className="text-[0.65rem] text-primary hover:underline"
                  >
                    Search from list
                  </button>
                </div>
                <Input
                  id="card-name-manual"
                  placeholder="HDFC Regalia"
                  className="h-10"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bank-name-manual">Bank</Label>
                <Input
                  id="bank-name-manual"
                  placeholder="HDFC Bank"
                  className="h-10"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Bank (read-only when selected from catalog) */}
          {!isManualEntry && bankName && (
            <div className="grid gap-2">
              <Label>Bank</Label>
              <Input value={bankName} readOnly className="h-10 text-muted-foreground" />
            </div>
          )}

        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => { setDialogOpen(false); resetForm() }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={submitting || !cardName.trim() || !bankName.trim()}
          >
            {submitting ? 'Adding…' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return (
      <div className="space-y-2 py-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">No cards yet</p>
        {addCardDialog}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ul>
        {cards.map((card) => (
          <li key={card.id} className="row justify-between py-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{card.card_name}</p>
                <p className="text-xs text-muted-foreground">{card.bank_name}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label={`Remove ${card.card_name}`}
              className="tap text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              onClick={() => handleDelete(card)}
              disabled={deletingId === card.id}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {addCardDialog}
    </div>
  )
}
