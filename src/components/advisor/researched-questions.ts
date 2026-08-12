export interface ResearchedQuestion {
  id: string
  question: string
  why: string
  options: Array<{
    value: string
    label: string
    description: string
  }>
}

export const RESEARCHED_QUESTIONS: ResearchedQuestion[] = [
  {
    id: 'age_band',
    question: 'What is your age bracket?',
    why: 'Some Indian cards are available from 18+, while many unsecured cards start at 21+.',
    options: [
      { value: '18_20', label: '18-20', description: 'Prioritize FD-backed or secured card options.' },
      { value: '21_24', label: '21-24', description: 'Consider entry-level and starter unsecured cards.' },
      { value: '25_30', label: '25-30', description: 'Consider cashback, rewards, and travel cards.' },
      { value: '31_plus', label: '31+', description: 'Include wider premium eligibility where relevant.' },
    ],
  },
  {
    id: 'income_profile',
    question: 'Which income situation best matches you right now?',
    why: 'Income stability affects unsecured card eligibility and approval odds.',
    options: [
      { value: 'no_personal_income', label: 'No personal income', description: 'Prioritize FD-backed or secured cards.' },
      { value: 'stipend_or_part_time', label: 'Stipend/part-time income', description: 'Mix low-fee unsecured and secured cards.' },
      { value: 'stable_income_upto_6l', label: 'Stable income up to INR 6L', description: 'Entry-level unsecured cards become more realistic.' },
      { value: 'stable_income_above_6l', label: 'Stable income above INR 6L', description: 'Broader unsecured and premium options can be considered.' },
    ],
  },
  {
    id: 'secured_card_readiness',
    question: 'Are you open to FD-backed cards if they improve approval chance?',
    why: 'For many first-time users or users with low income, secured cards are the practical path.',
    options: [
      { value: 'have_fd_now', label: 'Yes, I already have FD', description: 'Recommend secured cards first for faster approval.' },
      { value: 'can_start_fd', label: 'Can start an FD soon', description: 'Show secured and unsecured alternatives.' },
      { value: 'unsecured_only', label: 'No, only unsecured cards', description: 'Recommend unsecured cards only.' },
    ],
  },
  {
    id: 'primary_spend_focus',
    question: 'Which spending area should this card optimize first?',
    why: 'The best card changes based on your dominant spending category.',
    options: [
      { value: 'groceries', label: 'Groceries & essentials', description: 'Maximize everyday household cashback.' },
      { value: 'dining', label: 'Dining & delivery', description: 'Focus on food and app-order rewards.' },
      { value: 'shopping', label: 'Online shopping', description: 'Prioritize ecommerce and sale-season rewards.' },
      { value: 'travel', label: 'Travel & commute', description: 'Optimize travel and transport spending.' },
    ],
  },
  {
    id: 'value_priority',
    question: 'What outcome matters most from this card?',
    why: 'This decides whether we optimize for low fees, cashback, travel, or UPI usage.',
    options: [
      { value: 'build_credit_low_fee', label: 'Build credit with low fees', description: 'Keep costs low and improve credit history safely.' },
      { value: 'cashback_everyday', label: 'Max cashback on regular spends', description: 'Prioritize simple savings on routine categories.' },
      { value: 'travel_perks', label: 'Travel and lounge benefits', description: 'Prioritize cards with flight and lounge value.' },
      { value: 'upi_qr_rewards', label: 'UPI QR convenience', description: 'Prioritize RuPay and UPI-on-credit compatibility.' },
    ],
  },
]
