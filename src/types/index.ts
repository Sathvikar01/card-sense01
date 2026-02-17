export type SpendingCategory =
  | "dining"
  | "groceries"
  | "fuel"
  | "travel"
  | "shopping"
  | "entertainment"
  | "utilities"
  | "health"
  | "education"
  | "insurance"
  | "emi"
  | "transfers"
  | "other";

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: SpendingCategory;
  merchant: string;
}

export interface StatementMetadata {
  cardName: string;
  cardLastFour: string;
  statementPeriod: {
    from: string;
    to: string;
  };
  totalSpend: number;
  totalPayments: number;
  closingBalance: number;
}

export interface CategoryBreakdown {
  category: SpendingCategory;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyTotal {
  month: string;
  amount: number;
}

export interface MerchantSpend {
  merchant: string;
  totalAmount: number;
  transactionCount: number;
  category: SpendingCategory;
}

export interface SpendingAnalysis {
  metadata: StatementMetadata;
  transactions: Transaction[];
  categoryBreakdown: CategoryBreakdown[];
  monthlyTotals: MonthlyTotal[];
  topMerchants: MerchantSpend[];
  insights: string[];
  recommendedCardIds: string[];
  savingsTips: string[];
}

export type CardIssuer =
  | "HDFC"
  | "SBI"
  | "ICICI"
  | "Axis"
  | "Kotak"
  | "Amex"
  | "RBL"
  | "IndusInd"
  | "IDFC First"
  | "Yes Bank"
  | "AU Small Finance"
  | "Federal Bank";

export type CardNetwork = "Visa" | "Mastercard" | "RuPay" | "Amex" | "Diners";

export type CardType =
  | "rewards"
  | "cashback"
  | "travel"
  | "fuel"
  | "lifestyle"
  | "premium"
  | "entry-level";

export interface CreditCard {
  id: string;
  name: string;
  issuer: CardIssuer;
  network: CardNetwork;
  type: CardType;
  annualFee: number;
  joiningFee: number;
  rewardRate: number;
  rewardDescription: string;
  benefits: string[];
  loungeAccess: string | null;
  fuelSurchargeWaiver: boolean;
  bestFor: SpendingCategory[];
  minIncomeRequired: number;
  applyUrl: string;
  rating: number;
}

export interface ParsePdfResult {
  success: boolean;
  rawText?: string;
  error?: string;
}

export interface AnalyzeSpendingResult {
  success: boolean;
  analysis?: SpendingAnalysis;
  error?: string;
}

export type AnalysisStatus =
  | "idle"
  | "uploading"
  | "parsing"
  | "analyzing"
  | "complete"
  | "error";
