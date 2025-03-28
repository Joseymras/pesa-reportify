
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Check, AlertCircle } from "lucide-react";
import { parseTransactions, MpesaTransaction } from "@/utils/mpesaParserUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function MpesaBulkImporter() {
  const [messages, setMessages] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!messages.trim()) {
      toast({
        title: "No messages to import",
        description: "Please paste your M-Pesa messages in the text area",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    let successful = 0;
    let failed = 0;
    
    try {
      const messageLines = messages
        .split(/\n{2,}|(?:----+)|(?:====+)/)
        .filter(msg => msg.trim())
        .map(msg => msg.trim());
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast({
          title: "Not logged in",
          description: "Please log in to save your transactions",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      for (const message of messageLines) {
        try {
          const parsedTransactions = parseTransactions(message);
          if (parsedTransactions.length > 0) {
            const transaction = parsedTransactions[0];
            
            const { error } = await supabase.from('mpesa_transactions').insert({
              user_id: userData.user.id,
              transaction_id: transaction.id || `TX${Date.now()}${Math.floor(Math.random() * 1000)}`,
              transaction_type: transaction.type,
              amount: transaction.amount,
              sender_receiver: transaction.name, // Changed from senderReceiver to name
              timestamp: transaction.date ? new Date(transaction.date).toISOString() : new Date().toISOString(),
              balance: transaction.balance,
              raw_message: message
            });
            
            if (error) {
              console.error("Error storing transaction:", error);
              failed++;
            } else {
              successful++;
            }
          } else {
            failed++;
          }
        } catch (err) {
          console.error("Error processing message:", err);
          failed++;
        }
        
        setProcessedCount(successful);
        setErrorCount(failed);
      }
      
      if (successful > 0) {
        toast({
          title: "Import Successful",
          description: `Imported ${successful} transactions successfully${failed > 0 ? `, with ${failed} errors` : ''}`,
          variant: successful > 0 ? "default" : "destructive"
        });
      } else {
        toast({
          title: "Import Failed",
          description: "Could not parse any valid M-Pesa messages. Please check the format.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error("Error importing messages:", error);
      toast({
        title: "Import Error",
        description: "An error occurred while importing messages",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    setMessages(pastedText);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-green-600" />
          Bulk M-Pesa Message Import
        </CardTitle>
        <CardDescription>
          Paste multiple M-Pesa messages at once to import them into your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Paste your M-Pesa messages here... 
            
Example:
FGH32YRHKL Confirmed. Ksh1,000 sent to JOHN DOE on 5/6/23 at 3:45 PM. New M-PESA balance is Ksh5,432. Transaction cost, Ksh12.

DFG86POIUY Confirmed. You have received Ksh2,500 from JANE SMITH on 5/6/23 at 5:30 PM. New M-PESA balance is Ksh7,932."
            value={messages}
            onChange={(e) => setMessages(e.target.value)}
            onPaste={handlePaste}
            className="min-h-[200px]"
          />
          <p className="text-xs text-muted-foreground">
            You can paste multiple messages at once. We'll automatically separate and process each message.
          </p>
        </div>
        
        <Button 
          onClick={handleImport} 
          disabled={isProcessing || !messages.trim()} 
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Import Messages"}
        </Button>
        
        {isProcessing && (
          <div className="text-center text-sm text-muted-foreground">
            Processing messages... {processedCount} successful, {errorCount} failed
          </div>
        )}
        
        {processedCount > 0 && !isProcessing && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md text-green-700">
            <Check className="h-5 w-5" />
            <span>Successfully imported {processedCount} transactions</span>
          </div>
        )}
        
        {errorCount > 0 && !isProcessing && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-md text-amber-700">
            <AlertCircle className="h-5 w-5" />
            <span>{errorCount} messages could not be processed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
