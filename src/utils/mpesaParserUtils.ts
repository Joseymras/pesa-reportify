
import { toast } from "sonner";

/**
 * Advanced utility for parsing M-PESA transaction messages
 */

export type MpesaTransaction = {
  id: string;           // Unique transaction ID/code from M-PESA
  amount: number;       // Transaction amount
  name: string;         // Sender's name
  phone: string;        // Sender's phone number
  date: string;         // Transaction date
  time: string;         // Transaction time
  balance?: number;     // Optional: New M-PESA balance after transaction
  type: "received" | "sent" | "unknown"; // Transaction type
  metadata?: Record<string, any>; // Additional metadata parsed from the message
};

/**
 * Parses M-PESA messages using advanced pattern matching
 * @param text - Raw text containing one or more M-PESA messages
 * @returns An array of parsed MpesaTransaction objects
 */
export const parseTransactions = (text: string): MpesaTransaction[] => {
  const results: MpesaTransaction[] = [];
  
  if (!text?.trim()) {
    return results;
  }
  
  // Split text into individual messages (try different delimiters)
  const potentialDelimiters = ['\n\n', '\r\n\r\n', '\n', '\r\n'];
  let messages: string[] = [text];
  
  for (const delimiter of potentialDelimiters) {
    if (text.includes(delimiter)) {
      messages = text.split(delimiter).filter(m => m.trim().length > 0);
      break;
    }
  }
  
  // Process each message
  messages.forEach(message => {
    try {
      // Pattern for received funds (most common case)
      const receivedPattern = /([A-Z0-9]+)\s+Confirmed\.\s+Ksh([\d,]+\.?\d*)\s+received\s+from\s+([A-Z\s\-\.]+)\s+(\d+)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*[APMapm]{2})\.?\s*New\s+M-PESA\s+balance\s+is\s+Ksh([\d,]+\.?\d*)\./i;
      
      // Pattern for sent funds
      const sentPattern = /([A-Z0-9]+)\s+Confirmed\.\s+Ksh([\d,]+\.?\d*)\s+sent\s+to\s+([A-Z\s\-\.]+)\s+(\d+)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*[APMapm]{2})\.?\s*New\s+M-PESA\s+balance\s+is\s+Ksh([\d,]+\.?\d*)\./i;
      
      // Additional pattern for different format of received funds
      const altReceivedPattern = /([A-Z0-9]+)\s+Confirmed\.\s+You\s+have\s+received\s+Ksh([\d,]+\.?\d*)\s+from\s+([A-Z\s\-\.]+)\s+(\d+)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*[APMapm]{2})/i;
      
      // Try each pattern
      let match = message.match(receivedPattern) || message.match(altReceivedPattern);
      let type: "received" | "sent" | "unknown" = "received";
      
      if (!match) {
        match = message.match(sentPattern);
        type = match ? "sent" : "unknown";
      }
      
      if (match) {
        // Extract all numbers, removing commas
        const amount = parseFloat(match[2].replace(/,/g, ''));
        const balance = match[7] ? parseFloat(match[7].replace(/,/g, '')) : undefined;
        
        results.push({
          id: match[1],
          amount: amount,
          name: match[3].trim(),
          phone: match[4],
          date: match[5],
          time: match[6],
          balance: balance,
          type: type,
        });
      }
    } catch (error) {
      console.error("Error parsing M-PESA message:", error);
    }
  });
  
  return results;
};

/**
 * Extracts M-PESA messages from a file
 * @param file - File object containing text to extract M-PESA messages from
 * @returns Promise that resolves to an array of M-PESA messages
 */
export const extractMessagesFromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        resolve(content);
      } catch (error) {
        console.error("Error reading file:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

/**
 * Filters only "received" transactions from a list of transactions
 * @param transactions - Array of MpesaTransaction objects
 * @returns Array of received transactions
 */
export const filterReceivedTransactions = (transactions: MpesaTransaction[]): MpesaTransaction[] => {
  return transactions.filter(t => t.type === "received");
};

/**
 * Formats M-PESA transactions into a CSV format
 * @param transactions - Array of MpesaTransaction objects
 * @returns CSV formatted string
 */
export const formatTransactionsToCSV = (transactions: MpesaTransaction[]): string => {
  if (transactions.length === 0) {
    return "";
  }
  
  const headers = "Transaction ID,Amount,Name,Phone,Date,Time,Type\n";
  const rows = transactions.map(t => 
    `${t.id},${t.amount},${t.name.replace(/,/g, ' ')},${t.phone},${t.date},${t.time},${t.type}`
  ).join('\n');
  
  return headers + rows;
};

/**
 * Generates a human-readable report from M-PESA transactions
 * @param transactions - Array of MpesaTransaction objects
 * @param title - Report title
 * @returns Formatted report string
 */
export const generateTransactionReport = (
  transactions: MpesaTransaction[],
  title: string
): string => {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const date = new Date().toLocaleDateString();
  
  let report = `${title}\n\n`;
  report += `Date: ${date}\n`;
  report += `Total Amount: Ksh ${totalAmount.toLocaleString('en-KE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`;
  report += `Number of Transactions: ${transactions.length}\n\n`;
  report += "Transactions:\n";
  
  transactions.forEach((transaction, index) => {
    report += `${index + 1}. ${transaction.name} (${transaction.phone}): Ksh ${transaction.amount.toLocaleString('en-KE', {minimumFractionDigits: 2, maximumFractionDigits: 2})} on ${transaction.date} at ${transaction.time}\n`;
  });
  
  report += `\nGenerated by PesaLytics - Hesabu Ya Haraka`;
  
  return report;
};

/**
 * Process messages in bulk from different sources
 * @param content - Text content or file to process
 * @param source - Source type (text or file)
 * @returns Promise resolving to parsed transactions
 */
export const processBulkMessages = async (
  content: string | File,
  source: "text" | "file"
): Promise<MpesaTransaction[]> => {
  try {
    let textContent: string;
    
    if (source === "file") {
      textContent = await extractMessagesFromFile(content as File);
    } else {
      textContent = content as string;
    }
    
    const transactions = parseTransactions(textContent);
    
    if (transactions.length === 0) {
      toast.warning("No valid M-PESA messages found. Please check your input.");
    } else {
      toast.success(`Successfully parsed ${transactions.length} transaction${transactions.length === 1 ? '' : 's'}`);
    }
    
    return transactions;
  } catch (error) {
    console.error("Error processing bulk messages:", error);
    toast.error("Error processing messages. Please try again.");
    return [];
  }
};
