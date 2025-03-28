import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import Footer from "@/components/Footer";
import MainNav from "@/components/MainNav";
import { calculateLoanPayment, calculateSavings, formatCurrency } from "@/utils/calculationUtils";
import { CreditCard, PiggyBank, Wallet, DollarSign, LineChart } from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip
} from "recharts";

const FinancialTools = () => {
  // Loan Calculator State
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(12);
  const [interestRate, setInterestRate] = useState<number>(15);
  const [processingFee, setProcessingFee] = useState<boolean>(true);
  
  // Savings Calculator State
  const [initialDeposit, setInitialDeposit] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [savingsYears, setSavingsYears] = useState<number>(5);
  const [savingsRate, setSavingsRate] = useState<number>(8);
  
  // Budget Calculator State
  const [monthlyIncome, setMonthlyIncome] = useState<number>(50000);
  const [essentialExpenses, setEssentialExpenses] = useState<number>(20000);
  const [savingsTarget, setSavingsTarget] = useState<number>(10000);
  
  // Calculate loan payment
  const calculateLoanPayment = () => {
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
    const fee = processingFee ? loanAmount * 0.025 : 0;
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

  // Calculate compound savings
  const calculateSavings = () => {
    const monthlyRate = savingsRate / 100 / 12;
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

  // Calculate budget allocation
  const calculateBudget = () => {
    // 50/30/20 rule: 50% needs, 30% wants, 20% savings
    const discretionarySpending = monthlyIncome - essentialExpenses - savingsTarget;
    
    // Check if budget is balanced
    const isBudgetBalanced = discretionarySpending >= 0;
    
    // Calculate percentages
    const essentialPercent = (essentialExpenses / monthlyIncome) * 100;
    const savingsPercent = (savingsTarget / monthlyIncome) * 100;
    const discretionaryPercent = 100 - essentialPercent - savingsPercent;
    
    return {
      discretionarySpending,
      isBudgetBalanced,
      essentialPercent,
      savingsPercent,
      discretionaryPercent
    };
  };
  
  const loanResult = calculateLoanPayment();
  const savingsResult = calculateSavings();
  const budgetResult = calculateBudget();
  
  // Prepare budget chart data
  const budgetData = [
    { name: "Essentials", value: essentialExpenses },
    { name: "Savings", value: savingsTarget },
    { name: "Discretionary", value: Math.max(0, budgetResult.discretionarySpending) }
  ];
  
  // Prepare savings projection chart data
  const savingsProjectionData = Array.from({ length: savingsYears + 1 }, (_, i) => {
    const monthlyRate = savingsRate / 100 / 12;
    const months = i * 12;
    
    let value = initialDeposit * Math.pow(1 + monthlyRate, months);
    
    if (monthlyRate > 0) {
      value += monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    } else {
      value += monthlyContribution * months;
    }
    
    return {
      year: i,
      value: Math.round(value)
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto py-4">
          <MainNav />
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-2">Financial Tools</h1>
            <p className="text-gray-500 text-center mb-8">
              Powerful calculators to help manage your finances smartly
            </p>

            <Tabs defaultValue="loans" className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="loans" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Loan Calculator</span>
                </TabsTrigger>
                <TabsTrigger value="savings" className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4" />
                  <span className="hidden sm:inline">Savings Calculator</span>
                </TabsTrigger>
                <TabsTrigger value="budget" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Budget Planner</span>
                </TabsTrigger>
                <TabsTrigger value="currency" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Currency Converter</span>
                </TabsTrigger>
              </TabsList>

              {/* Loan Calculator Tab */}
              <TabsContent value="loans">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      Loan Calculator
                    </CardTitle>
                    <CardDescription>
                      Calculate monthly payments, total cost and interest for your loan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="loanAmount">Loan Amount (KES)</Label>
                          <span className="text-sm font-medium">{formatCurrency(loanAmount, 0)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            id="loanAmount"
                            type="number"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <Slider
                          defaultValue={[loanAmount]}
                          max={1000000}
                          step={10000}
                          onValueChange={(value) => setLoanAmount(value[0])}
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="interestRate">Interest Rate (%)</Label>
                            <span className="text-sm font-medium">{interestRate}%</span>
                          </div>
                          <Input
                            id="interestRate"
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full"
                          />
                          <Slider
                            defaultValue={[interestRate]}
                            max={30}
                            step={0.5}
                            onValueChange={(value) => setInterestRate(value[0])}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="loanTerm">Loan Term (Months)</Label>
                            <span className="text-sm font-medium">{loanTermMonths} months</span>
                          </div>
                          <Input
                            id="loanTerm"
                            type="number"
                            value={loanTermMonths}
                            onChange={(e) => setLoanTermMonths(Number(e.target.value))}
                            className="w-full"
                          />
                          <Slider
                            defaultValue={[loanTermMonths]}
                            min={3}
                            max={60}
                            step={1}
                            onValueChange={(value) => setLoanTermMonths(value[0])}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="processingFee"
                          checked={processingFee}
                          onCheckedChange={setProcessingFee}
                        />
                        <Label htmlFor="processingFee">Include processing fee (2.5%)</Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Monthly Payment</p>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(loanResult.monthlyPayment)}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">Total Cost</p>
                        <p className="text-2xl font-bold text-gray-700">
                          {formatCurrency(loanResult.totalCost)}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">Total Interest</p>
                        <p className="text-xl font-bold text-gray-700">
                          {formatCurrency(loanResult.totalInterest)}
                        </p>
                      </div>
                      
                      {processingFee && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 font-medium">Processing Fee</p>
                          <p className="text-xl font-bold text-gray-700">
                            {formatCurrency(loanResult.processingFee)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-6">
                    <p className="text-sm text-muted-foreground">
                      Rates are estimates and may vary by lender.
                    </p>
                    <Button variant="outline">Export</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Savings Calculator Tab */}
              <TabsContent value="savings">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PiggyBank className="h-5 w-5 text-green-600" />
                      Savings Calculator
                    </CardTitle>
                    <CardDescription>
                      See how your money can grow with our compound interest calculator.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="initialDeposit">Initial Deposit (KES)</Label>
                            <span className="text-sm font-medium">{formatCurrency(initialDeposit, 0)}</span>
                          </div>
                          <Input
                            id="initialDeposit"
                            type="number"
                            value={initialDeposit}
                            onChange={(e) => setInitialDeposit(Number(e.target.value))}
                            className="w-full"
                          />
                          <Slider
                            defaultValue={[initialDeposit]}
                            max={100000}
                            step={1000}
                            onValueChange={(value) => setInitialDeposit(value[0])}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="monthlyContribution">Monthly Deposit (KES)</Label>
                            <span className="text-sm font-medium">{formatCurrency(monthlyContribution, 0)}</span>
                          </div>
                          <Input
                            id="monthlyContribution"
                            type="number"
                            value={monthlyContribution}
                            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                            className="w-full"
                          />
                          <Slider
                            defaultValue={[monthlyContribution]}
                            max={50000}
                            step={500}
                            onValueChange={(value) => setMonthlyContribution(value[0])}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="savingsYears">Time Period (Years)</Label>
                            <span className="text-sm font-medium">{savingsYears} years</span>
                          </div>
                          <Input
                            id="savingsYears"
                            type="number"
                            value={savingsYears}
                            onChange={(e) => setSavingsYears(Number(e.target.value))}
                            className="w-full"
                          />
                          <Slider
                            defaultValue={[savingsYears]}
                            min={1}
                            max={30}
                            step={1}
                            onValueChange={(value) => setSavingsYears(value[0])}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="savingsRate">Annual Interest Rate (%)</Label>
                            <span className="text-sm font-medium">{savingsRate}%</span>
                          </div>
                          <Input
                            id="savingsRate"
                            type="number"
                            value={savingsRate}
                            onChange={(e) => setSavingsRate(Number(e.target.value))}
                            className="w-full"
                          />
                          <Slider
                            defaultValue={[savingsRate]}
                            max={20}
                            step={0.1}
                            onValueChange={(value) => setSavingsRate(value[0])}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Future Value</p>
                          <p className="text-2xl font-bold text-green-700">
                            {formatCurrency(savingsResult.futureValue, 0)}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 font-medium">Total Contributions</p>
                          <p className="text-xl font-bold text-gray-700">
                            {formatCurrency(savingsResult.totalContributions, 0)}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 font-medium">Interest Earned</p>
                          <p className="text-xl font-bold text-gray-700">
                            {formatCurrency(savingsResult.interestEarned, 0)}
                          </p>
                        </div>
                      </div>

                      <div className="h-64 bg-white rounded-lg p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={savingsProjectionData}>
                            <XAxis dataKey="year" label={{ value: 'Years', position: 'bottom' }} />
                            <YAxis tickFormatter={(value) => `${value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}`} />
                            <RechartsTooltip 
                              formatter={(value: any) => [`KES ${formatCurrency(Number(value), 0)}`, 'Value']}
                              labelFormatter={(value: any) => `Year ${value}`}
                            />
                            <Bar dataKey="value" name="Value" fill="#22c55e" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-6">
                    <p className="text-sm text-muted-foreground">
                      Results are estimates and don't account for taxes or inflation.
                    </p>
                    <Button variant="outline">Export</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Budget Planner Tab */}
              <TabsContent value="budget">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-green-600" />
                      Budget Planner
                    </CardTitle>
                    <CardDescription>
                      Plan your monthly budget using the 50/30/20 rule as a guideline.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="monthlyIncome">Monthly Income (After Tax)</Label>
                          <span className="text-sm font-medium">{formatCurrency(monthlyIncome, 0)}</span>
                        </div>
                        <Input
                          id="monthlyIncome"
                          type="number"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                          className="w-full"
                        />
                        <Slider
                          defaultValue={[monthlyIncome]}
                          max={200000}
                          step={1000}
                          onValueChange={(value) => setMonthlyIncome(value[0])}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="essentialExpenses">Essential Expenses</Label>
                            <span className="text-sm font-medium">{formatCurrency(essentialExpenses, 0)}</span>
                          </div>
                          <Input
                            id="essentialExpenses"
                            type="number"
                            value={essentialExpenses}
                            onChange={(e) => setEssentialExpenses(Number(e.target.value))}
                            className="w-full"
                          />
                          <Slider
                            defaultValue={[essentialExpenses]}
                            max={monthlyIncome}
                            step={1000}
                            onValueChange={(value) => setEssentialExpenses(value[0])}
                          />
                          <p className="text-xs text-muted-foreground">
                            Recommended: {formatCurrency(monthlyIncome * 0.5, 0)} (50% of income)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="savingsTarget">Savings Target</Label>
                            <span className="text-sm font-medium">{formatCurrency(savingsTarget, 0)}</span>
                          </div>
                          <Input
                            id="savingsTarget"
                            type="number"
                            value={savingsTarget}
                            onChange={(e) => setSavingsTarget(Number(e.target.value))}
                            className="w-full"
                          />
                          <Slider
                            defaultValue={[savingsTarget]}
                            max={monthlyIncome}
                            step={1000}
                            onValueChange={(value) => setSavingsTarget(value[0])}
                          />
                          <p className="text-xs text-muted-foreground">
                            Recommended: {formatCurrency(monthlyIncome * 0.2, 0)} (20% of income)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className={`p-4 rounded-lg ${budgetResult.discretionarySpending >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                          <p className={`text-sm font-medium ${budgetResult.discretionarySpending >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Discretionary Spending
                          </p>
                          <p className={`text-2xl font-bold ${budgetResult.discretionarySpending >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(Math.max(0, budgetResult.discretionarySpending), 0)}
                          </p>
                          {budgetResult.discretionarySpending < 0 && (
                            <p className="text-xs text-red-600 mt-1">
                              Budget deficit: {formatCurrency(Math.abs(budgetResult.discretionarySpending), 0)}
                            </p>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-between">
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Essentials</p>
                            <p className="text-lg font-bold text-gray-700">
                              {formatCurrency(essentialExpenses, 0)} 
                              <span className="text-sm font-normal text-gray-500 ml-1">
                                ({budgetResult.essentialPercent.toFixed(1)}%)
                              </span>
                            </p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, budgetResult.essentialPercent)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-between">
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Savings</p>
                            <p className="text-lg font-bold text-gray-700">
                              {formatCurrency(savingsTarget, 0)}
                              <span className="text-sm font-normal text-gray-500 ml-1">
                                ({budgetResult.savingsPercent.toFixed(1)}%)
                              </span>
                            </p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, budgetResult.savingsPercent)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="h-64 bg-white rounded-lg p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={budgetData}>
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `${value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}`} />
                            <RechartsTooltip 
                              formatter={(value: any) => [`KES ${formatCurrency(Number(value), 0)}`, 'Amount']}
                            />
                            <Bar dataKey="value" fill="#22c55e" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {budgetResult.discretionarySpending < 0 && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 font-medium">Your budget is not balanced</p>
                          <p className="text-red-600 text-sm mt-1">
                            Reduce your expenses or savings target by {formatCurrency(Math.abs(budgetResult.discretionarySpending), 0)} to balance your budget.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-6">
                    <p className="text-sm text-muted-foreground">
                      Based on the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings.
                    </p>
                    <Button variant="outline">Export</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Currency Converter Tab */}
              <TabsContent value="currency">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Currency Converter
                    </CardTitle>
                    <CardDescription>
                      Convert between Kenyan Shillings and major world currencies.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-12">
                      <LineChart className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-center">Coming Soon</h3>
                      <p className="text-gray-500 text-center mt-2">
                        We're working on adding real-time currency conversion rates.
                        Check back soon!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FinancialTools;
