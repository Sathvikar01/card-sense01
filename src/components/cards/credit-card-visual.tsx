'use client'

import { cn } from '@/lib/utils'
import { getCardDesign } from '@/data/card-designs'
import { NetworkLogo, ContactlessIcon } from './network-logos'
import { useRef, useState, useCallback } from 'react'

interface CreditCardVisualProps {
  cardId: string
  size?: 'sm' | 'md' | 'lg'
  cardName?: string
  bankName?: string
  interactive?: boolean
  className?: string
}

const sizeConfig = {
  sm: {
    width: 'w-[200px]',
    bank: 'text-[6px]',
    card: 'text-[8px]',
    network: 'h-4 w-auto',
    chip: 'w-6 h-[18px]',
    chipInner: 'inset-[2px]',
    contactless: 'h-2.5 w-2.5',
    px: 'px-3',
    py: 'py-2.5',
    gap: 'gap-0.5',
  },
  md: {
    width: 'w-[280px]',
    bank: 'text-[8px]',
    card: 'text-[11px]',
    network: 'h-5 w-auto',
    chip: 'w-8 h-6',
    chipInner: 'inset-[3px]',
    contactless: 'h-3 w-3',
    px: 'px-4',
    py: 'py-3.5',
    gap: 'gap-1',
  },
  lg: {
    width: 'w-[380px]',
    bank: 'text-[9px]',
    card: 'text-sm',
    network: 'h-6 w-auto',
    chip: 'w-10 h-[30px]',
    chipInner: 'inset-[4px]',
    contactless: 'h-4 w-4',
    px: 'px-6',
    py: 'py-5',
    gap: 'gap-1.5',
  },
}

export function CreditCardVisual({
  cardId,
  size = 'md',
  cardName,
  bankName,
  interactive = false,
  className,
}: CreditCardVisualProps) {
  const design = getCardDesign(cardId, bankName)
  const s = sizeConfig[size]
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      setTransform(`perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`)
    },
    [interactive]
  )

  const handleMouseLeave = useCallback(() => {
    if (!interactive) return
    setTransform('')
  }, [interactive])

  const textColor = design.textColor === 'white' ? 'text-white' : 'text-gray-900'
  const textMuted =
    design.textColor === 'white' ? 'text-white/70' : 'text-gray-600'
  const chipBg =
    design.chipStyle === 'gold'
      ? 'bg-gradient-to-br from-[#d4a574] via-[#f2d06b] to-[#c9953a]'
      : 'bg-gradient-to-br from-[#b8bcc0] via-[#e8eaec] to-[#b8bcc0]'
  const chipBorder =
    design.chipStyle === 'gold'
      ? 'border-[#b8892e]/30'
      : 'border-[#8a8d90]/30'

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: design.gradient,
        transform: transform || undefined,
        transition: transform ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
      }}
      className={cn(
        'credit-card-visual relative select-none overflow-hidden',
        s.width,
        'aspect-[1.586/1] rounded-xl',
        interactive && 'cursor-pointer',
        className
      )}
    >
      {/* Pattern overlay */}
      {design.pattern === 'diagonal' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 4px, currentColor 4px, currentColor 5px)',
          }}
        />
      )}
      {design.pattern === 'wave' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.3) 0%, transparent 60%)',
          }}
        />
      )}
      {design.pattern === 'dots' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 0.5px, transparent 0.5px)',
            backgroundSize: '8px 8px',
          }}
        />
      )}

      {/* Accent stripe */}
      {design.accent && (
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-1"
          style={{ backgroundColor: design.accent }}
        />
      )}

      {/* Subtle top edge shine */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Card content */}
      <div className={cn('relative flex h-full flex-col justify-between', s.px, s.py)}>
        {/* Top row: bank + network */}
        <div className="flex items-start justify-between">
          <span
            className={cn(
              s.bank,
              textColor,
              'font-semibold uppercase tracking-[0.15em] opacity-90'
            )}
          >
            {design.bankLabel}
          </span>
          <NetworkLogo network={design.network} className={cn(s.network, textColor)} />
        </div>

        {/* Middle: EMV chip */}
        {size !== 'sm' && (
          <div className="flex items-center">
            <div className={cn('relative rounded', s.chip, chipBg)}>
              <div
                className={cn(
                  'absolute rounded-sm border',
                  s.chipInner,
                  chipBorder
                )}
              />
            </div>
          </div>
        )}

        {/* Bottom row: card name + contactless */}
        <div className="flex items-end justify-between">
          <div className={s.gap}>
            <p
              className={cn(
                s.card,
                textColor,
                'font-bold tracking-[0.08em]'
              )}
            >
              {cardName || design.cardLabel}
            </p>
          </div>
          <ContactlessIcon className={cn(s.contactless, textMuted)} />
        </div>
      </div>
    </div>
  )
}
