# Clay Integration Patterns

Node flow patterns for Clay enrichment steps in n8n workflows. Use the node names
below verbatim — they already follow the `[Category] - [Action] [Context]`
convention from Phase 3 of SKILL.md.

**Enrich person by LinkedIn URL**
```
Check - LinkedIn URL Present
  ├─ YES → Clay - Find Person by LinkedIn
  │          ├─ found     → Set - Extract Key Fields (name, title, company, email)
  │          └─ not found → Log - Enrichment Failed, Skip
  └─ NO  → Log - Missing LinkedIn URL, Skip
```

**Enrich company by domain**
```
Clay - Find Company by Domain
  ├─ found     → Set - Extract Company Fields (size, industry, tech stack)
  └─ not found → Set - Flag as Unenriched → Log
```

**Waterfall enrichment (multiple providers)**
```
Clay - Enrich Email via Provider 1
  ├─ found → continue
  └─ empty → Clay - Enrich Email via Provider 2
               ├─ found → continue
               └─ empty → Log - No Email Found, Skip Lead
```
