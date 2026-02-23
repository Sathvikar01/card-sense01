'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, CreditCard, Loader2, Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { LOCAL_CARD_CATALOG } from '@/lib/cards/local-catalog'

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

const CATALOG_CARDS = LOCAL_CARD_CATALOG
  .map((c) => ({
    value: c.id,
    label: c.card_name,
    bank: c.bank_name,
  }))
  .sort((a, b) => a.label.localeCompare(b.label))

export function UserCardsManager() {
  const [cards, setCards] = useState<UserCard[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [cardName, setCardName] = useState('')
  const [bankName, setBankName] = useState('')
  const [notes, setNotes] = useState('')
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [isManualEntry, setIsManualEntry] = useState(false)

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch('/api/cards/user')
      const data = await res.json()
      setCards(data.cards || [])
    } catch {
      setCards([])
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
    setNotes('')
    setIsManualEntry(false)
  }

  const handleAdd = async () => {
    if (!cardName.trim() || !bankName.trim()) {
      toast.error('Card name and bank are required')
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
        throw new Error((err as { message?: string }).message || 'Failed to add card')
      }

      toast.success('Card added successfully')
      setDialogOpen(false)
      resetForm()
      fetchCards()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add card')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/cards/user?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Card removed')
        fetchCards()
      } else {
        toast.error('Failed to remove card')
      }
    } catch {
      toast.error('Error removing card')
    } finally {
      setDeletingId(null)
    }
  }

  const addCardDialog = (
    <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white shadow-sm hover:shadow-md"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Card
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Card</DialogTitle>
          <DialogDescription>Add a credit card you currently own</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Card Name - Searchable Combobox */}
          {!isManualEntry ? (
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">
                Card Name <span className="text-red-500">*</span>
              </Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="h-10 justify-between font-normal"
                  >
                    <span className={cardName ? 'text-foreground' : 'text-muted-foreground'}>
                      {cardName || 'Search for a card...'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search cards..." />
                    <CommandList>
                      <CommandEmpty>No card found.</CommandEmpty>
                      <CommandGroup>
                        {CATALOG_CARDS.map((card) => (
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
                  <Label htmlFor="card-name-manual" className="text-xs text-muted-foreground">
                    Card Name <span className="text-red-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => { setIsManualEntry(false); setCardName(''); setBankName('') }}
                    className="text-[0.65rem] text-[#b8860b] hover:underline"
                  >
                    Search from list
                  </button>
                </div>
                <Input
                  id="card-name-manual"
                  placeholder="e.g., HDFC Regalia"
                  className="h-10"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bank-name-manual" className="text-xs text-muted-foreground">
                  Bank <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bank-name-manual"
                  placeholder="e.g., HDFC Bank"
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
              <Label className="text-xs text-muted-foreground">Bank</Label>
              <Input value={bankName} readOnly className="h-10 bg-muted/30 text-muted-foreground" />
            </div>
          )}

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="card-notes" className="text-xs text-muted-foreground">Notes</Label>
            <Input
              id="card-notes"
              placeholder="Optional notes"
              className="h-10"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
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
            className="gap-1.5 bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {submitting ? 'Adding...' : 'Add Card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b8860b]/10 to-[#d4a017]/10 mb-4">
          <CreditCard className="h-7 w-7 text-[#d4a017]/50" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No cards added yet</p>
        <p className="text-xs text-muted-foreground mb-5 max-w-xs">
          Add your existing credit cards to get better recommendations and track your portfolio
        </p>
        {addCardDialog}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {cards.length} card{cards.length !== 1 ? 's' : ''} in your wallet
        </p>
        {addCardDialog}
      </div>

      {/* Card list */}
      <div className="space-y-2">
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between rounded-xl border border-border/50 p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#b8860b]/10 to-[#d4a017]/10">
                <CreditCard className="h-5 w-5 text-[#b8860b]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{card.card_name}</p>
                <p className="text-xs text-muted-foreground">{card.bank_name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(card.id)}
              disabled={deletingId === card.id}
            >
              {deletingId === card.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
