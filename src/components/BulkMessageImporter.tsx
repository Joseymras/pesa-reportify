
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Clipboard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MpesaTransaction, processBulkMessages } from "@/utils/mpesaParserUtils";

interface BulkMessageImporterProps {
  onMessagesProcessed: (transactions: MpesaTransaction[]) => void;
  disabled?: boolean;
}

const BulkMessageImporter = ({ onMessagesProcessed, disabled = false }: BulkMessageImporterProps) => {
  const [messages, setMessages] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("paste");
  
  const handleTextProcess = async () => {
    if (!messages.trim()) {
      toast.error("Please enter M-PESA messages");
      return;
    }
    
    setIsProcessing(true);
    try {
      const transactions = await processBulkMessages(messages, "text");
      onMessagesProcessed(transactions);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    try {
      // Check file type (accept .txt files)
      if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
        toast.error("Please upload a text (.txt) file");
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size should be less than 2MB");
        return;
      }
      
      const transactions = await processBulkMessages(file, "file");
      onMessagesProcessed(transactions);
      
      // Reset file input
      event.target.value = "";
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to process the file");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setMessages(clipboardText);
        toast.success("Messages pasted from clipboard");
      }
    } catch (error) {
      console.error("Clipboard access error:", error);
      toast.error("Could not access clipboard. Please paste manually.");
    }
  };
  
  const handleClearMessages = () => {
    setMessages("");
    toast.info("Messages cleared");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Import M-PESA Messages
        </CardTitle>
        <CardDescription>
          Quickly import multiple M-PESA messages at once
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="paste">Paste Messages</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>
          
          <TabsContent value="paste">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePasteFromClipboard}
                  disabled={disabled}
                  className="gap-2"
                >
                  <Clipboard className="h-4 w-4" />
                  Paste from Clipboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearMessages}
                  disabled={disabled || !messages}
                >
                  Clear
                </Button>
              </div>
              <Textarea
                value={messages}
                onChange={(e) => setMessages(e.target.value)}
                placeholder="Paste your M-PESA messages here. Multiple messages can be pasted at once."
                disabled={disabled}
                className="min-h-[200px]"
              />
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={disabled || !messages || isProcessing}
                onClick={handleTextProcess}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : "Process Messages"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="upload">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-md p-6 text-center bg-slate-50">
                <Upload className="h-10 w-10 mx-auto text-slate-400" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload a text file containing M-PESA messages
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  File should be .txt format and less than 2MB
                </p>
                <label className="mt-4 inline-block">
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,text/plain"
                    onChange={handleFileUpload}
                    disabled={disabled || isProcessing}
                  />
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    disabled={disabled || isProcessing}
                    asChild
                  >
                    <span>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Select File
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BulkMessageImporter;
