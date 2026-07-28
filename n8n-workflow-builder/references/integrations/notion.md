# Notion Integration Patterns

Node flow patterns for Notion steps in n8n workflows. Use the node names below
verbatim — they already follow the `[Category] - [Action] [Context]` convention
from Phase 3 of SKILL.md. For the Notion log database schema, see Phase 5 in
SKILL.md.

**Log workflow execution**
```
Set - Build Log Payload (workflow name, status, record count, timestamp)
→ Notion - Create Page in Log Database
```

**Read input data from Notion database**
```
Trigger - Schedule or Manual
→ Notion - Query Database (filter: Status = "To Process")
→ Loop - Process Items
  → [main logic]
  → Notion - Update Page Status to "Done"
```

**Write enriched leads to Notion**
```
Clay - Enrich Person
→ Set - Map Fields to Notion Schema
→ Notion - Create or Update Page
→ Log - Written to Notion
```
