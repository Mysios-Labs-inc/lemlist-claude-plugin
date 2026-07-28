# Data Ingestion Sources

Field maps and fetch queries for each supported input source. Read the section for
the source the user actually has; ignore the others.

## Contents
- [Source A — CSV Export](#source-a--csv-export)
- [Source B — HubSpot MCP](#source-b--hubspot-mcp)
- [Source C — Salesforce MCP](#source-c--salesforce-mcp)

---

## Source A — CSV Export

Expected columns for **Contacts**:
- `id` or `record_id` (CRM internal ID — critical for merge actions)
- `email`
- `first_name`, `last_name`
- `phone`
- `company` or `company_name`
- `job_title`
- `created_date`
- `last_modified_date`
- `owner`
- `lifecycle_stage` or `lead_status`

Expected columns for **Companies / Accounts**:
- `id` or `record_id`
- `name` (company name)
- `domain` or `website`
- `phone`
- `city`, `country`
- `industry`
- `employee_count`
- `created_date`
- `last_modified_date`
- `owner`
- `associated_contacts_count`

If columns are named differently, infer and normalize. Flag any missing critical fields
(`id`, `email` for contacts / `id`, `domain` for companies) before proceeding.

---

## Source B — HubSpot MCP

Fetch contacts:
```
resource: contact
operation: getAll
properties: hs_object_id, email, firstname, lastname, phone, company,
            jobtitle, createdate, hs_lastmodifieddate, hubspot_owner_id,
            lifecyclestage, hs_lead_status, associatedcompanyid
limit: up to 1000 (paginate if needed)
```

Fetch companies:
```
resource: company
operation: getAll
properties: hs_object_id, name, domain, phone, city, country, industry,
            numberofemployees, createdate, hs_lastmodifieddate,
            hubspot_owner_id, num_associated_contacts
limit: up to 1000 (paginate if needed)
```

---

## Source C — Salesforce MCP

Query contacts:
```sql
SELECT Id, Email, FirstName, LastName, Phone, Account.Name, Title,
       CreatedDate, LastModifiedDate, OwnerId, LeadSource
FROM Contact
LIMIT 2000
```

Query accounts:
```sql
SELECT Id, Name, Website, Phone, BillingCity, BillingCountry, Industry,
       NumberOfEmployees, CreatedDate, LastModifiedDate, OwnerId,
       (SELECT COUNT(Id) FROM Contacts)
FROM Account
LIMIT 2000
```
