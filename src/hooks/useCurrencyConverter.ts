
import { useState, useEffect } from 'react';

// Common currency exchange rates against KES (as of current data)
// In a production app, these would come from an API
const EXCHANGE_RATES = {
  KES: 1,
  USD: 0.0077,
  EUR: 0.0071,
  GBP: 0.0061,
  ZAR: 0.14,
  NGN: 3.53,
  UGX: 28.57,
  TZS: 19.61,
  AED: 0.028,
  CNY: 0.056,
  INR: 0.64,
  RWF: 9.62
};

export type CurrencyCode = keyof typeof EXCHANGE_RATES;

export function useCurrencyConverter() {
  const [amount, setAmount] = useState<number>(1000);
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('KES');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('USD');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [historicalData, setHistoricalData] = useState<{ date: string; value: number }[]>([]);

  // List of available currencies
  const currencies = Object.keys(EXCHANGE_RATES) as CurrencyCode[];

  // Convert between currencies
  const convert = (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
    // Convert to base currency (KES) first, then to target currency
    const amountInKES = amount / EXCHANGE_RATES[from];
    return amountInKES * EXCHANGE_RATES[to];
  };

  // Generate sample historical data for a chart
  const generateHistoricalData = (from: CurrencyCode, to: CurrencyCode) => {
    const today = new Date();
    const data = [];
    
    // Generate data for the past 30 days with some random fluctuation
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Base conversion rate with small random fluctuation (+/- 5%)
      const baseRate = convert(1, from, to);
      const randomFactor = 0.95 + Math.random() * 0.1; // Random between 0.95 and 1.05
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: baseRate * randomFactor
      });
    }
    
    return data;
  };

  // Update converted amount when inputs change
  useEffect(() => {
    const result = convert(amount, fromCurrency, toCurrency);
    setConvertedAmount(result);
    
    // Generate historical data for chart
    const newHistoricalData = generateHistoricalData(fromCurrency, toCurrency);
    setHistoricalData(newHistoricalData);
  }, [amount, fromCurrency, toCurrency]);

  return {
    amount,
    setAmount,
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    convertedAmount,
    currencies,
    historicalData
  };
}
