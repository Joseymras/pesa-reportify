/**
 * Utility functions for accurate financial calculations
 */

/**
 * Parses a currency amount from a string, removing commas and non-numeric characters
 * @param value - The string value to parse
 * @returns A number representing the currency amount
 */
export const parseCurrencyAmount = (value: string): number => {
  // Remove all non-numeric characters except decimal point
  const cleanValue = value.replace(/[^0-9.]/g, '');
  return parseFloat(cleanValue) || 0;
};

/**
 * Formats a number as currency with proper decimal places
 * @param amount - The number to format
 * @param decimals - Number of decimal places (default 2)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, decimals = 2): string => {
  // Avoid floating point precision issues by rounding to specified decimals
  const factor = Math.pow(10, decimals);
  const roundedAmount = Math.round(amount * factor) / factor;
  
  return roundedAmount.toLocaleString('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Calculates total from an array of numeric values
 * @param values - Array of numbers to sum
 * @returns The sum with proper precision
 */
export const calculateTotal = (values: number[]): number => {
  // Use reduce with proper decimal handling to avoid floating point errors
  return values.reduce((sum, value) => {
    // Multiply by 100, round to integer, then divide by 100 to keep 2 decimal precision
    return Math.round((sum + value) * 100) / 100;
  }, 0);
};

/**
 * Calculates percentage with accurate rounding
 * @param part - The part value
 * @param total - The total value
 * @returns The percentage as a number
 */
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  
  // Calculate percentage with 2 decimal precision
  return Math.round((part / total) * 10000) / 100;
};

/**
 * Safely performs financial calculations to avoid floating point errors
 * @param operation - The operation to perform ('add', 'subtract', 'multiply', 'divide')
 * @param a - First operand
 * @param b - Second operand
 * @returns The result with proper precision
 */
export const calculateFinancial = (
  operation: 'add' | 'subtract' | 'multiply' | 'divide',
  a: number,
  b: number
): number => {
  // Convert to cents (or smallest currency unit) to avoid floating point issues
  const aInCents = Math.round(a * 100);
  const bInCents = Math.round(b * 100);
  
  let result: number;
  
  switch (operation) {
    case 'add':
      result = aInCents + bInCents;
      return result / 100;
    case 'subtract':
      result = aInCents - bInCents;
      return result / 100;
    case 'multiply':
      // For multiplication, we divide by 100 again since both values are in cents
      result = (aInCents * bInCents) / 100;
      return result / 100;
    case 'divide':
      // For division, we multiply by 100 since denominator is in cents
      if (bInCents === 0) return 0;
      result = (aInCents / bInCents) * 100;
      return result;
    default:
      return 0;
  }
};
