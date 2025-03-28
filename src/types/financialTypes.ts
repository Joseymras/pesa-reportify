
// Define custom types for financial tools and reports
import { CurrencyCode } from "@/hooks/useCurrencyConverter";

// Types for saved reports
export type SavedReportType = 'loan' | 'savings' | 'budget' | 'currency';

export interface SavedReport {
  id?: string;
  user_id?: string;
  name: string;
  type: SavedReportType;
  data: Record<string, any>;
  include_personal_info: boolean;
  created_at?: string;
}

// Loan calculator types
export interface LoanResult {
  monthlyPayment: number;
  totalRepayment: number;
  totalInterest: number;
  processingFee: number;
  totalCost: number;
}

export interface LoanReport {
  loanAmount: number;
  loanTermMonths: number;
  interestRate: number;
  processingFee: boolean;
  result: LoanResult;
}

// Savings calculator types
export interface SavingsResult {
  futureValue: number;
  totalContributions: number;
  interestEarned: number;
}

export interface SavingsReport {
  initialDeposit: number;
  monthlyContribution: number;
  savingsYears: number;
  savingsRate: number;
  result: SavingsResult;
  projectionData?: Array<{ year: number; value: number }>;
}

// Budget calculator types
export interface BudgetResult {
  discretionarySpending: number;
  isBudgetBalanced: boolean;
  essentialPercent: number;
  savingsPercent: number;
  discretionaryPercent: number;
}

export interface BudgetReport {
  monthlyIncome: number;
  essentialExpenses: number;
  savingsTarget: number;
  result: BudgetResult;
  chartData?: Array<{ name: string; value: number }>;
}

// Currency converter types
export interface CurrencyReport {
  amount: number;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  convertedAmount: number;
  exchangeRate: number;
  historicalData?: Array<{ date: string; value: number }>;
}
