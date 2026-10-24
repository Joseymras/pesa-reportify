/**
 * Contributor matching: exact phone → exact name → fuzzy suggestion.
 * Fuzzy matches are NEVER auto-applied — they are returned as suggestions
 * that the user must confirm in the review step.
 */
import { normalizeName, normalizePhone, ParsedTransaction } from "./parser";

export interface Contributor {
  id: string;
  name: string;
  phone: string | null;
  target_amount: number | null;
}

export type MatchResult =
  | { kind: "phone" | "name"; contributorId: string; confidence: number }
  | { kind: "suggestion"; contributorId: string; confidence: number }
  | { kind: "none" };

/** Levenshtein distance between two strings. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}

/** Similarity 0..1 based on Levenshtein over token-joined names. */
export function nameSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  const sim = 1 - dist / maxLen;
  // Token overlap bonus: if all tokens of the shorter name appear in the longer
  const ta = na.split(" ");
  const tb = nb.split(" ");
  const [shorter, longer] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  const overlap = shorter.filter((t) => longer.includes(t)).length / shorter.length;
  return Math.max(sim, overlap * 0.85);
}

export function matchContributor(
  tx: ParsedTransaction,
  contributors: Contributor[]
): MatchResult {
  const txPhone = normalizePhone(tx.counterpartyPhone);
  const txName = normalizeName(tx.counterpartyName);

  // 1. Exact phone match
  if (txPhone) {
    const byPhone = contributors.find(
      (c) => c.phone && normalizePhone(c.phone) === txPhone
    );
    if (byPhone) return { kind: "phone", contributorId: byPhone.id, confidence: 1 };
  }

  // 2. Exact normalized name match
  if (txName) {
    const byName = contributors.find((c) => normalizeName(c.name) === txName);
    if (byName) return { kind: "name", contributorId: byName.id, confidence: 0.95 };
  }

  // 3. Fuzzy suggestion (requires user confirmation)
  let best: { id: string; score: number } | null = null;
  for (const c of contributors) {
    const score = nameSimilarity(tx.counterpartyName, c.name);
    if (score >= 0.72 && (!best || score > best.score)) {
      best = { id: c.id, score };
    }
  }
  if (best) return { kind: "suggestion", contributorId: best.id, confidence: best.score };

  return { kind: "none" };
}

export type ReconciliationStatus = "paid" | "partial" | "overpaid" | "not_paid" | "no_target";

export function reconcileContributor(
  contributor: Contributor,
  paidTotal: number
): { status: ReconciliationStatus; paidTotal: number; target: number | null; balance: number | null } {
  const target = contributor.target_amount;
  if (target == null || target <= 0) {
    return { status: paidTotal > 0 ? "no_target" : "not_paid", paidTotal, target: null, balance: null };
  }
  const balance = paidTotal - target;
  if (paidTotal >= target && balance > 0.009) return { status: "overpaid", paidTotal, target, balance };
  if (paidTotal >= target) return { status: "paid", paidTotal, target, balance: 0 };
  if (paidTotal > 0) return { status: "partial", paidTotal, target, balance };
  return { status: "not_paid", paidTotal, target, balance };
}
