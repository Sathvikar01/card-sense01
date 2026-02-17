/**
 * Formats a number as Indian Rupee (INR) currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., ₹1,50,000 or ₹1.5L)
 */
export function formatCurrency(
  amount: number,
  options: {
    compact?: boolean; // Use compact notation (1.5L, 2.3Cr)
    showSymbol?: boolean; // Show ₹ symbol
    showDecimals?: boolean; // Show decimal places
    decimalPlaces?: number; // Number of decimal places (default: 2)
  } = {}
): string {
  const {
    compact = false,
    showSymbol = true,
    showDecimals = true,
    decimalPlaces = 2,
  } = options;

  const symbol = showSymbol ? '₹' : '';

  // Handle compact notation (Indian style: L for Lakh, Cr for Crore)
  if (compact) {
    if (amount >= 10000000) {
      // 1 Crore or more
      const crores = amount / 10000000;
      return `${symbol}${crores.toFixed(decimalPlaces)}Cr`;
    } else if (amount >= 100000) {
      // 1 Lakh or more
      const lakhs = amount / 100000;
      return `${symbol}${lakhs.toFixed(decimalPlaces)}L`;
    } else if (amount >= 1000) {
      // 1 Thousand or more
      const thousands = amount / 1000;
      return `${symbol}${thousands.toFixed(decimalPlaces)}K`;
    }
  }

  // Indian number formatting with lakhs and crores
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: showDecimals ? decimalPlaces : 0,
    maximumFractionDigits: showDecimals ? decimalPlaces : 0,
  });

  return `${symbol}${formatter.format(amount)}`;
}

/**
 * Formats a number range as Indian Rupee currency
 * @param min - Minimum amount
 * @param max - Maximum amount
 * @param options - Formatting options
 * @returns Formatted range string (e.g., ₹50,000 - ₹1,50,000)
 */
export function formatCurrencyRange(
  min: number,
  max: number,
  options: Parameters<typeof formatCurrency>[1] = {}
): string {
  return `${formatCurrency(min, options)} - ${formatCurrency(max, options)}`;
}

/**
 * Parse Indian currency string to number
 * @param value - Currency string (e.g., "₹1,50,000" or "1.5L")
 * @returns Numeric value
 */
export function parseCurrency(value: string): number {
  // Remove ₹ symbol and spaces
  const cleanValue = value.replace(/₹|\s/g, '');

  // Handle compact notation
  if (cleanValue.includes('Cr')) {
    return parseFloat(cleanValue.replace('Cr', '')) * 10000000;
  } else if (cleanValue.includes('L')) {
    return parseFloat(cleanValue.replace('L', '')) * 100000;
  } else if (cleanValue.includes('K')) {
    return parseFloat(cleanValue.replace('K', '')) * 1000;
  }

  // Remove commas and parse
  return parseFloat(cleanValue.replace(/,/g, ''));
}

/**
 * Format percentage
 * @param value - Percentage value (0-100)
 * @param decimalPlaces - Number of decimal places
 * @returns Formatted percentage string (e.g., "5.50%")
 */
export function formatPercentage(
  value: number,
  decimalPlaces: number = 2
): string {
  return `${value.toFixed(decimalPlaces)}%`;
}
