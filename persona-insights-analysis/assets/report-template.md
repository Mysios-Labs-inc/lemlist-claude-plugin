# Persona Intelligence Report — Output Templates

Skeletons for the Phase 6 deliverable. Pick the shape matching the format chosen in
Phase 1 (dashboard / document / both), then fill it with the extracted insights.

## Table of Contents

- [Option A — Interactive dashboard artifact (React)](#option-a--interactive-dashboard-artifact-react)
- [Option B — Structured document (inline long-form)](#option-b--structured-document-inline-long-form)
- [Closing sections (required in BOTH formats)](#closing-sections-required-in-both-formats)

---

## Option A — Interactive dashboard artifact (React)

Build a tabbed interactive dashboard:

```
Header: "[Product] Persona Intelligence Report"
Subtitle: "Based on X transcripts | Analyzed: [date] | Confidence: [Low/Medium/High]"

TABS:
├── Overview       → summary stats + top insights per persona (cards)
├── [Persona 1]    → full breakdown for this persona
├── [Persona 2]    → full breakdown for this persona
├── [Persona N]    → ...
├── Objections     → ranked objection table + handling analysis
├── Feature Gaps   → ranked feature request table with frequency
├── Competitive    → competitors mentioned + switching context
└── Messaging      → vocabulary, language patterns, messaging recommendations
```

Each persona tab contains:

- Profile card (title, seniority, function, # calls analyzed)
- Goals (bullet list with verbatim)
- Pains (categorized: Functional / Emotional / Social, with verbatims)
- Triggers (what caused them to look now)
- Objections (type + verbatim + handling rating)
- Feature requests (explicit + implied)
- Buying process (stakeholders, timeline, budget signals)
- Verbatim bank (top 5–8 most powerful quotes from this persona)
- Recommended messaging (3 message angles based on insights)

Visual elements:

- Bar chart: objection frequency by type
- Bar chart: feature request frequency
- Tag cloud or word list: persona vocabulary
- Color-coded handling ratings (green/yellow/red) on objection table

---

## Option B — Structured document (inline long-form)

Produce a long-form report with this structure:

```
# Persona Intelligence Report
## Methodology & Dataset
## Persona Profiles
### [Persona 1 Name]
  #### Goals & Objectives
  #### Pains & Frustrations
  #### Triggers
  #### Objections
  #### Feature Requests
  #### Buying Process
  #### Verbatim Bank
  #### Recommended Messaging
### [Persona 2 Name]
  ...
## Cross-Persona Synthesis
## Objection Frequency Analysis
## Feature Gap Analysis
## Competitive Intelligence
## Messaging Recommendations
## ICP Signal Patterns
## Appendix — Full Verbatim Index
```

---

## Closing sections (required in BOTH formats)

These are the Phase 7 recommendations — always append them to the deliverable.

### Immediate actions (this week)

3–5 specific, actionable items:

- Messaging changes to make in sequences or decks
- Objection handling scripts to add to the sales playbook
- Discovery questions to add based on triggers identified
- Feature requests to escalate to product team

### Sales enablement outputs to create

Based on the insights, recommend:

- Talk tracks per persona (with exact language to use)
- Objection handling cards
- ROI calculator angles
- Case study angles that match stated pains
- lemlist sequence angles (which pain to lead with per persona)

### Confidence & limitations

Always state:

- Number of transcripts analyzed per persona
- Confidence level (Low / Medium / High)
- Any gaps in the data (e.g., "no C-suite calls in dataset", "all calls were early-stage")
- Recommended next calls to run to fill gaps
