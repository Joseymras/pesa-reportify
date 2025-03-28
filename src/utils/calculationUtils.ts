
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

/**
 * Calculates loan payment details
 * @param loanAmount - Principal loan amount
 * @param interestRate - Annual interest rate (percentage)
 * @param loanTermMonths - Loan term in months
 * @param includeProcessingFee - Whether to include processing fee
 * @returns Object with payment details
 */
export const calculateLoanPayment = (
  loanAmount: number,
  interestRate: number,
  loanTermMonths: number,
  includeProcessingFee: boolean = false
) => {
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = loanTermMonths;
  
  // Calculate base monthly payment using the formula: P * r * (1+r)^n / ((1+r)^n - 1)
  let monthlyPayment = 0;
  if (monthlyRate) {
    monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
  } else {
    monthlyPayment = loanAmount / totalPayments;
  }
  
  // Calculate total repayment
  const totalRepayment = monthlyPayment * totalPayments;
  
  // Add processing fee if selected (typically 2.5%)
  const fee = includeProcessingFee ? loanAmount * 0.025 : 0;
  const totalCost = totalRepayment + fee;
  const totalInterest = totalRepayment - loanAmount;
  
  return {
    monthlyPayment,
    totalRepayment,
    totalInterest,
    processingFee: fee,
    totalCost
  };
};

/**
 * Calculates compound savings over time
 * @param initialDeposit - Starting deposit amount
 * @param monthlyContribution - Monthly contribution amount
 * @param savingsYears - Years to save
 * @param interestRate - Annual interest rate (percentage)
 * @returns Object with savings details
 */
export const calculateSavings = (
  initialDeposit: number,
  monthlyContribution: number,
  savingsYears: number,
  interestRate: number
) => {
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = savingsYears * 12;
  
  let futureValue = initialDeposit * Math.pow(1 + monthlyRate, totalMonths);
  
  // Calculate future value of monthly contributions
  if (monthlyRate > 0) {
    futureValue += monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  } else {
    futureValue += monthlyContribution * totalMonths;
  }
  
  const totalContributions = initialDeposit + (monthlyContribution * totalMonths);
  const interestEarned = futureValue - totalContributions;
  
  return {
    futureValue,
    totalContributions,
    interestEarned
  };
};

/**
 * Converts an annual interest rate to a monthly rate
 * @param annualRate - Annual interest rate as a percentage (e.g., 5 for 5%)
 * @returns Monthly interest rate as a decimal
 */
export const convertToMonthlyRate = (annualRate: number): number => {
  return annualRate / 100 / 12;
};

/**
 * Calculates loan details including monthly payment, total repayment, and total interest
 * @param principal - Loan amount
 * @param monthlyRate - Monthly interest rate as a decimal
 * @param termMonths - Loan term in months
 * @returns Object with loan calculation details
 */
export const LoanCalculator = (
  principal: number, 
  monthlyRate: number, 
  termMonths: number
): { monthlyPayment: number; totalRepayment: number; totalInterest: number } => {
  let monthlyPayment: number;
  
  if (monthlyRate === 0) {
    // If interest rate is 0, simple division
    monthlyPayment = principal / termMonths;
  } else {
    // Standard loan formula: P * r * (1+r)^n / ((1+r)^n - 1)
    monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) / 
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }
  
  const totalRepayment = monthlyPayment * termMonths;
  const totalInterest = totalRepayment - principal;
  
  return {
    monthlyPayment,
    totalRepayment,
    totalInterest
  };
};
