import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import MpesaLogo from "@/components/MpesaLogo";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";

const SAMPLE_MESSAGES = [
  "IHF5TH877Z Confirmed. Ksh2,500.00 received from EMILY WANJIKU 254722000000 on 12/5/23 at 10:25 AM. New M-PESA balance is Ksh7,452.00. Transaction cost, Ksh0.00.",
  "BG45TH789Y Confirmed. Ksh5,000.00 received from JOHN KAMAU 254722111111 on 12/5/23 at 11:30 AM. New M-PESA balance is Ksh12,452.00. Transaction cost, Ksh0.00.",
  "RE78HY6621 Confirmed. Ksh1,000.00 received from MARY ACHIENG 254722222222 on 12/5/23 at 2:15 PM. New M-PESA balance is Ksh13,452.00. Transaction cost, Ksh0.00."
];

type Transaction = {
  id: string;
  amount: number;
  name: string;
  phone: string;
  date: string;
  time: string;
};

const Demo = () => {
  const [messages, setMessages] = useState("");
  const [parsedTransactions, setParsedTransactions] = useState<Transaction[]>([]);
  const [template, setTemplate] = useState("chama");
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const parseTransactions = (text: string): Transaction[] => {
    const results: Transaction[] = [];
    const lines = text.split("\n").filter(line => line.trim().length > 0);
    
    lines.forEach(line => {
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

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const transactions = parseTransactions(messages);
      setParsedTransactions(transactions);
      setIsProcessing(false);
      setReportGenerated(transactions.length > 0);
    }, 1500);
  };

  const handleLoadSample = () => {
    setMessages(SAMPLE_MESSAGES.join("\n\n"));
  };

  const totalContributed = parsedTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white pb-12">
      <MainNav />

      <main className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Try PesaLytics Demo</h1>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>1. Paste M-PESA Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Paste your M-PESA messages here... Each message should be on a new line."
                className="min-h-[200px]"
                value={messages}
                onChange={(e) => setMessages(e.target.value)}
              />
              <div className="mt-4 flex gap-4">
                <Button 
                  onClick={handleProcess}
                  disabled={!messages.trim() || isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? "Processing..." : "Process Messages"}
                </Button>
                <Button variant="outline" onClick={handleLoadSample}>
                  Load Sample
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>2. Generated Report Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {reportGenerated ? (
                <div className="space-y-6">
                  <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-bold text-center text-green-700">
                      {template === "chama" ? "Chama Contribution Report" : 
                       template === "wedding" ? "Wedding Fundraiser Report" : 
                       "Contribution Report"}
                    </h3>
                    
                    <div className="mb-4 text-center">
                      <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                      <h4 className="mt-2 text-lg font-semibold">Total Contributed: Ksh {totalContributed.toLocaleString('en-US', {minimumFractionDigits: 2})}</h4>
                    </div>
                    
                    <Separator className="my-4" />
                    
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
                      <p>
                        <Link to="/" className="text-green-600 hover:text-green-700">
                          Generated by PesaLytics
                        </Link> - Hesabu Ya Haraka
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="secondary">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share to WhatsApp
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">
                    Process your M-PESA messages to see the generated report here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Demo;
