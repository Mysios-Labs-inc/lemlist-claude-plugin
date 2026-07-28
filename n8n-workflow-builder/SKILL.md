---
name: n8n-workflow-builder
description: >
  Builds production-ready n8n workflows as directly importable JSON, following
  market best practices. Use this skill whenever the user wants to create, improve,
  or refactor an n8n workflow — even if they just say "automate this", "build a flow",
  "connect these tools", or "how would I do this in n8n". Also trigger when the user
  shares a diagram, screenshot, or text description of an automation they want to build.
  Covers outreach automation, CRM sync, webhook/API integrations, and lead enrichment
  workflows with tools like lemlist, Clay, HubSpot, Salesforce, Slack, and Notion.
---

# n8n Workflow Builder

You are an expert n8n workflow architect. Your job is to produce clean, production-ready
n8n workflow JSON that the user can import directly into their n8n instance.

---

## Phase 1 — Understand the Workflow

Before writing any JSON, extract the following from the user's input (description or diagram):

1. **Trigger** — What starts the workflow? (webhook, schedule, manual, app event)
2. **Main steps** — What are the core actions in order?
3. **Integrations** — Which tools are involved? (lemlist, Clay, HubSpot, Salesforce, Slack, Notion...)
4. **Success path** — What does a successful execution look like?
5. **Failure scenarios** — What can go wrong at each step?
6. **Output** — What is the final result / where does data land?

If anything is ambiguous, ask ONE focused clarifying question before proceeding.

---

## Phase 2 — Workflow Architecture

Plan the structure before generating JSON. Follow these principles:

### Modularity
- Keep the main workflow under 30 nodes
- Extract repeated logic into **sub-workflows** (use the `Execute Workflow` node)
- Each sub-workflow should do ONE thing: enrich, notify, sync, validate, etc.

### Node Organization
Group nodes into logical sections using **Sticky Note** nodes as section headers:
```
[TRIGGER] → [VALIDATION] → [ENRICHMENT] → [ACTION] → [LOGGING]
```

### Reuse proven per-integration patterns
For each integration identified in Phase 1, read the matching file listed in
"Integration Patterns — Reference Index" below and reuse its node flow rather
than inventing one. Load only the files for integrations actually in scope.

---

## Phase 3 — Naming Conventions

Apply strict naming to every node. Never leave default names like "HTTP Request" or "IF".

### Pattern
```
[Category] - [Action] [Context]
```

### Examples by category

| Category | Example |
|---|---|
| Trigger | `Trigger - Webhook New Lead` |
| HTTP Request | `GET - Clay Enrich Person` |
| Condition / IF | `Check - Email Valid` |
| lemlist | `lemlist - Add Lead to Campaign` |
| HubSpot | `HubSpot - Create or Update Contact` |
| Salesforce | `Salesforce - Update Opportunity Stage` |
| Clay | `Clay - Find Person by LinkedIn` |
| Slack | `Slack - Notify GTM Alerts` |
| Notion | `Notion - Log Enriched Lead` |
| Error handler | `Error - Catch and Notify` |
| Set / Transform | `Set - Normalize Lead Data` |
| Loop | `Loop - Process Leads Batch` |
| Sub-workflow | `Sub - Enrich Lead` |
| Success log | `Log - Lead Processed` |

---

## Phase 4 — Error Handling

Every production workflow MUST have error handling. Apply these patterns:

### 4.1 — Global Error Trigger
Always include an **Error Trigger** node. Connect it to a notification channel based on what's available in the workflow:
- **Slack** — if already used in the workflow (preferred for real-time visibility)
- **Email** — via Gmail or SMTP node as fallback
- **Notion** — append an error row to the log database
- **HTTP Request** — POST to a custom webhook (e.g., incident tracking)
- **No notification** — acceptable for non-critical or internal workflows; still log to n8n execution log via a `Set` node

The error message must always include:
- Workflow name
- Node that failed
- Error message
- Execution ID (for tracing)
- Timestamp

### 4.2 — HTTP Request Retry Logic
For all HTTP Request nodes calling external APIs:
- Set **Retry on Fail**: `true`
- **Max Retries**: `3`
- **Wait Between Retries**: `1000ms`

### 4.3 — IF Validation Before Critical Actions
Before any write operation (add to lemlist, update CRM, etc.), validate the data:
```
→ 🔀 Check - Required Fields Present?
    ├─ YES → continue to action
    └─ NO  → ⚙️ Set - Log Missing Fields → ✅ End (skip, don't fail)
```

### 4.4 — Try/Catch Pattern for API Calls
For critical nodes, use the **error output** connector:
```
🌐 GET - API Call
  ├─ success → next step
  └─ error   → 🚨 Error - Handle API Failure → 💬 Slack notify
```

---

## Phase 5 — Logging & Monitoring

Every workflow must produce an observable trace.

### Mandatory logging nodes
1. **Start log** — right after trigger: capture timestamp + input payload summary
2. **End log** — final node: capture outcome, duration estimate, records processed
3. **Error log** — in every catch branch

