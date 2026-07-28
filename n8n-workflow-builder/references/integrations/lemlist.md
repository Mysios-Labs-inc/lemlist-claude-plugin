# lemlist Integration Patterns

Node flow patterns for lemlist steps in n8n workflows. Use the node names below
verbatim — they already follow the `[Category] - [Action] [Context]` convention
from Phase 3 of SKILL.md.

**Add lead to campaign (with dedup check)**
```
Check - Lead Already in Campaign
  ├─ NO  → lemlist - Add Lead to Campaign
  │          ├─ success → Log - Lead Added
  │          └─ error   → Error - lemlist API Failed → [notifier]
  └─ YES → Log - Skipped Duplicate
```

**Remove lead from campaign**
```
lemlist - Search Lead by Email
  ├─ found     → lemlist - Unsubscribe Lead → Log - Lead Removed
  └─ not found → Log - Lead Not Found, Skip
```

**Update lead custom variables**
```
Set - Build Variables Payload
→ lemlist - Update Lead Variables
  ├─ success → Log - Variables Updated
  └─ error   → Error - Update Failed
```

**Mark lead as interested / not interested**
```
Check - Lead Status from Webhook
  ├─ interested     → HubSpot - Update Deal Stage + Log
  ├─ not interested → lemlist - Unsubscribe + CRM - Log Lost
  └─ unknown        → Log - Unhandled Status
```
