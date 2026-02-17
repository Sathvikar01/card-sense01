import { cn } from '@/lib/utils'

interface CardSenseLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'icon' | 'full'
  dark?: boolean
}

const sizes = {
  sm: { icon: 28, text: 'text-base' },
  md: { icon: 36, text: 'text-lg' },
  lg: { icon: 44, text: 'text-xl' },
  xl: { icon: 56, text: 'text-2xl' },
}

export function CardSenseLogo({ className, size = 'md', variant = 'full', dark = false }: CardSenseLogoProps) {
  const s = sizes[size]

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <CardSenseIcon size={s.icon} dark={dark} />
      {variant === 'full' && (
        <span className={cn(s.text, 'font-bold tracking-tight', dark ? 'text-white' : 'text-foreground')}>
          Card<span className={dark ? 'text-violet-300' : 'text-gradient-primary'}>Sense</span>
        </span>
      )}
    </span>
  )
}

export function CardSenseIcon({ size = 36, dark = false, className }: { size?: number; dark?: boolean; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cs-card-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="cs-accent-grad" x1="18" y1="14" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#ede9fe" />
        </linearGradient>
        <linearGradient id="cs-pulse-grad" x1="20" y1="20" x2="40" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5f3ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0.6" />
        </linearGradient>
        <filter id="cs-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Card body - rounded rectangle, slightly rotated for dynamism */}
      <rect
        x="4"
        y="8"
        width="40"
        height="32"
        rx="8"
        fill="url(#cs-card-grad)"
      />

      {/* Subtle top shine */}
      <rect
        x="4"
        y="8"
        width="40"
        height="12"
        rx="8"
        fill="white"
        opacity="0.08"
      />

      {/* Chip - custom geometric, not a standard icon */}
      <rect x="10" y="18" width="10" height="7" rx="1.5" fill="url(#cs-accent-grad)" opacity="0.85" />
      <line x1="12.5" y1="18" x2="12.5" y2="25" stroke="#7c3aed" strokeWidth="0.5" opacity="0.3" />
      <line x1="17.5" y1="18" x2="17.5" y2="25" stroke="#7c3aed" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="21.5" x2="20" y2="21.5" stroke="#7c3aed" strokeWidth="0.5" opacity="0.3" />

      {/* Pulse / sense waves - three arcs emanating from right side */}
      <g filter="url(#cs-glow)" opacity="0.9">
        <path
          d="M30 24 Q33 19, 37 18"
          stroke="url(#cs-pulse-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M30 24 Q34 22, 40 22"
          stroke="url(#cs-pulse-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M30 24 Q33 29, 37 30"
          stroke="url(#cs-pulse-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Core sense dot */}
      <circle cx="30" cy="24" r="2.5" fill="white" opacity="0.95" />
      <circle cx="30" cy="24" r="1.2" fill="#7c3aed" opacity="0.7" />

      {/* Card number dots row */}
      <g opacity="0.35">
        <circle cx="12" cy="31" r="1" fill="white" />
        <circle cx="15.5" cy="31" r="1" fill="white" />
        <circle cx="19" cy="31" r="1" fill="white" />
        <circle cx="22.5" cy="31" r="1" fill="white" />
        <circle cx="28" cy="31" r="1" fill="white" />
        <circle cx="31.5" cy="31" r="1" fill="white" />
        <circle cx="35" cy="31" r="1" fill="white" />
        <circle cx="38.5" cy="31" r="1" fill="white" />
      </g>

      {/* Bottom edge highlight */}
      <rect x="4" y="36" width="40" height="4" rx="4" fill="black" opacity="0.1" />
    </svg>
  )
}
