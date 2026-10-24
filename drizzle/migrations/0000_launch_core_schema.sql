-- ============ PesaLytics launch core schema ============

-- Plan limits (config table)
CREATE TABLE public.plan_limits (
  plan_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_kes INTEGER NOT NULL DEFAULT 0,
  max_groups INTEGER,                 -- NULL = unlimited
  max_transactions_monthly INTEGER,   -- NULL = unlimited
  premium_templates BOOLEAN NOT NULL DEFAULT false,
  public_reports BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plan_limits TO anon, authenticated;
GRANT ALL ON public.plan_limits TO service_role;
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read plan limits" ON public.plan_limits FOR SELECT TO anon, authenticated USING (true);

-- Seed plan configuration (backfill of new config table)
INSERT INTO public.plan_limits (plan_id, name, price_kes, max_groups, max_transactions_monthly, premium_templates, public_reports) VALUES
  ('free', 'Free', 0, 2, 100, false, false),
  ('plus', 'Plus', 299, NULL, 2000, true, true),
  ('pro', 'Pro', 799, NULL, 10000, true, true);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL DEFAULT 'free' REFERENCES public.plan_limits(plan_id),
  status TEXT NOT NULL DEFAULT 'active',  -- active | cancelled | expired | pending
  current_period_end TIMESTAMPTZ,
  paystack_customer_code TEXT,
  paystack_subscription_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  plan_id TEXT REFERENCES public.plan_limits(plan_id),
  amount_kes INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | success | failed | cancelled
  provider TEXT NOT NULL DEFAULT 'paystack',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_user ON public.payments(user_id);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Contribution groups / campaigns
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',  -- wedding | chama | medical | harambee | church | school_fees | family | business | other
  description TEXT,
  target_amount NUMERIC(12,2),
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'active',  -- active | completed | archived
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_groups_user ON public.groups(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;
GRANT ALL ON public.groups TO service_role;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own groups" ON public.groups FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all groups" ON public.groups FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Helper: does current user own a group
CREATE OR REPLACE FUNCTION public.owns_group(gid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.groups WHERE id = gid AND user_id = auth.uid());
$$;
REVOKE EXECUTE ON FUNCTION public.owns_group(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.owns_group(UUID) TO authenticated;

-- Contributors (expected payers in a group)
CREATE TABLE public.contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  target_amount NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_contributors_group ON public.contributors(group_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contributors TO authenticated;
GRANT ALL ON public.contributors TO service_role;
ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group owners can manage contributors" ON public.contributors FOR ALL TO authenticated USING (owns_group(group_id)) WITH CHECK (owns_group(group_id));

-- Raw pasted M-PESA messages
CREATE TABLE public.raw_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  parsed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_raw_messages_user ON public.raw_messages(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.raw_messages TO authenticated;
GRANT ALL ON public.raw_messages TO service_role;
ALTER TABLE public.raw_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own raw messages" ON public.raw_messages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Parsed transactions (group-scoped, deduped by mpesa_code per user)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  contributor_id UUID REFERENCES public.contributors(id) ON DELETE SET NULL,
  mpesa_code TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'received',  -- received | sent | paybill | till | withdraw | deposit | airtime | reversal
  counterparty_name TEXT,
  counterparty_phone TEXT,
  occurred_at TIMESTAMPTZ,
  balance NUMERIC(12,2),
  confidence NUMERIC(3,2) NOT NULL DEFAULT 1,
  needs_review BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mpesa_code)
);
CREATE INDEX idx_transactions_group ON public.transactions(group_id);
CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_occurred ON public.transactions(occurred_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own transactions" ON public.transactions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Reports (snapshots with optional safe public link)
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  template TEXT NOT NULL DEFAULT 'general',
  snapshot JSONB NOT NULL,
  public_slug TEXT UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_user ON public.reports(user_id);
CREATE INDEX idx_reports_group ON public.reports(group_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own reports" ON public.reports FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Usage events (lightweight analytics)
CREATE TABLE public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_usage_events_user ON public.usage_events(user_id);
GRANT SELECT, INSERT ON public.usage_events TO authenticated;
GRANT ALL ON public.usage_events TO service_role;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can log their own events" ON public.usage_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view their own events" ON public.usage_events FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all events" ON public.usage_events FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Audit logs for sensitive actions
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can log their own audit entries" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- ============ Entitlement helpers ============

-- Current effective plan for a user
CREATE OR REPLACE FUNCTION public.get_user_plan(uid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT s.plan_id FROM public.subscriptions s
     WHERE s.user_id = uid AND s.status = 'active'
       AND (s.current_period_end IS NULL OR s.current_period_end > now())
     ORDER BY s.created_at DESC LIMIT 1),
    'free'
  );
$$;
REVOKE EXECUTE ON FUNCTION public.get_user_plan(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_user_plan(UUID) TO authenticated;

-- Enforce group count limit
CREATE OR REPLACE FUNCTION public.enforce_group_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lim INTEGER;
  cur INTEGER;
BEGIN
  SELECT pl.max_groups INTO lim
  FROM public.plan_limits pl
  WHERE pl.plan_id = public.get_user_plan(NEW.user_id);

  IF lim IS NOT NULL THEN
    SELECT COUNT(*) INTO cur FROM public.groups WHERE user_id = NEW.user_id AND status <> 'archived';
    IF cur >= lim THEN
      RAISE EXCEPTION 'Group limit reached for your plan (% groups). Upgrade to create more.', lim;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_enforce_group_limit BEFORE INSERT ON public.groups FOR EACH ROW EXECUTE FUNCTION public.enforce_group_limit();

-- Enforce monthly transaction limit
CREATE OR REPLACE FUNCTION public.enforce_transaction_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lim INTEGER;
  cur INTEGER;
BEGIN
  SELECT pl.max_transactions_monthly INTO lim
  FROM public.plan_limits pl
  WHERE pl.plan_id = public.get_user_plan(NEW.user_id);

  IF lim IS NOT NULL THEN
    SELECT COUNT(*) INTO cur FROM public.transactions
    WHERE user_id = NEW.user_id
      AND created_at >= date_trunc('month', now());
    IF cur >= lim THEN
      RAISE EXCEPTION 'Monthly transaction limit reached for your plan (% transactions). Upgrade to import more.', lim;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_enforce_transaction_limit BEFORE INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.enforce_transaction_limit();

-- updated_at maintenance
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_groups_touch BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_subscriptions_touch BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_payments_touch BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ Safe public report access ============
-- Returns a privacy-safe projection (masked phones, no raw messages) for a public report slug.
CREATE OR REPLACE FUNCTION public.get_public_report(slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  result JSONB;
BEGIN
  SELECT id, title, template, snapshot, created_at INTO r
  FROM public.reports
  WHERE public_slug = slug AND is_public = true;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  result := jsonb_build_object(
    'title', r.title,
    'template', r.template,
    'created_at', r.created_at,
    'snapshot', r.snapshot
  );
  RETURN result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_report(TEXT) TO anon, authenticated;