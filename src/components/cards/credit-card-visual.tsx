'use client'

import { cn } from '@/lib/utils'
import { getCardDesign } from '@/data/card-designs'
import { NetworkLogo, ContactlessIcon } from './network-logos'
import { useRef, useState, useCallback, useMemo } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface CreditCardVisualProps {
  cardId: string
  size?: 'sm' | 'md' | 'lg'
  cardName?: string
  bankName?: string
  interactive?: boolean
  className?: string
  enableFlip?: boolean
}

const sizeConfig = {
  sm: {
    width: 'w-[200px]',
    bank: 'text-[6px]',
    card: 'text-[8px]',
    number: 'text-[7px]',
    network: 'h-4 w-auto',
    chip: 'w-6 h-[18px]',
    chipInner: 'inset-[2px]',
    contactless: 'h-2.5 w-2.5',
    px: 'px-3',
    py: 'py-2.5',
    gap: 'gap-0.5',
  },
  md: {
    width: 'w-[300px]',
    bank: 'text-[8px]',
    card: 'text-[11px]',
    number: 'text-[10px]',
    network: 'h-5 w-auto',
    chip: 'w-9 h-[26px]',
    chipInner: 'inset-[3px]',
    contactless: 'h-3.5 w-3.5',
    px: 'px-5',
    py: 'py-4',
    gap: 'gap-1',
  },
  lg: {
    width: 'w-[400px]',
    bank: 'text-[10px]',
    card: 'text-sm',
    number: 'text-xs',
    network: 'h-7 w-auto',
    chip: 'w-11 h-[32px]',
    chipInner: 'inset-[4px]',
    contactless: 'h-4 w-4',
    px: 'px-7',
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
  enableFlip = false,
}: CreditCardVisualProps) {
  const design = getCardDesign(cardId, bankName)
  const s = sizeConfig[size]
  const cardRef = useRef<HTMLDivElement>(null)
  const [isFlipped, setIsFlipped] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig)

  const sheenX = useTransform(mouseX, [-0.5, 0.5], [0, 100])
  const sheenY = useTransform(mouseY, [-0.5, 0.5], [0, 100])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
    },
    [interactive, mouseX, mouseY]
  )

  const handleMouseLeave = useCallback(() => {
    if (!interactive) return
    mouseX.set(0)
    mouseY.set(0)
  }, [interactive, mouseX, mouseY])

  const handleClick = useCallback(() => {
    if (enableFlip) setIsFlipped((prev) => !prev)
  }, [enableFlip])

  const textColor = design.textColor === 'white' ? 'text-white' : 'text-gray-900'
  const textMuted = design.textColor === 'white' ? 'text-white/60' : 'text-gray-500'
  const textSubtle = design.textColor === 'white' ? 'text-white/40' : 'text-gray-400'

  const chipGradient =
    design.chipStyle === 'gold'
      ? 'linear-gradient(145deg, #d4a574 0%, #f2d06b 30%, #e8c252 50%, #c9953a 70%, #f2d06b 100%)'
      : 'linear-gradient(145deg, #c0c4c8 0%, #e8eaec 30%, #dcdfe2 50%, #b8bcc0 70%, #e8eaec 100%)'

  const chipContactLines = design.chipStyle === 'gold' ? 'rgba(180, 140, 50, 0.4)' : 'rgba(140, 145, 150, 0.4)'

  const isPremium = useMemo(() => {
    const premiumKeywords = ['black', 'platinum', 'gold', 'regalia', 'sapphiro', 'legend', 'diners']
    const id = cardId.toLowerCase()
    return premiumKeywords.some((k) => id.includes(k))
  }, [cardId])

  const cardFront = (
    <div
      style={{ background: design.gradient }}
      className={cn(
        'credit-card-visual relative h-full w-full select-none overflow-hidden rounded-xl',
        isPremium && 'card-holographic'
      )}
    >
      {/* Subtle noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Pattern overlay */}
      {design.pattern === 'diagonal' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 4px, currentColor 4px, currentColor 5px)',
          }}
        />
      )}
      {design.pattern === 'wave' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.35) 0%, transparent 60%)',
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
          className="pointer-events-none absolute right-0 top-0 h-full w-1.5"
          style={{
            background: `linear-gradient(180deg, ${design.accent}88, ${design.accent}, ${design.accent}88)`,
          }}
        />
      )}

      {/* Top edge shine */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {/* Left edge shine */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-white/15 via-white/5 to-transparent" />

      {/* Light reflection overlay - follows mouse */}
      {interactive && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background: useTransform(
              [sheenX, sheenY],
              ([x, y]) =>
                `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
            ),
          }}
        />
      )}

      {/* Card content */}
      <div className={cn('relative z-10 flex h-full flex-col justify-between', s.px, s.py)}>
        {/* Top row: bank + network */}
        <div className="flex items-start justify-between">
          <span
            className={cn(
              s.bank,
              textColor,
              'font-bold uppercase tracking-[0.18em] opacity-95'
            )}
          >
            {design.bankLabel}
          </span>
          <NetworkLogo network={design.network} className={cn(s.network, textColor)} />
        </div>

        {/* Middle: EMV chip with realistic contacts */}
        {size !== 'sm' && (
          <div className="flex items-center gap-2">
            <div
              className={cn('relative rounded-md', s.chip)}
              style={{ background: chipGradient }}
            >
              {/* Chip contact pads */}
              <div
                className="absolute inset-[2px] rounded-sm"
                style={{
                  background: `
                    linear-gradient(90deg, transparent 45%, ${chipContactLines} 45%, ${chipContactLines} 55%, transparent 55%),
                    linear-gradient(0deg, transparent 30%, ${chipContactLines} 30%, ${chipContactLines} 35%, transparent 35%, transparent 65%, ${chipContactLines} 65%, ${chipContactLines} 70%, transparent 70%)
                  `,
                }}
              />
              {/* Chip center pad */}
              <div
                className="absolute left-1/2 top-1/2 h-[40%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-[1px]"
                style={{
                  background: design.chipStyle === 'gold'
                    ? 'linear-gradient(135deg, #e8c252, #f2d06b)'
                    : 'linear-gradient(135deg, #d0d3d6, #e8eaec)',
                  boxShadow: `inset 0 0 1px ${chipContactLines}`,
                }}
              />
            </div>
            <ContactlessIcon className={cn(s.contactless, textMuted)} />
          </div>
        )}

        {/* Card number (placeholder) */}
        {size === 'lg' && (
          <div className={cn('flex items-center gap-3', textSubtle)}>
            <span className={cn(s.number, 'tracking-[0.2em] font-light')}>
              ****
            </span>
            <span className={cn(s.number, 'tracking-[0.2em] font-light')}>
              ****
            </span>
            <span className={cn(s.number, 'tracking-[0.2em] font-light')}>
              ****
            </span>
            <span className={cn(s.number, 'tracking-[0.2em] font-light')}>
              ****
            </span>
          </div>
        )}

        {/* Bottom row: card name + valid thru */}
        <div className="flex items-end justify-between">
          <div className={s.gap}>
            {size !== 'sm' && (
              <p className={cn('text-[6px] tracking-[0.12em] uppercase', textSubtle)}>
                CARDHOLDER NAME
              </p>
            )}
            <p
              className={cn(
                s.card,
                textColor,
                'font-bold tracking-[0.1em]'
              )}
            >
              {cardName || design.cardLabel}
            </p>
          </div>
          {size !== 'sm' && (
            <div className="text-right">
              <p className={cn('text-[5px] tracking-[0.1em] uppercase', textSubtle)}>
                VALID THRU
              </p>
              <p className={cn('text-[8px] tracking-[0.1em]', textMuted)}>
                12/29
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const cardBack = enableFlip ? (
    <div
      style={{ background: design.gradient }}
      className="credit-card-visual relative h-full w-full select-none overflow-hidden rounded-xl"
    >
      {/* Magnetic stripe */}
      <div className="mt-[12%] h-[18%] w-full bg-gradient-to-b from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]" />

      {/* Signature strip */}
      <div className="mx-[8%] mt-[8%] flex items-center">
        <div className="h-[28px] flex-1 rounded-sm bg-gradient-to-r from-white/90 to-white/80">
          <div
            className="h-full w-full opacity-30"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 2px, #ccc 2px, #ccc 3px)',
            }}
          />
        </div>
        <div className="ml-2 rounded bg-white/90 px-2 py-1 text-[8px] font-bold text-gray-800">
          CVV
        </div>
      </div>

      {/* Bank info */}
      <div className="absolute bottom-[10%] left-[8%] right-[8%]">
        <p className={cn('text-[6px] leading-relaxed', textMuted)}>
          This card is property of {design.bankLabel}. If found, please return to the nearest branch.
        </p>
      </div>
    </div>
  ) : null

  if (!interactive) {
    return (
      <div className={cn(s.width, 'aspect-[1.586/1]', className)}>
        {cardFront}
      </div>
    )
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        perspective: 800,
        transformStyle: 'preserve-3d',
      }}
      className={cn(s.width, 'aspect-[1.586/1]', interactive && 'cursor-pointer', className)}
    >
      <motion.div
        style={{
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="relative h-full w-full"
      >
        {/* Front */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {cardFront}
        </div>

        {/* Back */}
        {enableFlip && cardBack && (
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {cardBack}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
