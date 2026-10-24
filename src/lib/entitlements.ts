/**
 * Client-side entitlement helpers. The server enforces hard limits
 * (group count, monthly transactions) via database triggers; these
 * helpers only drive UI gating (templates, exports, public reports).
 */
import { supabase } from "@/integrations/supabase/client";

export interface PlanInfo {
  planId: string;
  name: string;
  priceKes: number;
  maxGroups: number | null;
  maxTransactionsMonthly: number | null;
  premiumTemplates: boolean;
  publicReports: boolean;
}

const FREE_PLAN: PlanInfo = {
  planId: "free",
  name: "Free",
  priceKes: 0,
  maxGroups: 2,
  maxTransactionsMonthly: 100,
  premiumTemplates: false,
  publicReports: false,
};

export async function getMyPlan(userId: string | undefined): Promise<PlanInfo> {
  if (!userId) return FREE_PLAN;
  try {
    const { data: planId } = await supabase.rpc("get_user_plan", { uid: userId });
    const { data } = await supabase
      .from("plan_limits")
      .select("*")
      .eq("plan_id", planId || "free")
      .single();
    if (!data) return FREE_PLAN;
    return {
      planId: data.plan_id,
      name: data.name,
      priceKes: data.price_kes,
      maxGroups: data.max_groups,
      maxTransactionsMonthly: data.max_transactions_monthly,
      premiumTemplates: data.premium_templates,
      publicReports: data.public_reports,
    };
  } catch {
    return FREE_PLAN;
  }
}

export const PREMIUM_TEMPLATES = ["wedding", "chama", "harambee", "church", "business"];

export function canUseTemplate(plan: PlanInfo, template: string): boolean {
  if (!PREMIUM_TEMPLATES.includes(template)) return true;
  return plan.premiumTemplates;
}
