// Utility functions for the application
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format number as Indian Rupees
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format number as compact Indian Rupees (e.g., 50K, 5L)
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`
  }
  return `₹${amount}`
}

// Calculate reward value
export function calculateRewardValue(
  amount: number,
  rate: number,
  valuePerPoint: number = 0.25
): number {
  const points = (amount * rate) / 100
  return points * valuePerPoint
}

// Get CIBIL score color
export function getCibilScoreColor(score: number): string {
  if (score >= 750) return 'text-green-600'
  if (score >= 650) return 'text-yellow-600'
  return 'text-red-600'
}

// Get CIBIL score rating
export function getCibilScoreRating(score: number): string {
  if (score >= 800) return 'Excellent'
  if (score >= 750) return 'Very Good'
  if (score >= 700) return 'Good'
  if (score >= 650) return 'Fair'
  return 'Poor'
}

// Convert income range to minimum annual income
export function incomeRangeToMinAmount(range: string): number {
  const mapping: Record<string, number> = {
    'Below 3 Lakhs': 0,
    '3-5 Lakhs': 300000,
    '5-10 Lakhs': 500000,
    '10-15 Lakhs': 1000000,
    '15-25 Lakhs': 1500000,
    'Above 25 Lakhs': 2500000,
  }
  return mapping[range] || 0
}

// Format date as DD MMM YYYY
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

// Get relative time (e.g., "2 hours ago")
export function getRelativeTime(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return formatDate(date)
}

// Truncate text with ellipsis
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// Generate slug from text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Calculate reading time
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const wordCount = text.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}
