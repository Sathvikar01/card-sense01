export interface ResearchedQuestion {
  id: string
  question: string
  options: Array<{
    value: string
    label: string
  }>
}

export const RESEARCHED_QUESTIONS: ResearchedQuestion[] = [
  {
    id: 'age_band',
    question: 'How old are you?',
    options: [
      { value: '18_20', label: '18–20' },
      { value: '21_24', label: '21–24' },
      { value: '25_30', label: '25–30' },
      { value: '31_plus', label: '31+' },
    ],
  },
  {
    id: 'income_profile',
    question: 'What’s your income?',
    options: [
      { value: 'no_personal_income', label: 'No personal income' },
      { value: 'stipend_or_part_time', label: 'Stipend or part-time' },
      { value: 'stable_income_upto_6l', label: 'Up to ₹6L a year' },
      { value: 'stable_income_above_6l', label: 'Above ₹6L a year' },
    ],
  },
  {
    id: 'secured_card_readiness',
    question: 'Open to an FD-backed card?',
    options: [
      { value: 'have_fd_now', label: 'Yes, I have an FD' },
      { value: 'can_start_fd', label: 'I can open one' },
      { value: 'unsecured_only', label: 'No' },
    ],
  },
  {
    id: 'primary_spend_focus',
    question: 'Where do you spend most?',
    options: [
      { value: 'groceries', label: 'Groceries & essentials' },
      { value: 'dining', label: 'Dining & delivery' },
      { value: 'shopping', label: 'Online shopping' },
      { value: 'travel', label: 'Travel & commute' },
    ],
  },
  {
    id: 'value_priority',
    question: 'What matters most?',
    options: [
      { value: 'build_credit_low_fee', label: 'Build credit, low fees' },
      { value: 'cashback_everyday', label: 'Cashback' },
      { value: 'travel_perks', label: 'Travel and lounges' },
      { value: 'upi_qr_rewards', label: 'UPI payments' },
    ],
  },
]
