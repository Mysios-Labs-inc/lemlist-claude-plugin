# Common n8n Error Patterns — Quick Reference

Look up the matching symptom below for a ready-made fix. Use this after classifying
the error with the taxonomy in SKILL.md (Phase 2) — this file gives the concrete
fix steps for the most frequent cases within each category.

### Expression: field undefined
```
Error: Cannot read properties of undefined (reading 'email')
Fix: The field doesn't exist at this point in the flow.
  1. Open the failing node
  2. Click "Input" tab — check if the field actually exists in the incoming data
  3. If missing: go back to the source node and verify the field is being set/forwarded
  4. If present but different name: correct the expression to match the exact field name
  5. Add fallback: {{ $json.email || '' }} to avoid hard failures on missing optional fields
```

### Expression: referencing wrong node
```
Error: $json returns empty or unexpected data
Fix: You're reading from the current node's input, but the data lives in a previous node.
  1. Replace $json.field with $('Exact Node Name').item.json.field
  2. The node name must match exactly (case-sensitive, spaces included)
```

### HTTP 401 — lemlist
```
Error: 401 Unauthorized on lemlist API
Fix:
  1. Open the HTTP Request node → Authentication tab
  2. Set type to "Basic Auth"
  3. Username: leave empty
  4. Password: your lemlist API key (found in lemlist Settings → Integrations → API)
```

### HTTP 401 — HubSpot
```
Error: 401 Unauthorized on HubSpot API
Fix:
  1. Verify you're using a Private App token (not an API key — deprecated)
  2. In the node: set Authorization header to "Bearer YOUR_TOKEN"
  3. Check that the Private App has the required scopes for the operation
```

### HTTP 429 — Rate limit
```
Error: 429 Too Many Requests
Fix:
  1. Open the HTTP Request node → Settings tab
  2. Enable "Retry on Fail" → Max retries: 3, Wait: 2000ms
  3. If processing a large list: add a Wait node (1-2s) before the HTTP Request inside the loop
```

### IF condition always takes wrong branch
```
Symptom: All leads going to the wrong branch of an IF node
Fix:
  1. Open the IF node → check the condition value
  2. Common issue: comparing string "true" to boolean true — they are not equal in n8n
  3. Fix: use {{ $json.field === true }} or change operation to "is not empty" for truthy checks
  4. Test: use the "Test step" button on the IF node with a real input to see which branch fires
```

### Set node losing upstream fields
```
Symptom: Fields from previous nodes disappear after a Set node
Fix:
  1. Open the Set node
  2. Enable "Keep All Fields" (toggle at the top of the node)
  3. This preserves all incoming fields and only adds/overwrites what you define
```

### Switch node hitting fallback unexpectedly
```
Symptom: All items routed to fallback output instead of defined routes
Fix:
  1. Open the Switch node → check the value being evaluated
  2. Print it first: add a Set node before Switch to log the exact value
  3. Common issue: value has extra spaces, different casing, or is nested one level deeper
  4. Fix the value expression or normalize it in a Set node before the Switch
```

### Webhook not receiving data
```
Symptom: Webhook trigger fires but $json is empty or missing expected fields
Fix:
  1. Check the webhook response in the "Input" tab of the first node after the trigger
  2. Clay and most tools send data inside $json.body — use $json.body.fieldName
  3. If completely empty: verify the webhook URL is correct and the workflow is active
  4. Test: use a tool like Webhook.site to inspect the raw payload Clay is sending
```

### Loop not processing all items
```
Symptom: Only the first item is processed, or items are skipped
Fix:
  1. Check the node feeding the Loop — it must output an array
  2. If it outputs a single object: wrap it — use a Set node with expression {{ [$json] }}
  3. Inside the loop, use $json to access the current item (not $('Node').item.json)
```
