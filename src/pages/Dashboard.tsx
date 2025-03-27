
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart3, Download, FileText, List, LogOut, Plus, Share2, User } from "lucide-react";
import MpesaLogo from "@/components/MpesaLogo";

type Transaction = {
  id: string;
  amount: number;
  name: string;
  phone: string;
  date: string;
  time: string;
};

const Dashboard = () => {
  const [messages, setMessages] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("chama");
  const [reportTitle, setReportTitle] = useState("Chama Contribution Report");
  const [parsedTransactions, setParsedTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const parseTransactions = (text: string): Transaction[] => {
    const results: Transaction[] = [];
    const lines = text.split("\n").filter(line => line.trim().length > 0);
    
    lines.forEach(line => {
      // This regex pattern attempts to match M-PESA transaction confirmation messages
      const pattern = /(\w+)\s+Confirmed\.\s+Ksh([\d,]+\.\d+)\s+received\s+from\s+([A-Z\s]+)\s+(\d+)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+(\d+:\d+\s+[APM]+)/i;
      const match = line.match(pattern);
      
      if (match) {
        results.push({
          id: match[1],
          amount: parseFloat(match[2].replace(/,/g, '')),
          name: match[3].trim(),
          phone: match[4],
          date: match[5],
          time: match[6]
        });
      }
    });
    
    return results;
  };

  const handleProcessMessages = () => {
    setIsProcessing(true);
    // Simulate processing delay
    setTimeout(() => {
      const transactions = parseTransactions(messages);
      setParsedTransactions(transactions);
      setIsProcessing(false);
      setReportGenerated(transactions.length > 0);
    }, 1500);
  };

  const totalContributed = parsedTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar and navbar */}
      <div className="grid md:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r bg-white md:block">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <MpesaLogo className="h-8 w-8" />
            <h1 className="text-xl font-bold">
              Pesa<span className="text-green-600">Lytics</span>
            </h1>
          </div>
          <nav className="flex flex-col gap-2 p-4">
            <Button variant="ghost" className="justify-start gap-2">
              <FileText className="h-5 w-5" />
              Reports
            </Button>
            <Button variant="ghost" className="justify-start gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </Button>
            <Button variant="ghost" className="justify-start gap-2">
              <User className="h-5 w-5" />
              Account
            </Button>
            <Button variant="ghost" className="justify-start gap-2 text-red-500 hover:text-red-600">
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Top Navbar */}
          <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
            <Button variant="ghost" size="icon" className="md:hidden">
              <List className="h-6 w-6" />
            </Button>
            <h2 className="text-lg font-semibold md:hidden">PesaLytics</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Welcome, John Doe</span>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="container mx-auto p-4 md:p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <Button className="bg-green-600 hover:bg-green-700 gap-2">
                <Plus className="h-4 w-4" />
                New Report
              </Button>
            </div>

            <Tabs defaultValue="new">
              <TabsList className="mb-4">
                <TabsTrigger value="new">New Report</TabsTrigger>
                <TabsTrigger value="saved">Saved Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="new">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Message Input */}
                  <Card>
                    <CardHeader>
                      <CardTitle>1. Paste M-PESA Messages</CardTitle>
                      <CardDescription>
                        Copy and paste your M-PESA transaction messages. Each message should be on a separate line.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        placeholder="Paste your M-PESA messages here..."
                        className="min-h-[250px]"
                        value={messages}
                        onChange={(e) => setMessages(e.target.value)}
                      />
                    </CardContent>
                  </Card>

                  {/* Template Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>2. Choose Report Template</CardTitle>
                      <CardDescription>
                        Select a template for your report and customize the title.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="template">Template Type</Label>
                        <Select 
                          value={selectedTemplate} 
                          onValueChange={setSelectedTemplate}
                        >
                          <SelectTrigger id="template">
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chama">Chama Contribution</SelectItem>
                            <SelectItem value="wedding">Wedding Fundraiser</SelectItem>
                            <SelectItem value="medical">Medical Fund</SelectItem>
                            <SelectItem value="daily">Daily Challenge</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title">Report Title</Label>
                        <input
                          id="title"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                        />
                      </div>
                      
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 mt-4"
                        disabled={!messages.trim() || isProcessing}
                        onClick={handleProcessMessages}
                      >
                        {isProcessing ? "Processing..." : "Generate Report"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Generated Report */}
                {reportGenerated && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>3. Generated Report</CardTitle>
                      <CardDescription>
                        Your report is ready. You can download it or share directly to WhatsApp.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-center text-xl font-bold text-green-700">
                          {reportTitle}
                        </h3>
                        
                        <div className="mb-4 text-center">
                          <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                          <h4 className="mt-2 text-lg font-semibold">Total Contributed: Ksh {totalContributed.toLocaleString('en-US', {minimumFractionDigits: 2})}</h4>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-[1fr_auto] gap-2 font-medium text-green-800">
                            <span>Contributor</span>
                            <span>Amount</span>
                          </div>
                          
                          {parsedTransactions.map((transaction, index) => (
                            <div key={index} className="grid grid-cols-[1fr_auto] gap-2 py-2 border-b border-gray-100">
                              <span>{transaction.name}</span>
                              <span className="font-medium">Ksh {transaction.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 text-center text-sm text-gray-500">
                          <p>Generated by PesaLytics - Hesabu Ya Haraka</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-center gap-4">
                        <Button className="gap-2">
                          <Download className="h-4 w-4" />
                          Download Report
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Share2 className="h-4 w-4" />
                          Share to WhatsApp
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="saved">
                <div className="rounded-lg border bg-card p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Saved Reports Yet</h3>
                  <p className="mt-2 text-muted-foreground">
                    When you generate and save reports, they will appear here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
