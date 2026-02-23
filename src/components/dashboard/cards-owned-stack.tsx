'use client'

import Link from 'next/link'
import { CreditCard } from 'lucide-react'

interface CardSummary {
  id: string
  card_name: string
  bank_name: string
}

interface CardsOwnedStackProps {
  cards: CardSummary[]
}

const BANK_COLORS: Record<string, { from: string; to: string }> = {
  'HDFC Bank': { from: '#004B87', to: '#002D62' },
  'ICICI Bank': { from: '#F37020', to: '#B24300' },
  'State Bank of India (SBI)': { from: '#22409A', to: '#1A2F6F' },
  'Axis Bank': { from: '#97144D', to: '#6B0F38' },
  'Kotak Mahindra Bank': { from: '#ED1C24', to: '#B01018' },
  'American Express (Amex)': { from: '#006FCF', to: '#004E94' },
  'IndusInd Bank': { from: '#174A7C', to: '#0E3054' },
  'Yes Bank': { from: '#0066B3', to: '#004378' },
  'IDFC First Bank': { from: '#9C1D26', to: '#6E141A' },
  'RBL Bank': { from: '#E31E24', to: '#A8161B' },
  'AU Small Finance Bank': { from: '#EC6608', to: '#B04D06' },
  'Federal Bank': { from: '#003DA6', to: '#002B75' },
}
const DEFAULT_COLOR = { from: '#6B7280', to: '#374151' }

function getRotation(index: number, total: number) {
  const spread = 8
  const offset = ((total - 1) / 2) * spread
  return index * spread - offset
}

export function CardsOwnedStack({ cards }: CardsOwnedStackProps) {
  const maxVisible = 5
  const visible = cards.slice(0, maxVisible)
  const remaining = cards.length - maxVisible

  if (cards.length === 0) {
    return (
      <Link
        href="/profile"
        className="dash-card relative overflow-hidden p-6 block group transition-all hover:ring-2 hover:ring-[#d4a017]/30"
      >
        <div className="flex items-center justify-between">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Cards Owned
          </p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500">
            <CreditCard className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 mb-3">
            <CreditCard className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">No cards added</p>
          <span className="mt-1 text-xs font-medium text-[#b8860b] group-hover:underline">
            Add your first card
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href="/profile"
      className="dash-card relative overflow-hidden p-6 block group transition-all hover:ring-2 hover:ring-[#d4a017]/30"
    >
      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Cards Owned
        </p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500">
          <CreditCard className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Fan of cards */}
      <div className="relative mt-4 flex items-end justify-center" style={{ height: '100px' }}>
        {visible.map((card, i) => {
          const rotation = getRotation(i, visible.length)
          const colors = BANK_COLORS[card.bank_name] || DEFAULT_COLOR
          return (
            <div
              key={card.id}
              className="absolute rounded-lg shadow-md border border-white/20 p-2 flex flex-col justify-between"
              style={{
                width: '110px',
                height: '70px',
                background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'bottom center',
                zIndex: i,
                bottom: '0px',
              }}
            >
              <p className="text-[0.5rem] font-semibold text-white/90 truncate leading-tight">
                {card.card_name}
              </p>
              <p className="text-[0.45rem] text-white/60 truncate">{card.bank_name}</p>
            </div>
          )
        })}
      </div>

      {/* Count */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-2xl font-bold tabular-nums text-foreground">
          {cards.length}
        </p>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            card{cards.length !== 1 ? 's' : ''}
          </p>
          {remaining > 0 && (
            <p className="text-[0.6rem] text-muted-foreground/70">+{remaining} more</p>
          )}
        </div>
      </div>
    </Link>
  )
}
