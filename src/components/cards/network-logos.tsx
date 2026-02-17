interface LogoProps {
  className?: string
}

export function VisaLogo({ className = 'h-6 w-auto' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 26" fill="none" className={className} aria-label="Visa">
      <path
        d="M33.6 1L27.2 25h-5.8L27.8 1h5.8zm23.4 15.5l3-8.4 1.8 8.4h-4.8zM62.4 25h5.4L63 1h-4.8c-1.1 0-2 .6-2.4 1.6L47.6 25h5.6l1.1-3.1h6.8l.7 3.1h-.4zM44.4 17.4c0-6.4-8.8-6.8-8.8-9.6 0-.8.8-1.8 2.6-2s4.6-.4 6.6 1l1.2-5.4C44.8.6 43 .2 41 0c-5.2 0-9 2.8-9 6.8 0 3 2.6 4.6 4.6 5.6 2 1 2.8 1.6 2.8 2.6 0 1.4-1.6 2-3.2 2-2.8 0-4.4-.6-6.4-1.6l-1.2 5.4c1.4.6 4.2 1.2 7 1.2 5.6 0 9.2-2.8 9.2-7h-.4zM21.8 1L13 25H7.2L2.8 5.4C2.6 4.4 2.2 4 1.4 3.4 0 2.6 0 2.4 0 2.4l.2-.4h9c1.2 0 2.2.8 2.4 2.2l2.2 11.8L19.6 1h5.8l-3.6.2V1z"
        fill="currentColor"
      />
    </svg>
  )
}

export function MastercardLogo({ className = 'h-6 w-auto' }: LogoProps) {
  return (
    <svg viewBox="0 0 40 25" fill="none" className={className} aria-label="Mastercard">
      <circle cx="15" cy="12.5" r="10.5" fill="#eb001b" />
      <circle cx="25" cy="12.5" r="10.5" fill="#f79e1b" />
      <path
        d="M20 4.3a10.5 10.5 0 010 16.4 10.5 10.5 0 000-16.4z"
        fill="#ff5f00"
      />
    </svg>
  )
}

export function AmexLogo({ className = 'h-6 w-auto' }: LogoProps) {
  return (
    <svg viewBox="0 0 60 20" fill="none" className={className} aria-label="American Express">
      <rect x="0.5" y="0.5" width="59" height="19" rx="2" stroke="currentColor" strokeWidth="1" />
      <text
        x="30"
        y="14"
        textAnchor="middle"
        fill="currentColor"
        fontSize="10"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
        letterSpacing="1.5"
      >
        AMEX
      </text>
    </svg>
  )
}

export function DinersLogo({ className = 'h-6 w-auto' }: LogoProps) {
  return (
    <svg viewBox="0 0 30 30" fill="none" className={className} aria-label="Diners Club">
      <circle cx="13" cy="15" r="11" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="17" cy="15" r="11" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function RupayLogo({ className = 'h-6 w-auto' }: LogoProps) {
  return (
    <svg viewBox="0 0 70 20" fill="none" className={className} aria-label="RuPay">
      <text
        x="35"
        y="15"
        textAnchor="middle"
        fill="currentColor"
        fontSize="12"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.5"
      >
        RuPay
      </text>
      <line x1="5" y1="18" x2="65" y2="18" stroke="#f37021" strokeWidth="2" />
      <line x1="5" y1="18" x2="35" y2="18" stroke="#097a44" strokeWidth="2" />
    </svg>
  )
}

export function ContactlessIcon({ className = 'h-4 w-4' }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Contactless">
      <path d="M12 2a10 10 0 018 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M12 6a6 6 0 015.2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M12 10a2 2 0 012.4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function NetworkLogo({ network, className }: { network: string; className?: string }) {
  switch (network) {
    case 'visa':
      return <VisaLogo className={className} />
    case 'mastercard':
      return <MastercardLogo className={className} />
    case 'amex':
      return <AmexLogo className={className} />
    case 'diners':
      return <DinersLogo className={className} />
    case 'rupay':
      return <RupayLogo className={className} />
    default:
      return <VisaLogo className={className} />
  }
}
