# VibeDebt // Acquire.com Due-Diligence Playbook (H2 Pilot)

**Goal:** Validate willingness to pay for AI-codebase due diligence from Acquire.com / Microns *buyers* — the only persona near this product with cash and urgency.
**Gate to pass (7 days):** ≥ 3 paid audits at $99 early-bird (list $199). Otherwise: run objection-interviews and revisit the wedge.
**Budget cap for pilot:** $100 (Carrd + Stripe link fees). Zero backend automation — everything is manual.

---

## 1. Positioning (one-liner bank)

- Buyer-facing: **“Independent tech debt report for the AI-built startup you are about to buy. 48 hours, $99, evidence-based.”**
- Framing rule: never sell “security”. Sell **deal protection**: “Know if the $40k you are about to wire buys an asset or a prompt-log.”
- Analogy script for calls: “We are the home inspection guy before you buy the house — not the pest exterminator.”

## 2. Outreach drafts

### 2.1 Broker / community owner (partnership intake)

> **Subject:** Free due-diligence layer for your AI-built listings (revenue share)
>
> Hi {name},
>
> Roughly one in three micro-SaaS listings on {marketplace} is now AI-built (Cursor/Lovable/Bolt). Buyers price that risk blindly today — and when a buyer gets burned, the platform’s trust dies quietly.
>
> We run independent tech-debt due diligence on AI-generated codebases (RLS/auth gaps, leaked keys, hidden refactor CAPEX). Delivered in 48h as a 4-page verdict report: Green / Yellow / Red, with evidence and remediation cost estimate.
>
> Proposal:
> 1. You add “optional VibeDebt audit” as a buyer checkbox in the listing flow — like escrow, zero effort on your side.
> 2. Buyer pays $199; you keep 25%.
> 3. Your KPI it moves: fewer post-sale disputes, higher close rate on AI-built listings (“verified codebase” badge on the listing).
>
> I’ll run the first two audits for your team free so you can see the artifact. Worth 15 minutes?

Notes: brokers will not answer cold — the **free sample report (5.2)** is the door opener. Send the artifact first, pitch second.

### 2.2 Direct buyer (Acquire / Twitter DM / email)

> **Subject:** Before you wire {deal_size} to {listing_name} seller…
>
> Saw you’re active acquiring AI-built micro-SaaS. Quick sanity hook: out of the last 6 AI-built listings we scanned, 4 had tables publicly readable via the public Supabase anon key, and 2 had hardcoded sellable Stripe keys in git history.
>
> For $99 we do a 48-hour independent scan before you close:
> - every leakable secret and RLS hole (with reproduction),
> - true LOC / test coverage / refactor CAPEX in senior hours,
> - Green / Yellow / Red verdict you can use in price negotiation.
>
> If we find nothing material — full refund, you keep the report.
> Want a redacted sample report from a real listing?

### 2.3 Cold Twitter/X DM (compressed)

> Buy AI-built startups on Acquire/Microns? I scan the codebase *before* you wire the cash — leaked keys, dead OpenAI quotas, RLS holes, refactor cost. 48h, $99, refund if clean. Sample report in replies — ping me a listing link.

## 3. The paid artifact — report structure (4 pages, 48h SLA)

Deliverable: branded PDF + 10-minute Loom walkthrough. The Loom doubles as the sales demo.

### Page 1 — Executive Verdict (the only page lazy buyers read)
- **Verdict banner:** 🟢 Green / 🟡 Yellow / 🔴 Red (+ one-line why).
- Deal context: what was audited (commit hash, date, scope caveat, NDA reference).
- Top-3 material risks table: finding → evidence location → exploit impact in $$ (“OpenAI key in bundle → uncapped quota burn observed at $40–400/day historically”).
- **Ownership cost line:** “Estimated stabilization CAPEX: X senior-hours (~$Y at $75/h contractor rate).”
- Confidence note: what was NOT auditable (3rd-party vendors, runtime metrics, actual DB volume).

### Page 2 — Security & Secrets (the fear page)
- RLS deep-dive per exposed table: policy body quoted, verdict on effectiveness (**never trust existence checks — `USING (true)` = open**), anon-key reproduction query (curl inside, creds redacted).
- Secret inventory: live keys found (bundle/source/history), blast radius, rotation order list.
- Auth & server-side checks: routes with client-only guards, unprotected Edge Functions/webhooks, Stripe webhook signature verification presence.

### Page 3 — Codebase Reality (the trust page)
- Honest LOC map: top-5 files with exact line counts; God-components flagged.
- Test reality: framework present | suites count | does CI run them.
- Dependency risk: lockfile, phantom/abandoned packages, CVE hits, 3-rd party API quotas hard-wired (rate limits, model deprecations, key coupling to the seller’s personal accounts!).
- Infra traps: per-user uncontrolled LLM costs, SaaS service tiers that explode past ~500 users.

