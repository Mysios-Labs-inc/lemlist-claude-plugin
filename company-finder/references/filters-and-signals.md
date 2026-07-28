# lemlist Filters & Signals Reference

Lookup reference for Step 3 (firmographic filters) and Step 4 (buying-intent
signals) of the company-finder workflow. Pick only the entries relevant to
the current ICP — do not walk through every entry with the user.

## Contents

- [Firmographic filters](#firmographic-filters)
  - [Industry](#-industry)
  - [Company size (employee count)](#-company-size-employee-count)
  - [Funding stage](#-funding-stage)
  - [Geography](#-geography)
- [Buying-intent signals](#buying-intent-signals)
  - [Company raised funds](#-company-raised-funds)
  - [New hire joined the company](#-new-hire-joined-the-company)
  - [Technology change](#-technology-change)
  - [Company hiring a specific role](#-company-hiring-a-specific-role)
  - [Mergers & Acquisitions](#-mergers--acquisitions)
  - [Competitor new connections](#-competitor-new-connections)

---

## Firmographic filters

### 🏭 Industry
**What to do:** Select the industry verticals that match the ICP.
**Why it matters:** Industry shapes the pain context, the language to use, and whether the solution is a priority or a nice-to-have.
**Guidance:**
- Be specific: "B2B SaaS" companies appear under "Computer Software" or "Internet" — not just "Technology"
- Avoid mixing industries in one campaign — messaging needs to be different
- Start with the 1–2 highest-signal industries, test, then expand

---

### 👥 Company size (employee count)
**What to do:** Set a headcount range that reflects where the product delivers the most value.
**Why it matters:** Size is a proxy for decision-making complexity, budget availability, and pain intensity.
**Guidance:**
- 1–10 employees → solo founders/very early stage, fast decision but very limited budget
- 10–50 → early growth, founder still involved in decisions, lean teams
- 50–200 → Series A/B sweet spot for most outbound SaaS — enough budget, fast enough decision cycle
- 200–1,000 → mid-market, need to identify champion clearly, longer cycle
- 1,000+ → enterprise, not suited for typical cold outbound without AE-led motion

---

### 💰 Funding stage
**What to do:** Filter by funding stage if the ICP is stage-specific.
**Why it matters:** Funding stage predicts budget, growth pressure, and decision-making authority.
- Pre-seed/Seed → bootstrapped or early-funded, budget is tight, pain must be acute
- Series A → first real budget, investors watching, pressure to build GTM
- Series B+ → scaling, need efficiency, larger budget, can make bigger bets
- Profitable/Bootstrapped → ROI-focused, no pressure to spend, need rock-solid business case

---

### 🌍 Geography
**What to do:** Filter by country or region.
**Why it matters:** GDPR compliance, language, cultural tone, timezone, and budget cycles vary significantly by region.
**Guidance:**
- EU → keep lists targeted, shorter sequences, be mindful of GDPR
- US → larger market, more outbound-friendly culture, higher inbox competition
- If multi-geo: create separate campaigns per region with localized messaging

---

## Buying-intent signals

### 🚀 Company raised funds
**What it signals:** New budget to deploy + pressure from investors to show results. One of the strongest buying window indicators.
**Best for:** Products that help companies scale (sales tools, hiring tools, growth infrastructure)
**Configuration in lemlist:** Signals → "Company raised funds" → set recency (last 30/60/90 days) + funding stage filter
**Timing:** Reach out within 2–4 weeks of announcement. After that, budgets are often already allocated.
**Opening angle:** Reference the raise + the growth pressure it creates, not just congratulations.

---

### 👤 New hire joined the company
**What it signals:** A new decision-maker just arrived with a fresh mandate and no attachment to the existing stack.
**Best for:** Products that a new VP/Director typically evaluates and champions in their first 90 days.
**Configuration in lemlist:** Signals → "New hire joined the company" → filter by title (e.g., "VP Sales", "Head of Revenue")
**Timing:** First 30–60 days post-hire is the window. After 90 days, they're established and less likely to make major changes.

---

### 🔧 Technology change
**What it signals:** The company just adopted or dropped a tool — they're in a stack evaluation moment.
**Best for:** Products that integrate with or replace the tool being changed. Also useful for competitive displacement.
**Configuration in lemlist:** Signals → "Technology change" → specify which technology (e.g., "adopted HubSpot", "dropped Salesforce")
**Use case example:** If selling a sales engagement tool and a company just adopted HubSpot (their first CRM), they're likely about to need an SEP too.

---

### 💼 Company hiring a specific role
**What it signals:** They're investing in a function — which reveals where they're spending and what problems they're trying to solve.
**Best for:** Products that serve the team or function being hired for.
**Configuration in lemlist:** Signals → "Company hiring a specific role" → enter the job title (e.g., "SDR", "RevOps", "Customer Success Manager")
**Logic:** Hiring a SDR without a sales engagement tool = pain about to intensify. Hiring a Head of CS = churn risk they're trying to address.

---

### 🔗 Mergers & Acquisitions
**What it signals:** Operational disruption, vendor consolidation, new decision-makers, new budget cycles.
**Best for:** Infrastructure, integration, and process tools that simplify complexity.
**Configuration in lemlist:** Signals → "Mergers & Acquisitions" → set recency
**Timing:** 1–3 months post-announcement, when the operational reality of the integration sets in.

---

### 🤝 Competitor new connections
**What it signals:** A competitor's sales rep is actively prospecting this account — they're in the market.
**Best for:** Competitive displacement plays. If a competitor is pitching them, they're evaluating the category.
**Configuration in lemlist:** Signals → "Competitor new connections" → select the competitor profiles to track
