import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import { LoanCalculator, convertToMonthlyRate } from "@/utils/calculationUtils";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { PlusCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReportData {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  totalRepayment: number;
  totalInterest: number;
}

const FinancialTools = () => {
  const [type, setType] = useState("loan-calculator");
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(5);
  const [loanTerm, setLoanTerm] = useState<number>(36);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalRepayment, setTotalRepayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [reportName, setReportName] = useState("");
  const [includePersonalInfo, setIncludePersonalInfo] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({
    loanAmount: 0,
    interestRate: 0,
    loanTerm: 0,
    monthlyPayment: 0,
    totalRepayment: 0,
    totalInterest: 0,
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const monthlyRate = convertToMonthlyRate(interestRate);
    const { monthlyPayment, totalRepayment, totalInterest } = LoanCalculator(
      loanAmount,
      monthlyRate,
      loanTerm
    );

    setMonthlyPayment(monthlyPayment);
    setTotalRepayment(totalRepayment);
    setTotalInterest(totalInterest);

    setReportData({
      loanAmount,
      interestRate,
      loanTerm,
      monthlyPayment,
      totalRepayment,
      totalInterest,
    });
  }, [loanAmount, interestRate, loanTerm]);

  const handleSaveReport = async () => {
    try {
      if (!reportName.trim()) {
        toast({
          title: "Report Name Required",
          description: "Please enter a name for your report",
          variant: "destructive"
        });
        return;
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save reports",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase.from('saved_reports').insert({
        user_id: user.id,
        name: reportName,
        type,
        settings: JSON.stringify(reportData),
        include_personal_info: includePersonalInfo,
        created_at: new Date().toISOString()
      });
      
      if (error) throw error;
      
      toast({
        title: "Report Saved",
        description: "Your report has been saved successfully"
      });
      
      setReportName("");
      
    } catch (error) {
      console.error("Failed to save report:", error);
      toast({
        title: "Error Saving Report",
        description: "There was a problem saving your report. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNav />

      <main className="container mx-auto px-4 py-8 flex-grow pt-24">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Financial Tools</h1>
        </div>

        <Tabs defaultValue="loan-calculator" className="w-full">
          <TabsList>
            <TabsTrigger value="loan-calculator" onClick={() => setType("loan-calculator")}>Loan Calculator</TabsTrigger>
          </TabsList>
          <Separator className="my-4" />
          <TabsContent value="loan-calculator">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Loan Calculator</CardTitle>
                <CardDescription>Calculate your loan repayment schedule.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loan-amount">Loan Amount (Ksh)</Label>
                  <Input
                    id="loan-amount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan-term">Loan Term (Months)</Label>
                  <Input
                    id="loan-term"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Summary</h3>
                  <p>Monthly Payment: Ksh {monthlyPayment.toFixed(2)}</p>
                  <p>Total Repayment: Ksh {totalRepayment.toFixed(2)}</p>
                  <p>Total Interest: Ksh {totalInterest.toFixed(2)}</p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="include-personal-info">Include Personal Info</Label>
                  <Switch
                    id="include-personal-info"
                    checked={includePersonalInfo}
                    onCheckedChange={(checked) => setIncludePersonalInfo(checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input
                      id="report-name"
                      type="text"
                      placeholder="Enter report name"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleSaveReport} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Save Report
                  </Button>
                </div>

                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default FinancialTools;
