import type { SpendingCategory } from "@/types";

export const CATEGORY_COLORS: Record<SpendingCategory, string> = {
  dining: "var(--chart-1)",
  groceries: "var(--chart-2)",
  fuel: "var(--chart-3)",
  travel: "var(--chart-4)",
  shopping: "var(--chart-5)",
  entertainment: "#8b5cf6",
  utilities: "#06b6d4",
  health: "#10b981",
  education: "#f59e0b",
  insurance: "#6366f1",
  emi: "#ec4899",
  transfers: "#78716c",
  other: "#94a3b8",
};

export const CATEGORY_LABELS: Record<SpendingCategory, string> = {
  dining: "Dining & Restaurants",
  groceries: "Groceries",
  fuel: "Fuel",
  travel: "Travel & Transport",
  shopping: "Shopping",
  entertainment: "Entertainment",
  utilities: "Bills & Utilities",
  health: "Health & Medical",
  education: "Education",
  insurance: "Insurance",
  emi: "EMI & Loans",
  transfers: "Transfers",
  other: "Other",
};

export const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
