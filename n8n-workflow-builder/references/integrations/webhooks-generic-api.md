# Webhooks & Generic API Integration Patterns

Node flow patterns for inbound webhooks, polling, and raw HTTP Request nodes in
n8n workflows. Use the node names below verbatim — they already follow the
`[Category] - [Action] [Context]` convention from Phase 3 of SKILL.md. Retry
settings for HTTP Request nodes are defined in Phase 4.2 of SKILL.md.

**Inbound webhook → multi-destination sync**
```
Trigger - Webhook
→ Set - Validate and Normalize Payload
→ Check - Event Type
  ├─ "email_opened"  → HubSpot - Log Activity
  ├─ "replied"       → HubSpot - Update Deal + Slack Notify
  ├─ "unsubscribed"  → Salesforce - Update Lead Status + lemlist - Remove
  └─ unknown         → Log - Unhandled Event Type
```

**Polling API (no webhook available)**
```
Trigger - Schedule (every X minutes)
→ HTTP Request - GET API Endpoint
→ Check - New Records Since Last Run
  ├─ YES → Loop - Process New Records
  └─ NO  → Log - Nothing New, End
```

**OAuth token refresh pattern**
```
HTTP Request - Call API
  ├─ success (200) → continue
  └─ error (401)   → HTTP Request - Refresh Token
                   → Set - Store New Token
                   → HTTP Request - Retry Original Call
```

**Rate limiting handler**
```
HTTP Request - Call API
  ├─ success       → continue
  └─ error (429)   → Wait - 60 seconds
                   → HTTP Request - Retry (max 3 attempts)
                   → error after retries → Error - Rate Limit Exceeded
```
