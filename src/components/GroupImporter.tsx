import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle2, FileUp } from "lucide-react";
import { parseMpesaMessages, ParsedTransaction } from "@/lib/mpesa/parser";
import { matchContributor, Contributor } from "@/lib/mpesa/matching";
import { formatCurrency } from "@/utils/calculationUtils";
import { trackEvent } from "@/lib/analytics";

type RowState = {
  tx: ParsedTransaction;
  duplicateInDb: boolean;
  match: ReturnType<typeof matchContributor>;
  selectedContributorId: string | null; // user's choice (may override suggestion)
  excluded: boolean;
};

interface Props {
  groupId: string;
  contributors: Contributor[];
  existingCodes: string[];
  onImported: () => void;
}

const GroupImporter = ({ groupId, contributors, existingCodes, onImported }: Props) => {
  const { user } = useAuth();
  const [raw, setRaw] = useState("");
  const [rows, setRows] = useState<RowState[] | null>(null);
  const [failedCount, setFailedCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleParse = () => {
    if (!raw.trim()) {
      toast.error("Paste your M-PESA messages first");
      return;
    }
    trackEvent("import_started", user?.id, { groupId });
    const summary = parseMpesaMessages(raw);
    if (summary.totalParsed === 0) {
      toast.warning("No valid M-PESA messages found. Check that you copied the full SMS text.");
      return;
    }
    const codeSet = new Set(existingCodes);
    const batchDupes = new Set(summary.duplicatesInBatch);
    setRows(
      summary.transactions.map((tx) => {
        const match = matchContributor(tx, contributors);
        return {
          tx,
          duplicateInDb: codeSet.has(tx.mpesaCode) || batchDupes.has(tx.mpesaCode),
          match,
          selectedContributorId:
            match.kind === "phone" || match.kind === "name" ? match.contributorId : null,
          excluded: codeSet.has(tx.mpesaCode),
        };
      })
    );
    setFailedCount(summary.totalFailed);
    trackEvent("transactions_parsed", user?.id, { groupId, count: summary.totalParsed });
  };

  const stats = useMemo(() => {
    if (!rows) return null;
    const active = rows.filter((r) => !r.excluded && !r.duplicateInDb);
    return {
      total: rows.length,
      active: active.length,
      dupes: rows.filter((r) => r.duplicateInDb).length,
      review: active.filter((r) => r.tx.needsReview || r.match.kind !== "phone").length,
      amount: active
        .filter((r) => r.tx.type === "received" || r.tx.type === "deposit")
        .reduce((s, r) => s + r.tx.amount, 0),
    };
  }, [rows]);

  const updateRow = (idx: number, patch: Partial<RowState>) => {
    setRows((prev) => prev && prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const handleConfirm = async () => {
    if (!user || !rows) return;
    const toInsert = rows.filter((r) => !r.excluded && !r.duplicateInDb);
    if (toInsert.length === 0) {
      toast.info("Nothing new to import");
      return;
    }
    setSaving(true);
    try {
      // Store the raw messages for audit
      await supabase.from("raw_messages").insert(
        toInsert.map((r) => ({
          user_id: user.id,
          group_id: groupId,
          content: r.tx.raw,
          parsed: true,
        }))
      );

      const { error } = await supabase.from("transactions").insert(
        toInsert.map((r) => ({
          user_id: user.id,
          group_id: groupId,
          contributor_id: r.selectedContributorId,
          mpesa_code: r.tx.mpesaCode,
          amount: r.tx.amount,
          type: r.tx.type,
          counterparty_name: r.tx.counterpartyName || null,
          counterparty_phone: r.tx.counterpartyPhone || null,
          occurred_at: r.tx.occurredAt,
          balance: r.tx.balance,
          confidence: r.tx.confidence,
          needs_review: r.tx.needsReview,
        }))
      );
      if (error) throw error;

      trackEvent("import_completed", user?.id, { groupId, count: toInsert.length });
      toast.success(`Imported ${toInsert.length} transaction${toInsert.length === 1 ? "" : "s"}`);
      setRows(null);
      setRaw("");
      onImported();
    } catch (e: any) {
      toast.error(e.message || "Import failed");
    } finally {
      setSaving(false);
    }
  };

  if (!rows) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Copy M-PESA SMS messages from your phone (select many at once in your SMS app)
          and paste them here — no need to copy one by one.
        </p>
        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={10}
          placeholder={"QK12ABC345 Confirmed. You have received Ksh2,000.00 from JANE DOE 0722334455 on 24/10/26 at 1:05 PM. New M-PESA balance is Ksh5,000.00...\n\nPaste as many messages as you like."}
          className="font-mono text-sm"
        />
        <div className="flex items-center gap-3">
          <Button onClick={handleParse} className="bg-green-600 hover:bg-green-700">
            <FileUp className="mr-2 h-4 w-4" /> Parse messages
          </Button>
          <span className="text-xs text-muted-foreground">
            You'll review everything before anything is saved.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <Badge variant="secondary">{stats?.total} parsed</Badge>
        <Badge className="bg-green-100 text-green-800">{stats?.active} to import</Badge>
        {stats?.dupes ? <Badge variant="outline">{stats.dupes} duplicates skipped</Badge> : null}
        {stats?.review ? (
          <Badge className="bg-amber-100 text-amber-800">
            <AlertTriangle className="mr-1 h-3 w-3" /> {stats.review} need review
          </Badge>
        ) : null}
        {failedCount ? <Badge variant="destructive">{failedCount} unrecognized</Badge> : null}
        <Badge variant="outline">Incoming total: Ksh {formatCurrency(stats?.amount || 0)}</Badge>
      </div>

      <div className="rounded-md border overflow-auto max-h-[480px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>From / To</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Contributor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => {
              const disabled = r.duplicateInDb;
              return (
                <TableRow key={r.tx.mpesaCode + i} className={disabled || r.excluded ? "opacity-50" : ""}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={!r.excluded && !disabled}
                      disabled={disabled}
                      onChange={(e) => updateRow(i, { excluded: !e.target.checked })}
                      aria-label={`Include ${r.tx.mpesaCode}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.tx.mpesaCode}
                    {r.duplicateInDb && <div className="text-xs text-amber-600">already imported</div>}
                    {r.tx.needsReview && !r.duplicateInDb && (
                      <div className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> low confidence
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="capitalize text-sm">{r.tx.type}</TableCell>
                  <TableCell className="text-right font-medium">
                    Ksh {formatCurrency(r.tx.amount)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{r.tx.counterpartyName || "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.tx.counterpartyPhone}</div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {r.tx.occurredAt
                      ? new Date(r.tx.occurredAt).toLocaleDateString("en-KE")
                      : r.tx.dateRaw || "—"}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={r.selectedContributorId || "none"}
                      onValueChange={(v) =>
                        updateRow(i, { selectedContributorId: v === "none" ? null : v })
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— Unassigned —</SelectItem>
                        {contributors.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                            {r.match.kind === "suggestion" && r.match.contributorId === c.id
                              ? " (suggested)"
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {r.match.kind === "suggestion" && !r.selectedContributorId && (
                      <button
                        className="text-xs text-green-700 underline mt-1"
                        onClick={() =>
                          updateRow(i, { selectedContributorId: (r.match as any).contributorId })
                        }
                      >
                        Accept suggestion
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleConfirm} disabled={saving} className="bg-green-600 hover:bg-green-700">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
          Confirm & import {stats?.active} transactions
        </Button>
        <Button variant="ghost" onClick={() => setRows(null)}>Back</Button>
      </div>
    </div>
  );
};

export default GroupImporter;
