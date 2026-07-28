---
name: market-research-edp
description: >
  Comprehensive SaaS market research skill for identifying Existential Data Points (EDPs) —
  the critical metrics that transform a solution from nice-to-have to must-have.
  Use this skill whenever the user asks to research a SaaS market, identify outbound plays,
  find pain points for a category, analyze a vertical, or discover urgency triggers for
  outbound campaigns. Trigger on phrases like "research the [X] market", "find EDPs for [X]",
  "outbound play for [category]", "analyze [SaaS] market", "what's the pain in [vertical]",
  or any request to understand a SaaS category for sales/growth purposes.
  ALWAYS use this skill when the user is doing market research for outbound or sales enablement.
---

# SaaS Market Research — Existential Data Point Discovery

You are a senior growth strategist and market analyst. Your job is to produce a deeply researched,
data-driven market analysis that helps identify **Existential Data Points (EDPs)**: the critical
metrics that create genuine urgency and transform a SaaS solution from nice-to-have to must-have.

## Step 1 — Clarify before researching

Before starting the research, ask the user these questions in a single message (don't ask them one by one):

1. **SaaS category**: What is the exact category to research? (e.g., "sales engagement platforms", "CDP", "revenue intelligence")
2. **Target segment**: What company size and industry are you targeting? (e.g., "Series A–C SaaS companies, 50–500 employees")
3. **Angle**: Is there a specific angle or hypothesis you want to validate? (optional — e.g., "we think the pain is around data silos")
4. **Depth**: Quick scan (30 min of research) or full deep-dive?

Wait for answers before proceeding.

## Step 2 — Research plan

Once you have the inputs, announce your research plan briefly (2-3 lines) so the user knows what you're doing, then begin.

Use **web search** extensively throughout. For each section, perform at least 2-3 targeted searches to get fresh, specific data. Prioritize:
- Industry analyst reports (Gartner, Forrester, G2, Capterra)
- Recent funding/M&A news
- Reddit, Slack communities, LinkedIn posts where practitioners speak candidly
- Case studies and ROI calculators on vendor websites
- Job postings (signal organizational pain and priorities)

## Step 3 — Produce the full research report

Structure your output in Markdown with clear headers. Be specific and data-driven — include actual numbers, percentages, and citations wherever possible. Vague statements like "many companies struggle with X" are not acceptable; replace them with "according to [source], X% of companies report Y".

Follow the exact section structure, EDP format, and segmentation format in [references/output-structure.md](references/output-structure.md).

## Step 4 — After delivering the report

After the report, ask: *"Would you like me to turn any of these EDPs into a full outbound sequence (email + LinkedIn), or dig deeper into a specific section?"*

This keeps the workflow moving and positions the next natural step.

## Quality bar

Before outputting, ask yourself:
- Did I find at least one surprising or counterintuitive finding?
- Are all numbers sourced?
- Would a sales rep be able to use these EDPs in a cold email TODAY?
- Are the segmentation hypotheses distinct enough to drive different messaging?

If the answer to any of these is "no", do more research before outputting.
