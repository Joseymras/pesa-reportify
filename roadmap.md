# PesaLytics Launch Roadmap

Goal: production completion of the existing app around the core flow:
group/campaign → paste M-PESA messages → deterministic parse (code, amount, name, phone, date/time, type, balance) → normalize → dedupe → confidence → review/confirm → contributor matching (exact phone/name; fuzzy = suggestion only) → reconciliation vs targets → report → PDF/PNG/CSV export → WhatsApp share → safe public link.

## Findings from inspection (2026-09-01)
- Stack: Vite + React 18 + shadcn; Lovable Cloud connected; types.ts regenerated with existing 11 tables (profiles, admin_users, mpesa_transactions, saved_reports, referrals, referred_users, referral_rewards, notifications, chat_messages, blog_posts, financial_news).
- Auth is real (AuthContext + ProtectedRoute + Supabase). Preserve.
- Parser (src/utils/mpesaParserUtils.ts) handles only 3 formats, no paybill/till/withdraw/deposit, no confidence, no dedupe, no phone/date normalization → rewrite as src/lib/mpesa/parser.ts, keep old exports as wrappers.
- MpesaBulkImporter inserts rows one-by-one with no review step; BulkMessageImporter is a duplicate — consolidate into one review-first importer.
- Dashboard uses hardcoded fake metrics (income 50000 etc.) → replace with real queries.
- Edge functions exist: process-payment / verify-payment (Chpter; CHPTER_API_KEY secret NOT set), ai-assistant, newsletter-signup. No webhook handler yet.
- index.html still has template title/meta "pesa-reportify / Lovable Generated Project" → must fix.
- MainNav has "Not implemented yet" Settings/Support items; avatar hardcoded to shadcn.png.
- PWA: manifest references missing logo192/logo512/maskable icons; SW caches network-first, skips Supabase (ok baseline).
- TawkChat has hardcoded property id; Google Ads script loaded from /google-ads.js.

## Phase 1 — Backend schema (FIRST: single migration, then types regen)
- [ ] Tables: groups, contributors, raw_messages, transactions (group-scoped; unique (user_id, mpesa_code)), reports (snapshot jsonb + public_slug + safe public_snapshot), report_shares, subscriptions, payments, usage_events, audit_logs, plan_limits (configurable free/plus/pro rows).
- [ ] GRANTs per table + strict RLS (owner via auth.uid(); contributors/transactions via owns_group() security-definer fn; admin read via is_admin()).
- [ ] get_public_report(slug) SECURITY DEFINER returning safe projection only (no raw messages, masked phones). Grant execute to anon.
- [ ] Server-side entitlement triggers: enforce group count + monthly transaction limits from plan_limits based on active subscription (default free: 2 groups / 100 tx/mo; plus 299: unlimited groups / 2000 tx; pro 799: 10000 tx).
- [ ] Indexes on group_id, user_id, occurred_at, mpesa_code; updated_at triggers.

## Phase 2 — Parser v2 + bulk import
- [ ] src/lib/mpesa/parser.ts: deterministic regex rules for received / sent / paybill / till (buy goods) / withdraw / deposit / airtime / reversal; Ksh & KES amount parsing; Kenyan phone normalization (+2547xx/07xx/2547xx); date `d/m/yy at h:mm AM` parsing; transaction cost; balance; per-message confidence score; never silently accept uncertain rows.
- [ ] Duplicate detection by mpesa_code (within paste + against DB).
- [ ] Rebuild importer: paste → parse summary (totals, counts, dupes, errors, low-confidence) → editable review table → confirm → persist raw_messages + transactions. Delete duplicate BulkMessageImporter.

## Phase 3 — Groups, matching, reconciliation
- [ ] /groups list + create (types: Wedding, Chama, Medical, Harambee, Church, School Fees, Family, Business, Other; target, deadline, status).
- [ ] /groups/:id detail: overview metrics, contributors (individual targets, multiple contributions), transactions, import tab, reports tab.
- [ ] Matching: exact normalized phone → exact normalized name → fuzzy (Levenshtein/token) as suggestion requiring confirm; manual assign.
- [ ] Reconciliation statuses: Paid / Partial / Not Paid / Overpaid per contributor.

## Phase 4 — Reports, exports, WhatsApp, public links
- [ ] Report engine + 10 visually distinct templates (Chama, Wedding, Daily Challenge, Medical, Harambee, Church, School Fees, Family, Business, General) with totals/target/progress/contributor table/top contributors/recent payments/thank-you/date/organizer/footer.
- [ ] Exports: jsPDF PDF, PNG via html-to-image (add dep), print CSS, CSV/Excel-compatible. Handle long reports (pagination).
- [ ] WhatsApp wa.me share URL with encoded summary; Copy Message / Download Image / Download PDF / Share Link buttons; no fake "auto-post to group" claims.
- [ ] /r/:slug public report page from public_snapshot only + public/private toggle + "Created with PesaLytics — Hesabu Ya Haraka" CTA.

## Phase 5 — Demo, monetization, payments
- [ ] /demo: fictional data paste→parse→report→share, no login.
- [ ] src/lib/entitlements.ts reading plan_limits + subscription; gate premium templates/exports/public reports client-side (server already enforces counts).
- [ ] Pricing page: Free / Plus KSh299 / Pro KSh799 (replace old daily/yearly copy).
- [ ] Edge functions: harden process-payment + verify-payment; add chpter-webhook (idempotent, server-side verification, pending/success/failed/cancelled/expired, updates payments + subscriptions). CHPTER_API_KEY absent → functions return clear "not configured" error; NEVER fake success. Report required secret at end.

## Phase 6 — Admin, referrals, analytics
- [ ] AdminDashboard: users, groups, transactions, reports, subscriptions, payments, usage, system health; strict is_admin authz + admin RLS read policies.
- [ ] Referrals: persistent ?ref= attribution on signup → referred_users; rewards as credits (no fake cash payouts).
- [ ] src/lib/analytics.ts → usage_events: signup, group_created, import_started, transactions_parsed, import_completed, report_generated, report_downloaded, whatsapp_share_clicked, public_report_created, subscription_started/cancelled.

## Phase 7 — Landing, SEO, PWA, privacy, QA
- [ ] Landing: "Turn M-PESA Messages Into Beautiful Contribution Reports", remove unsupported "thousands of groups" social proof, live demo widget.
- [ ] index.html real title/meta/OG/canonical; sitemap.xml; robots; per-template SEO pages.
- [ ] /privacy + /terms pages; masked phones everywhere public; audit_logs writes on sensitive actions.
- [ ] PWA: generate logo192/logo512/maskable icons, keep offline shell only, never cache Supabase data.
- [ ] Financial tools: keep, add "Create a report" links back to core flow.
- [ ] MainNav: fix "Not implemented yet" items, real avatar/initials, add Groups/Reports links.
- [ ] QA: typecheck, build, Playwright end-to-end (auth, import, matching, report, export, public/private isolation, limits, admin), fix console errors/broken routes/fake buttons.

## Completed
- [x] Fix TypeScript build errors caused by missing Supabase table types and `supabase.auth.user()` usage.
- [x] Enable Lovable Cloud for the project.
- [x] Inspect codebase + existing schema/functions for launch build (findings above).
