# Slack Integration Patterns

Node flow patterns for Slack steps in n8n workflows. Use the node names below
verbatim — they already follow the `[Category] - [Action] [Context]` convention
from Phase 3 of SKILL.md.

**Send enriched lead summary to channel**
```
Set - Format Slack Message (name, title, company, source)
→ Slack - Post Message to Channel
→ Log - Notification Sent
```

**Interactive approval before adding to campaign**
```
Slack - Send Approval Message (Block Kit with Approve / Reject buttons)
→ Trigger - Slack Interaction Webhook
  ├─ approved → lemlist - Add to Campaign → Slack - Confirm to Requester
  └─ rejected → Log - Lead Rejected → Slack - Confirm Rejection
```
