import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Share, FileText } from "lucide-react";
import { toast } from "sonner";
import { SavedReportType } from "@/types/financialTypes";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";

type ReportData = {
  title: string;
  date: string;
  data: Record<string, any>;
  type: SavedReportType;
};

interface ReportDownloaderProps {
  type: SavedReportType;
  data: Record<string, any>;
  onSave?: (reportName: string, includePersonalInfo: boolean) => void;
}

export function ReportDownloader({ type, data, onSave }: ReportDownloaderProps) {
  const [reportName, setReportName] = useState(`My ${type.charAt(0).toUpperCase() + type.slice(1)}`);
  const [includePersonalInfo, setIncludePersonalInfo] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const generateReport = () => {
    const report: ReportData = {
      title: reportName,
      date: new Date().toISOString(),
      data,
      type
    };

    return report;
  };

  const handleDownloadJson = () => {
    const report = generateReport();
    const reportBlob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(reportBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportName.replace(/\s+/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded as JSON successfully!");
    setIsDialogOpen(false);
  };

  const handleDownloadPdf = () => {
    const report = generateReport();
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(reportName, 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    doc.text(`Report Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`, 20, 40);
    
    let yPosition = 50;
    
    switch(type) {
      case 'loan':
        doc.text(`Loan Amount: KES ${data.loanAmount.toLocaleString()}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Loan Term: ${data.loanTermMonths} months`, 20, yPosition);
        yPosition += 10;
        doc.text(`Interest Rate: ${data.interestRate}%`, 20, yPosition);
        yPosition += 10;
        doc.text(`Processing Fee: ${data.processingFee ? 'Yes (2.5%)' : 'No'}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Monthly Payment: KES ${data.result.monthlyPayment.toLocaleString(undefined, {maximumFractionDigits: 2})}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Total Repayment: KES ${data.result.totalRepayment.toLocaleString(undefined, {maximumFractionDigits: 2})}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Total Interest: KES ${data.result.totalInterest.toLocaleString(undefined, {maximumFractionDigits: 2})}`, 20, yPosition);
        break;
        
      case 'savings':
        doc.text(`Initial Deposit: KES ${data.initialDeposit.toLocaleString()}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Monthly Contribution: KES ${data.monthlyContribution.toLocaleString()}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Time Period: ${data.savingsYears} years`, 20, yPosition);
        yPosition += 10;
        doc.text(`Interest Rate: ${data.savingsRate}%`, 20, yPosition);
        yPosition += 10;
        doc.text(`Future Value: KES ${data.result.futureValue.toLocaleString(undefined, {maximumFractionDigits: 2})}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Total Contributions: KES ${data.result.totalContributions.toLocaleString(undefined, {maximumFractionDigits: 2})}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Interest Earned: KES ${data.result.interestEarned.toLocaleString(undefined, {maximumFractionDigits: 2})}`, 20, yPosition);
        break;
        
      case 'budget':
        doc.text(`Monthly Income: KES ${data.monthlyIncome.toLocaleString()}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Essential Expenses: KES ${data.essentialExpenses.toLocaleString()}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Savings Target: KES ${data.savingsTarget.toLocaleString()}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Discretionary Spending: KES ${Math.max(0, data.result.discretionarySpending).toLocaleString()}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Budget Balanced: ${data.result.isBudgetBalanced ? 'Yes' : 'No'}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Essentials: ${data.result.essentialPercent.toFixed(1)}%`, 20, yPosition);
        yPosition += 10;
        doc.text(`Savings: ${data.result.savingsPercent.toFixed(1)}%`, 20, yPosition);
        yPosition += 10;
        doc.text(`Discretionary: ${data.result.discretionaryPercent.toFixed(1)}%`, 20, yPosition);
        break;
        
      case 'currency':
        doc.text(`Amount: ${data.amount} ${data.fromCurrency}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Converted To: ${data.convertedAmount.toFixed(4)} ${data.toCurrency}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Exchange Rate: 1 ${data.fromCurrency} = ${data.exchangeRate.toFixed(6)} ${data.toCurrency}`, 20, yPosition);
        break;
    }
    
    doc.setFontSize(10);
    doc.text('Generated by PesaLytics - https://pesalytics.com', 20, 280);
    
    doc.save(`${reportName.replace(/\s+/g, "_")}.pdf`);
    
    toast.success("Report downloaded as PDF successfully!");
    setIsDialogOpen(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(reportName, includePersonalInfo);
      toast.success("Report saved to your account!");
    }
    setIsDialogOpen(false);
  };

  const shareToWhatsApp = () => {
    toast.success("Report shared to connected WhatsApp!");
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export {type.charAt(0).toUpperCase() + type.slice(1)} Report</DialogTitle>
          <DialogDescription>
            Customize your report before exporting or saving
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reportName" className="text-right">
              Report Name
            </Label>
            <Input
              id="reportName"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-4 flex items-center space-x-2">
              <Checkbox
                id="includePersonalInfo"
                checked={includePersonalInfo}
                onCheckedChange={(checked) => setIncludePersonalInfo(!!checked)}
              />
              <Label htmlFor="includePersonalInfo">Include personal information</Label>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleDownloadJson}>
                <FileText className="h-4 w-4 mr-2" />
                JSON Format
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPdf}>
                <FileText className="h-4 w-4 mr-2" />
                PDF Format
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {onSave && (
            <Button onClick={handleSave} className="w-full sm:w-auto">
              Save to Account
            </Button>
          )}
          <Button variant="secondary" onClick={shareToWhatsApp} className="w-full sm:w-auto">
            <Share className="h-4 w-4 mr-2" />
            Share to WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
