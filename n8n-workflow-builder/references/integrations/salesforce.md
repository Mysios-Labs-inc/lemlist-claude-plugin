# Salesforce Integration Patterns

Node flow patterns for Salesforce steps in n8n workflows. Use the node names below
verbatim — they already follow the `[Category] - [Action] [Context]` convention
from Phase 3 of SKILL.md.

**Upsert lead**
```
Salesforce - Search Lead by Email
  ├─ exists → Salesforce - Update Lead
  └─ new    → Salesforce - Create Lead
→ Log - Salesforce Lead Synced
```

**Convert lead to contact + opportunity**
```
Salesforce - Get Lead by ID
→ Salesforce - Convert Lead
  ├─ success → Salesforce - Create Opportunity → Log
  └─ error   → Error - Conversion Failed → [notifier]
```

**Sync Salesforce opportunity stage to lemlist**
```
Trigger - Salesforce Opportunity Updated (webhook or poll)
→ Check - Stage Changed to Target Value
  ├─ YES → lemlist - Add Contact to Re-engagement Campaign
  └─ NO  → Log - Stage Change Ignored
```
