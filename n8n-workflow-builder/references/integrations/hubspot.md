# HubSpot Integration Patterns

Node flow patterns for HubSpot steps in n8n workflows. Use the node names below
verbatim — they already follow the `[Category] - [Action] [Context]` convention
from Phase 3 of SKILL.md.

**Upsert contact**
```
HubSpot - Search Contact by Email
  ├─ exists → HubSpot - Update Contact Properties
  └─ new    → HubSpot - Create Contact
→ Set - Store HubSpot Contact ID
→ Log - HubSpot Contact Synced
```

**Create deal linked to contact**
```
HubSpot - Search Contact by Email
→ HubSpot - Create Deal
→ HubSpot - Associate Deal to Contact
→ Log - Deal Created
```

**Update deal stage from webhook**
```
Trigger - Webhook (lemlist reply event)
→ Set - Normalize Payload
→ HubSpot - Search Deal by Contact Email
  ├─ found → HubSpot - Update Deal Stage
  └─ none  → HubSpot - Create Deal (fallback)
→ Log - Deal Stage Updated
```

**Sync contacts to lemlist (scheduled)**
```
Trigger - Schedule (daily)
→ HubSpot - Get Contacts (filter: list or property)
→ Loop - Process Contacts Batch
  → Check - Already in lemlist Campaign
    ├─ NO  → lemlist - Add to Campaign
    └─ YES → Log - Skipped
→ Log - Sync Complete (count in, count out)
```
