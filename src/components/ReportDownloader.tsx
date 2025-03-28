
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Share } from "lucide-react";
import { toast } from "sonner";

type ReportData = {
  title: string;
  date: string;
  data: Record<string, any>;
  type: 'loan' | 'savings' | 'budget' | 'currency';
};

interface ReportDownloaderProps {
  type: 'loan' | 'savings' | 'budget' | 'currency';
  data: Record<string, any>;
  onSave?: (reportName: string, includePersonalInfo: boolean) => void;
}

export function ReportDownloader({ type, data, onSave }: ReportDownloaderProps) {
  const [reportName, setReportName] = useState(`My ${type.charAt(0).toUpperCase() + type.slice(1)} Report`);
  const [includePersonalInfo, setIncludePersonalInfo] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const generateReport = () => {
    // Create a report object
    const report: ReportData = {
      title: reportName,
      date: new Date().toISOString(),
      data,
      type
    };

    return report;
  };

  const handleDownload = () => {
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
    
    toast.success("Report downloaded successfully!");
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
          <Button variant="outline" onClick={handleDownload} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
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
