/**
 * PesaLytics M-PESA parser v2
 * Deterministic, rule-based parsing of Safaricom M-PESA SMS messages.
 * Supports: received, sent, paybill, till (buy goods), withdraw, deposit,
 * airtime, and reversal messages. Every parsed row carries a confidence
 * score; uncertain rows are flagged for review, never silently accepted.
 */

export type MpesaTxType =
  | "received"
  | "sent"
  | "paybill"
  | "till"
  | "withdraw"
  | "deposit"
  | "airtime"
  | "reversal"
  | "unknown";

export interface ParsedTransaction {
  mpesaCode: string;
  amount: number;
  type: MpesaTxType;
  counterpartyName: string;
  counterpartyPhone: string;
  occurredAt: string | null; // ISO string
  dateRaw: string;
  timeRaw: string;
  balance: number | null;
  transactionCost: number | null;
  confidence: number; // 0..1
  needsReview: boolean;
  raw: string;
  parseNotes: string[];
}

export interface ParseSummary {
  transactions: ParsedTransaction[];
  totalParsed: number;
  totalFailed: number;
  duplicatesInBatch: string[];
  totalReceived: number;
  totalSent: number;
  lowConfidenceCount: number;
  failedMessages: string[];
}

const AMOUNT = "([\\d,]+(?:\\.\\d{1,2})?)";
const CODE = "([A-Z0-9]{8,12})";
const DATE = "(\\d{1,2}\\/\\d{1,2}\\/\\d{2,4})";
const TIME = "(\\d{1,2}:\\d{2}\\s*(?:AM|PM|am|pm))";
const PHONE = "(\\d{10,13}|\\+?254\\d{9}|0\\d{9})";

function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/,/g, ""));
}

/** Normalize a Kenyan phone number to 2547XXXXXXXX form. */
export function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return "";
  let p = raw.replace(/[^\d+]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0") && p.length === 10) p = "254" + p.slice(1);
  if (p.startsWith("7") && p.length === 9) p = "254" + p;
  if (p.startsWith("1") && p.length === 9) p = "254" + p; // 01XXXXXXXX lines
  return p;
}

/** Normalize a name for matching: uppercase, collapse spaces, strip punctuation. */
export function normalizeName(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parse M-PESA date/time like "24/10/26 at 3:15 PM" into an ISO string. */
function parseDateTime(dateRaw: string, timeRaw: string): string | null {
  try {
    const [d, m, y] = dateRaw.split("/").map((s) => parseInt(s, 10));
    const year = y < 100 ? 2000 + y : y;
    const tMatch = timeRaw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!tMatch) return null;
    let hour = parseInt(tMatch[1], 10);
    const minute = parseInt(tMatch[2], 10);
    const meridiem = tMatch[3].toUpperCase();
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    const dt = new Date(Date.UTC(year, m - 1, d, hour, minute));
    if (isNaN(dt.getTime())) return null;
    return dt.toISOString();
  } catch {
    return null;
  }
}

function extractBalance(msg: string): number | null {
  const m = msg.match(/New M-PESA balance is Ksh\s*([\d,]+(?:\.\d{1,2})?)/i);
  return m ? parseAmount(m[1]) : null;
}

function extractCost(msg: string): number | null {
  const m = msg.match(/Transaction cost,?\s*Ksh\s*([\d,]+(?:\.\d{1,2})?)/i);
  return m ? parseAmount(m[1]) : null;
}

/** Split pasted text into individual M-PESA messages. */
export function splitMessages(text: string): string[] {
  if (!text?.trim()) return [];
  // M-PESA messages start with a transaction code followed by "Confirmed" or similar.
  // Split before each code that begins a message.
  const normalized = text.replace(/\r\n/g, "\n");
  const parts = normalized.split(/(?=^[A-Z0-9]{8,12}\s+(?:Confirmed|Failed|confirmed))/m);
  const msgs = parts
    .map((p) => p.trim())
    .filter((p) => /^[A-Z0-9]{8,12}\s+(Confirmed|Failed)/.test(p));
  if (msgs.length > 0) return msgs;
  // Fallback: split on blank lines
  return normalized
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);
}

interface Rule {
  type: MpesaTxType;
  pattern: RegExp;
  map: (m: RegExpMatchArray, msg: string) => Partial<ParsedTransaction>;
}