### Page 4 — Negotiation Ammunition (the money page)
- **Price-adjustment guidance:** “Remediation estimate $4–8k + key rotation = supports 10–15% price reduction or 20% escrow retention for 30 days.”
- 12 questions to ask the seller (with the “wrong” answers already flagged: “Does CI run tests?” / “Who owns the OpenAI account? — if seller’s personal, deal restructure needed”).
- Transition checklist: keys to rotate, accounts to migrate, Supabase org transfer steps, domain/CF zone handover.
- **Buy / Negotiate / Walk recommendation with conditions.**

### Scope & liability footnote (mandatory)
Point-in-time static analysis + configuration review; no guarantee of undiscovered issues; not legal/financial advice; NDA retained copy count = 1.

## 4. Manual audit workflow (≤3h per report, no new code needed)

1. Intake: Google Form (repo access invite accepted as *read-only collaborator* or zipped source + `.env` template, not secrets).
2. Machine pass (30 min): local clone + existing VibeDebt engine + `gitleaks` + `grep -RnE "USING \(true\)" supabase/ migrations/` + `bundle-analyzer` for bundle check; Supabase policy body dump via `pg_policies`.
3. Human pass (60 min): top-5 files walk, auth-flow reading, Stripe/webhook surface, deploy/hosting config, Git history scan for rotated-but-forgotten keys.
4. Financials (30 min): fill the CAPEX estimation tables (task × senior-hours × rate).
5. Report assembly (45 min): 4-page template (Notion → PDF) + Loom recording.
6. Delivery: Stripe link receipt → calendar invite for optional 15-min Q&A.

## 5. 7-day pilot schedule

| Day | Actions | Exit artifact |
|---|---|---|
| **0 (prep)** | Build offer page (Carrd/Notion): promise, redacted sample PDF, Stripe link $99 early-bird / $199. Pay $29 Carrd Pro. Do one free audit of a *publicly* AI-built open-source app as the sample artifact. | Live offer page + sample report |
| **1** | Screenshot-бот outreach: 20 messages to Acquire/Microns active buyers (look at “buying” roles in profiles), 10 DMs to brokers; Twitter post with redacted sample scorecard under #buildinpublic + #acquisition. Log every contact in a sheet. | 30 contacts logged |
| **2** | 15 more buyer DMs with sample attached; join Acquire Discord & MicroAcquire community channels, answer tech-due-diligence questions publicly (no pitching — signal). If zero replies: tighten subject lines to dollar-loss framing. | 5+ real conversations started |
| **3** | Follow-up wave #1 (value add: redacted findings from a similar-size listing). First payment expected by EOD. If 0 intent at 45 contacts → pivot channel to brokers only, halve buyer DMs. | 1st paid audit or escalated custdev |
| **4** | Deliver first audit ≤24h (overdeliver: Loom walkthrough + 15-min call). Ask for 3 referrals of other buyers at delivery. | Delivered report #1 + referral asks |
| **5** | Deliver audit #2/#3 if landed; public anonymized teardown tweet-thread (“I scanned the backend of a $40k micro-SaaS. Here’s what leaked.”) — the strongest ad format this niche has. | Case-study thread live |
| **6** | Broker call day: with 2 delivered reports as social proof, pitch the “buyer checkbox + 25% rev share” deal to 3 marketplaces. | 1 LOI or scheduled demo |
| **7** | **Gate review.** ≥3 paid → green light: automate intake (upload flow + PDF generation), raise price to $149. 1–2 paid → extend 7 days, price-test $79, collect objections. 0 paid → run 5 objection interviews and kill/pivot the wedge. | Go / iterate / kill decision |

### Objection playbook (pre-write the answers)
- “I can scan it myself with a free tool.” → “Free tools check *existence* of RLS, we check *effectiveness*, plus we give you negotiation ammunition in dollars.”
- “Seller won’t give code access.” → “A seller who refuses a read-only audit link for 48h just told you something worth more than $99.”
- “Why not just use Lovable’s own security scan?” → “Their scan passes `USING (true)` policies — the exact pattern behind CVE-2025-48757. Platforms grade their own homework; we don’t.”
- “$99 for regex scans?” → “No — $99 for a human-ranked verdict with reproduction steps and a remediation CAPEX table. The PDF is priced, the regex is free.”

### Pilot hygiene
- NDA one-pager template for sellers (Docusign free tier).
- Never keep seller code post-delivery (delete + written confirmation — this *is* the trust product).
- Track every number: contacts → replies → calls → paid → referral rate. The funnel, not vibes, decides the gate.