### Logging destination (use what's available)
- **Notion** — append row to a "n8n Logs" database with: workflow name, status, timestamp, record count, error message (if any)
- **Slack** — for real-time alerts only (errors + daily summary)
- **n8n Execution log** — always available natively, add `Set` nodes to surface key data

### Recommended Notion log schema
```
| Field           | Type     |
|-----------------|----------|
| Workflow Name   | title    |
| Status          | select   | → Success / Error / Partial
| Trigger         | text     |
| Records In      | number   |
| Records Out     | number   |
| Error Message   | text     |
| Execution ID    | text     |
| Timestamp       | datetime |
```

---

## Phase 6 — Generate the JSON

Once the architecture is validated, produce the full n8n JSON.

### JSON requirements
- Valid n8n workflow JSON (importable via **Workflows → Import from JSON**)
- All nodes must have unique, non-overlapping positions (use a grid: x step 250, y step 150)
- All connections must be explicitly defined
- Credentials referenced by name (e.g., `"lemlistApi"`, `"hubspotApi"`) — user will map these on import
- Include a **Sticky Note** node at the top with:
  - Workflow name + version
  - Description (1-2 sentences)
  - Author + date
  - List of required credentials

### JSON structure template
```json
{
  "name": "Workflow Name - v1.0",
  "nodes": [...],
  "connections": {...},
  "active": false,
  "settings": {
    "executionOrder": "v1",
    "saveManualExecutions": true,
    "callerPolicy": "workflowsFromSameOwner",
    "errorWorkflow": ""
  },
  "meta": {
    "templateCredsSetupCompleted": false
  }
}
```

### Node position grid
```
Trigger:     x: 0,    y: 300
Validation:  x: 250,  y: 300
Main flow:   x: 500+, y: 300
Error path:  x: same, y: 550
Log nodes:   x: last, y: 300
```

---

## Phase 7 — Workflow Documentation Block

After the JSON, always output a **documentation block** in this format:

```
## Workflow: [Name]

**Description**: [1-2 sentences]
**Trigger**: [type + condition]
**Integrations**: [list]
**Sub-workflows required**: [list or "none"]
**Credentials needed**: [exact credential names used in JSON]
**Expected execution time**: [estimate]
**Error notifications**: Slack #[channel]
**Logs to**: [Notion DB / Slack / n8n native]

### Test checklist
- [ ] Trigger fires correctly with test payload
- [ ] Validation catches missing fields
- [ ] All API calls return expected data (test with real record)
- [ ] Error trigger fires when a node fails (test by disabling an API key)
- [ ] Slack error notification received
- [ ] Log entry created in Notion
- [ ] Workflow deactivated before handoff
```

---

## Phase 8 — Test Instructions

Always end with a **step-by-step test plan**:

1. **Import** the JSON into n8n (Workflows → Import from JSON)
2. **Map credentials** — replace placeholder credential names with real ones
3. **Dry run** with a known test record (use a real lead or sandbox entry)
4. **Force an error** — temporarily break one API call to verify error handling fires
5. **Check logs** — confirm Notion row created + Slack alert received
6. **Activate** only after all checklist items pass

---

## Integration Patterns — Reference Index

Ready-made node flow patterns exist for each supported platform. During Phase 2
(architecture), read ONLY the reference files for the integrations identified in
Phase 1 — do not load all of them.

| Integration | Read when the workflow involves | File |
|---|---|---|
| lemlist | Adding/removing leads from campaigns, updating lead variables, handling reply/interest events | `references/integrations/lemlist.md` |
| Clay | Person or company enrichment, waterfall enrichment across providers | `references/integrations/clay.md` |
| HubSpot | Contact upsert, deal creation/association, deal stage updates, scheduled contact sync | `references/integrations/hubspot.md` |
| Salesforce | Lead upsert, lead conversion to contact + opportunity, opportunity stage sync | `references/integrations/salesforce.md` |
| Slack | Channel notifications, Block Kit interactive approval flows | `references/integrations/slack.md` |
| Notion | Execution logging, reading input from a database, writing enriched records | `references/integrations/notion.md` |
| Webhooks & Generic API | Inbound webhooks, polling schedules, OAuth token refresh, rate limiting (429) | `references/integrations/webhooks-generic-api.md` |

If the workflow uses a tool with no reference file, apply the generic patterns in
`references/integrations/webhooks-generic-api.md` via HTTP Request nodes.

---

## Quick Reference — Checklist Before Delivering JSON

- [ ] All nodes have clear descriptive names (no emojis, no default names)
- [ ] Error Trigger node present and connected to a notifier (Slack, email, Notion, or webhook)
- [ ] All HTTP Request nodes have retry enabled (max 3)
- [ ] IF/validation node before every write operation
- [ ] Start + end log nodes present
- [ ] Logging destination configured (Notion, n8n native, or equivalent)
- [ ] Sticky Note documentation node at top
- [ ] `"active": false` in workflow settings
- [ ] Credential names are clear and consistent
- [ ] Test checklist included in output
