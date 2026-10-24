/**
 * Lightweight usage analytics — writes to the usage_events table.
 * Fire-and-forget: never blocks the UI, never throws.
 */
import { supabase } from "@/integrations/supabase/client";

export type UsageEvent =
  | "signup"
  | "group_created"
  | "import_started"
  | "transactions_parsed"
  | "import_completed"
  | "report_generated"
  | "report_downloaded"
  | "whatsapp_share_clicked"
  | "public_report_created"
  | "subscription_started"
  | "subscription_cancelled";

export function trackEvent(
  event: UsageEvent,
  userId: string | undefined,
  metadata: Record<string, unknown> = {}
): void {
  if (!userId) return;
  void supabase
    .from("usage_events")
    .insert({ user_id: userId, event, metadata })
    .then(({ error }) => {
      if (error) console.debug("analytics:", error.message);
    });
}
