# Deck Design System

Visual system for .pptx decks. Read this during Phase 3 (Design Decisions), before
writing any generation code.

## Contents

- [Color palette](#color-palette)
- [Typography](#typography)
- [Layout variety](#layout-variety)
- [Key design rules](#key-design-rules)
- [PptxGenJS constraints](#pptxgenjs-constraints)

---

## Color palette

Pick a palette suited to the deck type and content tone. Never default to generic blue.

| Deck type | Recommended palette |
|---|---|
| Sales deck | Ocean Gradient (`065A82` / `1C7293` / `21295C`) or Cherry Bold (`990011` / `FCF6F5` / `2F3C7E`) |
| QBR internal | Midnight Executive (`1E2761` / `CADCFC` / `FFFFFF`) or Charcoal Minimal (`36454F` / `F2F2F2`) |
| Case study | Teal Trust (`028090` / `00A896` / `02C39A`) or Warm Terracotta (`B85042` / `E7E8D1` / `A7BEAE`) |
| Onboarding | Sage Calm (`84B59F` / `69A297` / `50808E`) or Coral Energy (`F96167` / `F9E795` / `2F3C7E`) |

Apply the **sandwich structure**: dark background on cover + closing slides, light on
content slides.

Status colors for QBR RAG indicators: Red = `C0392B`, Amber = `E67E22`, Green = `27AE60`.

## Typography

Use `Georgia` (header) + `Calibri` (body) as the default pairing.

| Element | Size |
|---|---|
| Slide titles | 36-40pt bold |
| Section headers | 22-26pt bold |
| Body text | 14-16pt |
| Captions / labels | 10-12pt muted |
| Large stat callout | 60-72pt |

## Layout variety

Vary layouts across slides — never repeat the same layout twice in a row:

- **Title only** — cover, section dividers
- **Two-column** — text left, visual or stat right
- **Icon row** — 3 icons in colored circles with labels below
- **2x2 grid** — 4 content blocks
- **Large stat callout** — 60-72pt number + small label
- **Quote card** — centered quote + attribution on dark background
- **Timeline** — numbered horizontal steps
- **Table** — for structured data (QBR metrics, pricing)

## Key design rules

(Carried over from the pptx skill.)

- Every slide needs a visual element — shape, icon, chart, or background treatment
- No text-only slides
- Never use accent lines under titles (hallmark of AI-generated slides)
- 0.5" minimum margins, 0.3-0.5" between content blocks
- Left-align body text, center only titles

## PptxGenJS constraints

These are correctness issues, not style preferences — violating them corrupts the file
or produces broken rendering:

- Never use `#` with hex colors in PptxGenJS (causes corruption) — write `"065A82"`
- Never reuse option objects across shape calls — use factory functions for shadows
- Use `bullet: true`, never unicode `•`
- Use `breakLine: true` between array items
