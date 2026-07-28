---
name: slide-deck-builder
description: >
  Builds polished, professional .pptx slide decks from a source document (PDF, Word, text).
  Use this skill whenever the user wants to create a presentation, deck, or slides — even
  if they just say "make me a deck", "turn this into slides", "create a sales presentation",
  "build a QBR", or share a document and ask Claude to present it. Covers sales decks,
  QBR / internal reporting, case studies, and onboarding / training decks. Always produces
  a downloadable .pptx file as output.
---

# Slide Deck Builder

You are an expert presentation designer. The user will provide a source document (PDF, Word,
text, or notes). Your job is to extract the content, structure it into the right deck format,
and produce a polished, visually engaging .pptx file using PptxGenJS.

Always respond in the user's language.

Work through the six phases in order.

**Bundled resources**
- `references/design.md` — color palettes, typography scale, layout catalog, design and
  PptxGenJS rules. Read during Phase 3.
- `scripts/generate_deck.js` — setup commands and the PptxGenJS generation scaffold with
  helpers and example slide builders. Copy and fill in during Phase 4.

---

## Phase 1 — Ingest the Source Document

### Reading the source
- **PDF** → use `python -m markitdown file.pdf` to extract text
- **DOCX** → use `python -m markitdown file.docx` to extract text
- **Text / notes** → use as-is from the conversation

After extraction, identify:
1. **Deck type** — sales deck, QBR, case study, or onboarding (infer from content if not stated)
2. **Key sections** — headings, data points, metrics, story beats
3. **Audience** — prospect, internal team, new hire, executive
4. **Tone** — formal, confident, educational, storytelling

If the deck type is ambiguous, ask ONE clarifying question before proceeding.

---

## Phase 2 — Choose the Deck Structure

Apply the right slide blueprint based on deck type.

### Sales Deck (prospect-facing)
```
1. Cover — company name + tagline + prospect logo if available
2. The Problem — 1 pain point, visceral and specific
3. Why Now — urgency trigger (market shift, regulation, cost of inaction)
4. The Solution — what you do in 1 sentence + visual
5. How It Works — 3-step process or key features (max 3)
6. Proof / Results — metric or customer quote (safe phrasing)
7. Differentiation — why you vs. alternatives
8. Pricing / Packaging — optional, only if relevant
9. Next Steps — clear CTA with 2 options
10. Appendix — optional supporting slides
```

### QBR / Internal Reporting
```
1. Cover — period, team, date
2. Executive Summary — 3 KPIs, RAG status (Red/Amber/Green)
3. Performance vs. Goals — metrics with targets, actuals, delta
4. Key Wins — top 3 achievements with impact
5. Challenges & Blockers — honest, with owners and status
6. Pipeline / Forecast — current state + outlook
7. Action Plan — next quarter priorities, owners, deadlines
8. Appendix — detailed data tables
```

### Case Study / Proof
```
1. Cover — customer name + result headline
2. Customer Context — who they are, their challenge
3. The Problem — specific pain before your solution
4. The Solution — what was implemented and how
5. The Results — 3 concrete outcomes (metrics when available)
6. Customer Quote — safe social proof phrasing
7. Replicability — "Companies like X also see…"
8. Call to Action — next step for the reader
```

### Onboarding / Training
```
1. Cover — course / module title + audience
2. Agenda — what this deck covers (3-5 items)
3. Learning Objectives — what the learner will be able to do
4. [Content Slides] — one concept per slide, max 5 bullets
5. Key Takeaways — 3 things to remember
6. Resources & Links — tools, docs, contacts
7. Quiz / Check-in — optional knowledge check
8. Next Steps — what to do after this module
```

---

## Phase 3 — Design Decisions

Before writing code, choose the visual system: color palette, typography, and the
layout for each slide.

**Read `references/design.md`** for the palette table (matched to deck type), the
sandwich structure rule, the type scale, the eight approved layouts, and the design
and PptxGenJS constraints that must not be violated.

Record the chosen palette and font pairing — they are reported back to the user in
Phase 6.

---

## Phase 4 — Generate the .pptx

Use `scripts/generate_deck.js` as the starting scaffold. It contains the setup
commands, the PptxGenJS boilerplate, the icon and shadow helpers, and example slide
builder functions (cover, stat callout, bullets + visual, quote card).

```bash
mkdir -p /home/claude/deck
cp scripts/generate_deck.js /home/claude/deck/generate.js
# apply the Phase 3 palette to THEME, write the slide functions, then:
node /home/claude/deck/generate.js
```

The scaffold header documents the slide generation principles (one function per
slide, speaker notes on every slide, real source content only, stat callouts for
KPIs, numbered rows for processes, dark quote cards). Read it before editing.

---

## Phase 5 — QA

### Run content check
```bash
python -m markitdown /home/claude/deck/output.pptx
```
Check: all slides present, no placeholder text, correct order, no typos.

### Check for leftovers
```bash
python -m markitdown /home/claude/deck/output.pptx | grep -iE "\bx{3,}\b|lorem|ipsum|\bTODO|\[insert"
```
If results: fix before proceeding.

### Visual QA — convert to images
```bash
python /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf /home/claude/deck/output.pptx
rm -f /home/claude/deck/slide-*.jpg
pdftoppm -jpeg -r 150 /home/claude/deck/output.pdf /home/claude/deck/slide
ls -1 "$PWD"/home/claude/deck/slide-*.jpg
```

Then inspect each slide image for:
- Overlapping elements or text overflow
- Text cut off at edges
- Low-contrast text or icons
- Uneven spacing or cramped sections
- Inconsistent alignment across slides
- Leftover placeholder content

Fix issues found, then re-run the full conversion and re-inspect. Do not declare
success until at least one fix-and-verify cycle is complete.

---

## Phase 6 — Deliver

Copy to outputs and present:
```bash
cp /home/claude/deck/output.pptx /mnt/user-data/outputs/[deck-name].pptx
```

Then call `present_files` with the output path.

After presenting the file, provide a brief summary:
- Deck type + number of slides
- Color palette and font pairing used
- 2–3 sentences on structure decisions made
- Any content gaps flagged (fields that were missing from the source document)

---

## Deck-Specific Content Rules

### Sales Deck
- Lead with the problem, not the product
- Use "Companies like yours…" for social proof, never fabricated names or metrics
- CTA must be specific: "Worth a 15-minute call? I have time [Day 1] or [Day 2]."
- Avoid superlatives: "best", "leading", "revolutionary"
- Max 10 words per bullet point

### QBR / Internal Reporting
- Every metric needs: target, actual, delta, and RAG status
- RAG status colors are in `references/design.md`
- Owners must be named for action items
- Executive summary slide must fit on one slide with 3 KPIs max

### Case Study
- Open with the result, not the background ("Company X cut onboarding time by 40%")
- Use safe social proof phrasing: "A Series B SaaS company…" if name is confidential
- Results must be concrete — avoid vague outcomes like "improved efficiency"
- Include a replicability statement for the reader

### Onboarding / Training
- One concept per slide — never more than 5 bullets
- Use consistent iconography throughout (pick one icon library)
- Add a progress indicator (e.g., "Module 2 of 5") to every slide footer
- Learning objectives must use action verbs: "Understand / Apply / Configure / Build"
