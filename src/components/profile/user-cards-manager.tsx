'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, CreditCard, Loader2, Check } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

const POPULAR_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India (SBI)',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Yes Bank',
  'IDFC First Bank',
  'RBL Bank',
  'Standard Chartered',
  'HSBC',
  'Citibank',
  'American Express',
  'Other',
]

const CARD_TYPE_LABELS: Record<string, string> = {
  credit: 'Credit',
  debit: 'Debit',
  prepaid: 'Prepaid',
}

const CARD_TYPE_COLORS: Record<string, string> = {
  credit: 'bg-amber-100 text-amber-800',
  debit: 'bg-emerald-100 text-emerald-800',
  prepaid: 'bg-blue-100 text-blue-800',
}

export function UserCardsManager() {
  const [cards, setCards] = useState<UserCard[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [cardName, setCardName] = useState('')
  const [bankName, setBankName] = useState('')
  const [cardType, setCardType] = useState('credit')
  const [lastFour, setLastFour] = useState('')
  const [notes, setNotes] = useState('')

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
    setCardType('credit')
    setLastFour('')
    setNotes('')
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
          card_type: cardType,
          last_four_digits: lastFour || '',
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
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
          <DialogDescription>Add a credit or debit card you currently own</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="card-name" className="text-xs text-muted-foreground">
                Card Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="card-name"
                placeholder="e.g., HDFC Regalia"
                className="h-10"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bank-name" className="text-xs text-muted-foreground">
                Bank <span className="text-red-500">*</span>
              </Label>
              <Select value={bankName} onValueChange={setBankName}>
                <SelectTrigger id="bank-name" className="h-10">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="card-type" className="text-xs text-muted-foreground">Card Type</Label>
              <Select value={cardType} onValueChange={setCardType}>
                <SelectTrigger id="card-type" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="debit">Debit Card</SelectItem>
                  <SelectItem value="prepaid">Prepaid Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-four" className="text-xs text-muted-foreground">Last 4 Digits</Label>
              <Input
                id="last-four"
                placeholder="e.g., 1234"
                className="h-10"
                maxLength={4}
                value={lastFour}
                onChange={(e) => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            </div>
          </div>
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
            disabled={submitting}
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
          Add your existing credit and debit cards to get better recommendations and track your portfolio
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
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate text-foreground">{card.card_name}</p>
                  <span className={`text-[0.6rem] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${CARD_TYPE_COLORS[card.card_type] || CARD_TYPE_COLORS.credit}`}>
                    {CARD_TYPE_LABELS[card.card_type] || 'Credit'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.bank_name}
                  {card.last_four_digits && ` \u2022\u2022\u2022\u2022 ${card.last_four_digits}`}
                </p>
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
