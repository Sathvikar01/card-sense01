export interface CardDesign {
  gradient: string
  textColor: 'white' | 'dark'
  bankLabel: string
  cardLabel: string
  network: 'visa' | 'mastercard' | 'amex' | 'rupay' | 'diners'
  chipStyle: 'gold' | 'silver'
  pattern?: 'diagonal' | 'wave' | 'dots'
  accent?: string
}

export const CARD_DESIGNS: Record<string, CardDesign> = {
  'hdfc-regalia-gold': {
    gradient: 'linear-gradient(135deg, #0a1628 0%, #1a3a6b 40%, #2a5298 100%)',
    textColor: 'white',
    bankLabel: 'HDFC BANK',
    cardLabel: 'REGALIA GOLD',
    network: 'visa',
    chipStyle: 'gold',
    accent: '#c9a84c',
  },
  'sbi-cashback': {
    gradient: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
    textColor: 'white',
    bankLabel: 'SBI CARD',
    cardLabel: 'CASHBACK',
    network: 'visa',
    chipStyle: 'gold',
  },
  'icici-amazon-pay': {
    gradient: 'linear-gradient(160deg, #1a1a1a 0%, #2d2d2d 60%, #1a1a1a 100%)',
    textColor: 'white',
    bankLabel: 'ICICI BANK',
    cardLabel: 'AMAZON PAY',
    network: 'visa',
    chipStyle: 'gold',
    accent: '#ff9900',
  },
  'axis-ace': {
    gradient: 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #8e24aa 100%)',
    textColor: 'white',
    bankLabel: 'AXIS BANK',
    cardLabel: 'ACE',
    network: 'visa',
    chipStyle: 'silver',
  },
  'hdfc-millennia': {
    gradient: 'linear-gradient(135deg, #90a4ae 0%, #b0bec5 30%, #eceff1 70%, #b0bec5 100%)',
    textColor: 'dark',
    bankLabel: 'HDFC BANK',
    cardLabel: 'MILLENNIA',
    network: 'mastercard',
    chipStyle: 'silver',
    pattern: 'wave',
  },
  'sbi-simply-click': {
    gradient: 'linear-gradient(135deg, #00695c 0%, #00897b 50%, #26a69a 100%)',
    textColor: 'white',
    bankLabel: 'SBI CARD',
    cardLabel: 'SIMPLY CLICK',
    network: 'visa',
    chipStyle: 'gold',
  },
  'idfc-first-classic': {
    gradient: 'linear-gradient(135deg, #7f0000 0%, #b71c1c 50%, #c62828 100%)',
    textColor: 'white',
    bankLabel: 'IDFC FIRST',
    cardLabel: 'CLASSIC',
    network: 'visa',
    chipStyle: 'gold',
  },
  'idfc-first-wow': {
    gradient: 'linear-gradient(135deg, #e65100 0%, #f57c00 50%, #ffb300 100%)',
    textColor: 'white',
    bankLabel: 'IDFC FIRST',
    cardLabel: 'WOW!',
    network: 'visa',
    chipStyle: 'gold',
  },
  'amex-membership-rewards': {
    gradient: 'linear-gradient(160deg, #1b5e20 0%, #2e7d32 40%, #388e3c 100%)',
    textColor: 'white',
    bankLabel: 'AMERICAN EXPRESS',
    cardLabel: 'MEMBERSHIP REWARDS',
    network: 'amex',
    chipStyle: 'gold',
  },
  'kotak-811-dream': {
    gradient: 'linear-gradient(135deg, #b71c1c 0%, #d32f2f 50%, #e53935 100%)',
    textColor: 'white',
    bankLabel: 'KOTAK MAHINDRA',
    cardLabel: '811 #DREAMDIFFERENT',
    network: 'visa',
    chipStyle: 'gold',
  },
  'axis-myzone': {
    gradient: 'linear-gradient(135deg, #4a0e0e 0%, #6d1a1a 50%, #8b2252 100%)',
    textColor: 'white',
    bankLabel: 'AXIS BANK',
    cardLabel: 'MY ZONE',
    network: 'visa',
    chipStyle: 'gold',
  },
  'hdfc-diners-club-black': {
    gradient: 'linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 40%, #2a2a2a 70%, #0a0a0a 100%)',
    textColor: 'white',
    bankLabel: 'HDFC BANK',
    cardLabel: 'DINERS CLUB BLACK',
    network: 'diners',
    chipStyle: 'gold',
    accent: '#c9a84c',
    pattern: 'diagonal',
  },
  'icici-sapphiro': {
    gradient: 'linear-gradient(135deg, #0d1b3e 0%, #1a2f6e 40%, #2a4a9e 100%)',
    textColor: 'white',
    bankLabel: 'ICICI BANK',
    cardLabel: 'SAPPHIRO',
    network: 'visa',
    chipStyle: 'silver',
  },
  'rbl-shoprite': {
    gradient: 'linear-gradient(135deg, #c62828 0%, #e53935 50%, #ef5350 100%)',
    textColor: 'white',
    bankLabel: 'RBL BANK',
    cardLabel: 'SHOPRITE',
    network: 'mastercard',
    chipStyle: 'silver',
  },
  'indusind-legend': {
    gradient: 'linear-gradient(160deg, #0d1b2a 0%, #1b2838 50%, #2c3e50 100%)',
    textColor: 'white',
    bankLabel: 'INDUSIND BANK',
    cardLabel: 'LEGEND',
    network: 'visa',
    chipStyle: 'silver',
    pattern: 'wave',
  },
  'au-lit': {
    gradient: 'linear-gradient(135deg, #6a1b9a 0%, #8e24aa 30%, #ab47bc 60%, #ce93d8 100%)',
    textColor: 'white',
    bankLabel: 'AU SMALL FINANCE',
    cardLabel: 'LIT',
    network: 'mastercard',
    chipStyle: 'gold',
  },
  'hdfc-indian-oil': {
    gradient: 'linear-gradient(135deg, #bf360c 0%, #e64a19 40%, #ff6e40 100%)',
    textColor: 'white',
    bankLabel: 'HDFC BANK',
    cardLabel: 'INDIAN OIL',
    network: 'visa',
    chipStyle: 'gold',
    accent: '#1565c0',
  },
  'icici-coral': {
    gradient: 'linear-gradient(135deg, #d84315 0%, #f4511e 40%, #ff8a65 100%)',
    textColor: 'white',
    bankLabel: 'ICICI BANK',
    cardLabel: 'CORAL',
    network: 'visa',
    chipStyle: 'silver',
  },
  'yes-first-preferred': {
    gradient: 'linear-gradient(135deg, #1a237e 0%, #283593 40%, #7986cb 100%)',
    textColor: 'white',
    bankLabel: 'YES BANK',
    cardLabel: 'FIRST PREFERRED',
    network: 'mastercard',
    chipStyle: 'silver',
  },
  'sbi-bpcl': {
    gradient: 'linear-gradient(160deg, #f9a825 0%, #fdd835 35%, #1565c0 65%, #0d47a1 100%)',
    textColor: 'white',
    bankLabel: 'SBI CARD',
    cardLabel: 'BPCL',
    network: 'visa',
    chipStyle: 'gold',
  },
}

const BANK_FALLBACK_COLORS: Record<string, string> = {
  HDFC: '#004b87',
  SBI: '#22409a',
  ICICI: '#f37b20',
  Axis: '#97144d',
  Amex: '#006fcf',
  'IDFC First': '#9c1d24',
  Kotak: '#ed1c24',
  RBL: '#c8102e',
  IndusInd: '#1c3f6e',
  'AU Small Finance': '#6a1b9a',
  'Yes Bank': '#0066b3',
}

export function getCardDesign(cardId: string, bankName?: string): CardDesign {
  if (CARD_DESIGNS[cardId]) {
    return CARD_DESIGNS[cardId]
  }

  const bankColor = bankName ? BANK_FALLBACK_COLORS[bankName] || '#3b5998' : '#3b5998'

  return {
    gradient: `linear-gradient(135deg, ${bankColor} 0%, ${bankColor}dd 100%)`,
    textColor: 'white',
    bankLabel: bankName?.toUpperCase() || 'BANK',
    cardLabel: 'CREDIT CARD',
    network: 'visa',
    chipStyle: 'gold',
  }
}