const RULES: Rule[] = [
  {
    // "QK123ABCDE Confirmed. Ksh1,500.00 sent to JOHN DOE 0712345678 on 24/10/26 at 3:15 PM. New M-PESA balance is Ksh..."
    type: "sent",
    pattern: new RegExp(
      `${CODE}\\s+Confirmed\\.\\s*Ksh\\s*${AMOUNT}\\s+sent to\\s+(.+?)\\s+${PHONE}\\s+on\\s+${DATE}\\s+at\\s+${TIME}`,
      "i"
    ),
    map: (m) => ({
      mpesaCode: m[1],
      amount: parseAmount(m[2]),
      counterpartyName: m[3].trim(),
      counterpartyPhone: normalizePhone(m[4]),
      dateRaw: m[5],
      timeRaw: m[6],
    }),
  },
  {
    // "QK123ABCDE Confirmed. You have received Ksh2,000.00 from JANE DOE 0722334455 on 24/10/26 at 1:05 PM..."
    type: "received",
    pattern: new RegExp(
      `${CODE}\\s+Confirmed\\.\\s*You have received\\s+Ksh\\s*${AMOUNT}\\s+from\\s+(.+?)\\s+${PHONE}\\s+on\\s+${DATE}\\s+at\\s+${TIME}`,
      "i"
    ),
    map: (m) => ({
      mpesaCode: m[1],
      amount: parseAmount(m[2]),
      counterpartyName: m[3].trim(),
      counterpartyPhone: normalizePhone(m[4]),
      dateRaw: m[5],
      timeRaw: m[6],
    }),
  },
  {
    // "QK123ABCDE Confirmed. Ksh1,000.00 received from JOHN DOE 0712345678 on 24/10/26 at 3:15 PM..."
    type: "received",
    pattern: new RegExp(
      `${CODE}\\s+Confirmed\\.\\s*Ksh\\s*${AMOUNT}\\s+received\\s+from\\s+(.+?)\\s+${PHONE}\\s+on\\s+${DATE}\\s+at\\s+${TIME}`,
      "i"
    ),
    map: (m) => ({
      mpesaCode: m[1],
      amount: parseAmount(m[2]),
      counterpartyName: m[3].trim(),
      counterpartyPhone: normalizePhone(m[4]),
      dateRaw: m[5],
      timeRaw: m[6],
    }),
  },
  {
    // Paybill: "...Ksh500.00 paid to NAIVAS LTD. on 24/10/26 at 2:00 PM..." or "sent to X Paybill"
    type: "paybill",
    pattern: new RegExp(
      `${CODE}\\s+Confirmed\\.\\s*Ksh\\s*${AMOUNT}\\s+paid to\\s+(.+?)\\.?\\s+on\\s+${DATE}\\s+at\\s+${TIME}`,
      "i"
    ),
    map: (m) => ({
      mpesaCode: m[1],
      amount: parseAmount(m[2]),
      counterpartyName: m[3].trim(),
      counterpartyPhone: "",
      dateRaw: m[4],
      timeRaw: m[5],
    }),
  },
  {
    // Buy goods (till): "...Ksh350.00 paid to TILL NO 123456 - SHOP NAME on ..."
    type: "till",
    pattern: new RegExp(
      `${CODE}\\s+Confirmed\\.\\s*Ksh\\s*${AMOUNT}\\s+paid to\\s+(.+?)\\s+for\\s+account\\s+(.+?)\\s+on\\s+${DATE}\\s+at\\s+${TIME}`,
      "i"
    ),
    map: (m) => ({
      mpesaCode: m[1],
      amount: parseAmount(m[2]),
      counterpartyName: m[3].trim(),
      counterpartyPhone: "",
      dateRaw: m[5],
      timeRaw: m[6],
    }),
  },
  {
    // Withdraw: "...Ksh5,000.00 withdrawn from 123456 - AGENT NAME on ..."
    type: "withdraw",
    pattern: new RegExp(
      `${CODE}\\s+Confirmed\\.\\s*(?:On\\s+${DATE}\\s+at\\s+${TIME}\\s+)?Withdraw\\s+Ksh\\s*${AMOUNT}\\s+from\\s+(.+?)(?:\\s+New M-PESA|\\.|$)`,
      "i"
    ),
    map: (m) => ({
      mpesaCode: m[1],
      dateRaw: m[2] || "",
      timeRaw: m[3] || "",
      amount: parseAmount(m[4]),
      counterpartyName: (m[5] || "").trim(),
      counterpartyPhone: "",
    }),
  },
  {
    // Deposit / "Give God..." style agent deposit
    type: "deposit",
    pattern: new RegExp(
      `${CODE}\\s+Confirmed\\.\\s*(?:On\\s+${DATE}\\s+at\\s+${TIME}\\s+)?(?:Give|Deposit)\\s+Ksh\\s*${AMOUNT}\\s+(?:cash\\s+)?to\\s+(.+?)(?:\\s+New M-PESA|\\.|$)`,
      "i"
    ),
    map: (m) => ({
      mpesaCode: m[1],
      dateRaw: m[2] || "",
      timeRaw: m[3] || "",
      amount: parseAmount(m[4]),
      counterpartyName: (m[5] || "").trim(),
      counterpartyPhone: "",
    }),
  },
  {
    // Airtime: "...Ksh100.00 of airtime on 24/10/26 at 3:15 PM..."
    type: "airtime",
    pattern: new RegExp(
      `${CODE}\\s+Confirmed\\.\\s*You bought\\s+Ksh\\s*${AMOUNT}\\s+of airtime(?:\\s+for\\s+(${PHONE.slice(1, -1)}|yourself))?\\s+on\\s+${DATE}\\s+at\\s+${TIME}`,
      "i"
    ),
    map: (m) => ({
      mpesaCode: m[1],
      amount: parseAmount(m[2]),
      counterpartyName: m[3] ? normalizePhone(m[3]) : "Self",
      counterpartyPhone: m[3] ? normalizePhone(m[3]) : "",
      dateRaw: m[4],
      timeRaw: m[5],
    }),
  },
  {
    // Reversal: "...Confirmed. Reversal of transaction QK... has been successfully reversed..."
    type: "reversal",
    pattern: new RegExp(
      `${CODE}\\s+Confirmed\\.\\s*Reversal of transaction\\s+([A-Z0-9]+)`,
      "i"
    ),
    map: (m) => ({
      mpesaCode: m[1],
      amount: 0,
      counterpartyName: `Reversal of ${m[2]}`,
      counterpartyPhone: "",
      dateRaw: "",
      timeRaw: "",
    }),
  },
];

