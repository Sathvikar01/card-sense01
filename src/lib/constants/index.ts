// Constants for credit card and financial data

export const INDIAN_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'SBI (State Bank of India)',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Yes Bank',
  'IDFC First Bank',
  'RBL Bank',
  'AU Small Finance Bank',
  'American Express',
  'Standard Chartered',
  'HSBC',
  'Citibank',
  'Other',
] as const

export const CARD_TYPES = [
  'entry-level',
  'cashback',
  'rewards',
  'travel',
  'premium',
  'shopping',
  'fuel',
] as const

export const CARD_NETWORKS = ['Visa', 'Mastercard', 'Amex', 'RuPay'] as const

export const SPENDING_CATEGORIES = [
  'dining',
  'groceries',
  'travel',
  'fuel',
  'shopping',
  'utilities',
  'entertainment',
  'healthcare',
  'education',
  'bills',
  'other',
] as const

export const SPENDING_CATEGORY_LABELS: Record<string, string> = {
  dining: 'Dining & Restaurants',
  groceries: 'Groceries',
  travel: 'Travel & Hotels',
  fuel: 'Fuel',
  shopping: 'Shopping',
  utilities: 'Utilities',
  entertainment: 'Entertainment',
  healthcare: 'Healthcare',
  education: 'Education',
  bills: 'Bills & Recharges',
  other: 'Other',
}

export const INCOME_RANGES = [
  'Below 3 Lakhs',
  '3-5 Lakhs',
  '5-10 Lakhs',
  '10-15 Lakhs',
  '15-25 Lakhs',
  'Above 25 Lakhs',
] as const

export const EMPLOYMENT_TYPES = [
  'Salaried',
  'Self-Employed',
  'Business Owner',
  'Professional',
  'Student',
  'Retired',
] as const

export const AGE_GROUPS = [
  '18-25 years',
  '26-35 years',
  '36-45 years',
  '46-60 years',
  'Above 60 years',
] as const

export const CREDIT_CARD_GOALS = [
  'Build credit history',
  'Earn rewards on everyday spending',
  'Travel benefits and lounge access',
  'Save on fuel expenses',
  'Get cashback on purchases',
  'Access to premium benefits',
  'Lower interest on big purchases',
  'Emergency credit backup',
] as const

export const REWARD_PREFERENCES = [
  'Cashback',
  'Reward Points',
  'Travel Miles',
  'Shopping Vouchers',
  'Dining Discounts',
  'Fuel Savings',
] as const

export const INDIAN_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Kochi',
  'Indore',
  'Nagpur',
  'Bhopal',
  'Visakhapatnam',
  'Other',
] as const

export const EDUCATION_CATEGORIES = [
  'basics',
  'cibil',
  'rewards',
  'fees',
  'security',
  'tips',
] as const

export const EDUCATION_CATEGORY_LABELS: Record<string, string> = {
  basics: 'Credit Card Basics',
  cibil: 'CIBIL & Credit Score',
  rewards: 'Rewards & Benefits',
  fees: 'Fees & Charges',
  security: 'Security & Safety',
  tips: 'Tips & Best Practices',
}

export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
