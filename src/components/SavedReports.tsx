
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Share2, Trash2 } from "lucide-react";
import { useState } from "react";

type SavedReport = {
  id: string;
  title: string;
  date: string;
  type: string;
  contributors: number;
  amount: number;
};

const MOCK_REPORTS: SavedReport[] = [
  {
    id: "1",
    title: "Monthly Chama Contribution",
    date: "2023-10-15",
    type: "Chama",
    contributors: 12,
    amount: 24000,
  },
  {
    id: "2",
    title: "Wedding Committee Funds",
    date: "2023-09-30",
    type: "Wedding",
    contributors: 28,
    amount: 56000,
  },
  {
    id: "3",
    title: "Church Construction Fundraiser",
    date: "2023-08-22",
    type: "Fundraiser",
    contributors: 45,
    amount: 87500,
  }
];

const SavedReports = () => {
  const [reports, setReports] = useState<SavedReport[]>(MOCK_REPORTS);

  const deleteReport = (id: string) => {
    setReports(reports.filter(report => report.id !== id));
  };

  return (
    <div>
      {reports.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Saved Reports Yet</h3>
          <p className="mt-2 text-muted-foreground">
            When you generate and save reports, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <CardHeader className="flex-1 pb-2 md:pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          {report.type}
                        </span>
                        <span>•</span>
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{report.contributors} contributors</span>
                      </div>
                    </div>
                    <span className="font-semibold text-green-700">
                      Ksh {report.amount.toLocaleString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-end gap-2 border-t bg-slate-50 p-2 md:border-l md:border-t-0">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:ml-2">View</span>
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:ml-2">Share</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => deleteReport(report.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:ml-2">Delete</span>
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedReports;