function parseOne(message: string): ParsedTransaction | null {
  for (const rule of RULES) {
    const m = message.match(rule.pattern);
    if (m) {
      const partial = rule.map(m, message);
      const notes: string[] = [];
      let confidence = 0.95;

      const occurredAt =
        partial.dateRaw && partial.timeRaw
          ? parseDateTime(partial.dateRaw, partial.timeRaw)
          : null;

      if (!occurredAt && partial.dateRaw) {
        confidence -= 0.2;
        notes.push("Could not parse date/time");
      }
      if (!partial.counterpartyPhone && (rule.type === "received" || rule.type === "sent")) {
        confidence -= 0.25;
        notes.push("Missing counterparty phone");
      }
      if (!partial.counterpartyName) {
        confidence -= 0.15;
        notes.push("Missing counterparty name");
      }

      const balance = extractBalance(message);
      const cost = extractCost(message);

      return {
        mpesaCode: partial.mpesaCode || "",
        amount: partial.amount ?? 0,
        type: rule.type,
        counterpartyName: partial.counterpartyName || "",
        counterpartyPhone: partial.counterpartyPhone || "",
        occurredAt,
        dateRaw: partial.dateRaw || "",
        timeRaw: partial.timeRaw || "",
        balance,
        transactionCost: cost,
        confidence: Math.max(0.3, Math.round(confidence * 100) / 100),
        needsReview: confidence < 0.8,
        raw: message,
        parseNotes: notes,
      };
    }
  }
  return null;
}

/** Parse a blob of pasted M-PESA messages into structured transactions. */
export function parseMpesaMessages(text: string): ParseSummary {
  const messages = splitMessages(text);
  const transactions: ParsedTransaction[] = [];
  const failedMessages: string[] = [];
  const seen = new Set<string>();
  const duplicatesInBatch: string[] = [];

  for (const msg of messages) {
    const parsed = parseOne(msg);
    if (!parsed) {
      failedMessages.push(msg.slice(0, 120));
      continue;
    }
    if (seen.has(parsed.mpesaCode)) {
      duplicatesInBatch.push(parsed.mpesaCode);
      continue;
    }
    seen.add(parsed.mpesaCode);
    transactions.push(parsed);
  }

  const totalReceived = transactions
    .filter((t) => t.type === "received" || t.type === "deposit")
    .reduce((s, t) => s + t.amount, 0);
  const totalSent = transactions
    .filter((t) => ["sent", "paybill", "till", "withdraw", "airtime"].includes(t.type))
    .reduce((s, t) => s + t.amount, 0);

  return {
    transactions,
    totalParsed: transactions.length,
    totalFailed: failedMessages.length,
    duplicatesInBatch,
    totalReceived,
    totalSent,
    lowConfidenceCount: transactions.filter((t) => t.needsReview).length,
    failedMessages,
  };
}
