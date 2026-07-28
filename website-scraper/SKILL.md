---
name: website-scraper
description: >
  Scrapes structured data from any website and exports it to a clean CSV file.
  Use this skill whenever the user provides a URL and wants to extract specific
  information from it — even if they just say "scrape this site", "extract all
  the contacts from this page", "get me the pricing from this URL", "pull all
  the job listings", or "grab the data from this website into a CSV".
  Handles single pages, paginated results, sitemaps, and multi-page scraping.
  Always produces a downloadable CSV file as output.
---

# Website Scraper

Fetch the page, locate the right elements, extract clean structured data,
export it to a CSV. Always respond in the user's language.

## Bundled resources

| File | Use it for |
|---|---|
| `scripts/scrape_utils.py` | Shared helpers: headers, retry, robots.txt, safe extraction, cleaning, dedup, QA, CSV export. Import from the other scripts or copy pieces into an ad-hoc scraper. |
| `scripts/scrape_paginated.py` | **Strategy B** — requests + BeautifulSoup with pagination (URL pattern or "Next" button). |
| `scripts/sitemap_crawl.py` | **Strategy C** — discover all page URLs of a domain from its sitemap. |
| `scripts/api_scrape.py` | **Strategy D** — pull records from an internal JSON API endpoint. |
| `references/patterns.md` | Selector recipes per page type (directories, blog indexes, product lists, tables, pagination) plus selector-discovery tips. Read in Phase 3 when choosing selectors. |

Run any script with `--help` for its full argument list.

### Dependencies

Install before running any script:

```bash
pip install requests beautifulsoup4 lxml --break-system-packages
```

`lxml` is what parses XML sitemaps, so it is required for `sitemap_crawl.py`.

---

## Phase 1 — Clarify Before Starting

Check what you already know from the conversation. Ask only what is missing — in a
single message. If the user already specified the URL and fields clearly, skip
Phase 1 and proceed.

**1. Target URL(s)**
- Single page, list of pages, or a domain to crawl?
- If multiple pages: is there a pattern? (e.g., `/page/1`, `/page/2` or `?p=1`)
- If a domain: how deep to crawl? (just the homepage, all blog posts, all product pages?)

**2. Fields to extract** — ask the user to list exactly what they want. Examples:
- Company name, website, email, phone, LinkedIn URL
- Product name, price, description, availability
- Job title, location, salary, apply link
- Article title, author, date, URL, excerpt

**3. Output filename** — default `scraped-data.csv`; ask only if they seem to
care about naming.

---

## Phase 2 — Fetch & Explore the Page

**Step 1 — Fetch.** Use the `web_fetch` tool to retrieve the target URL. If the
page errors or comes back empty:
- Retry with `User-Agent` simulation via Python requests (`scrape_page()` in
  `scripts/scrape_utils.py` already sends browser-like headers).
- If the page is JavaScript-rendered and returns empty HTML → flag it to the
  user and fall back to `requests` + `BeautifulSoup`.

**Step 2 — Explore the structure.** Before writing the scraper:
- Identify the HTML elements that contain the target data.
- Look for repeating patterns (list items, table rows, card components).
- Check for pagination indicators (`next` button, page numbers, infinite scroll signal).
- Check for anti-scraping signals (Cloudflare, CAPTCHA, login wall).

**Step 3 — Report findings** before scraping:
> "Found 47 items on this page structured as `<div class='company-card'>` blocks.
> I can extract: name, email, website, location. Pagination detected — 8 pages total.
> Starting extraction."

---

## Phase 3 — Choose the Scraping Strategy

| Strategy | Use for | How |
|---|---|---|
| **A — Direct `web_fetch`** | Static HTML pages, simple lists, single pages | Fetch with `web_fetch`, parse the returned markdown/text, extract fields by pattern matching and structure inference |
| **B — requests + BeautifulSoup** | Paginated sites, sites requiring headers, structured HTML with CSS classes | `scripts/scrape_paginated.py` |
| **C — Sitemap crawl** | Extracting all pages/posts from a domain | `scripts/sitemap_crawl.py` → feed the URLs to Strategy A or B |
| **D — API / JSON endpoint** | Sites that load data from an internal API — **best case, check for it first** | `scripts/api_scrape.py` |

**Always test for Strategy D before scraping HTML:** search the page source for
`fetch(`, `axios.get(`, XHR requests, `__NEXT_DATA__` or
`window.__INITIAL_STATE__`. If an endpoint is found, call the JSON directly with
`web_fetch` or `requests` — far cleaner than HTML scraping.

Pick selectors with the recipes in **`references/patterns.md`** (directory
listings, blog indexes, product lists, tables, both pagination styles).

Example (Strategy B, URL-pattern pagination):

```bash
python3 scripts/scrape_paginated.py \
    --url "https://example.com/listings?page={page}" \
    --item-selector ".listing-card" \
    --field "name=.name" --field "url=a@href" --field "location=.location" \
    --output /mnt/user-data/outputs/scraped-data.csv
```

Field specs are `column=selector` for text, `column=selector@attr` for an
attribute. The script handles the pagination loop, the 1s polite delay between
requests, cleaning, dedup, QA and CSV export.

Note: Python has no `?.` optional chaining — use `text_of()` / `attr_of()` from
`scripts/scrape_utils.py` so missing elements yield `""` instead of raising.

---

## Phase 4 — Data Extraction & Cleaning

### Extraction rules
- Strip all HTML tags from text values
- Strip leading/trailing whitespace from every field
- Normalize URLs: ensure they start with `https://` (add domain if relative path)
- Normalize emails: lowercase, strip spaces
- Normalize phone numbers: keep as-is (don't reformat — different countries differ)
- For missing fields: use empty string `""` — never use `null`, `None`, or `N/A`
- For numeric fields (price, count): strip currency symbols and units, keep number only

`clean_row()`, `normalize_url()`, `normalize_email()` and `normalize_number()`
in `scripts/scrape_utils.py` implement these rules.

### Deduplication
Before writing to CSV (`deduplicate()`):
- Remove exact duplicate rows (all fields identical)
- If a unique identifier exists (URL, email, ID): deduplicate on that field
  (`--dedup-key`)
- Report: "Removed X duplicates — Y unique records written to CSV."

### Data quality check
After extraction, run a quick QA (`quality_report()`):
- Count empty values per field → flag fields with >30% empty as "sparse"
- Check for encoding issues (garbled characters) → re-fetch with `utf-8` if needed
- Check for truncated values (text ending with `…`) → flag for user

---

## Phase 5 — CSV Export

Use `write_csv(rows, output_path)` from `scripts/scrape_utils.py` (already
called by all three scripts). Default output path:
`/mnt/user-data/outputs/scraped-data.csv`.

### CSV formatting rules
- Encoding: `utf-8-sig` (BOM included for Excel compatibility)
- Delimiter: `,` (comma) — default, unless user is French/European (use `;` instead,
  via `--delimiter ";"`)
- Quote all string fields that may contain commas
- First row: headers (snake_case, lowercase, no spaces)
- No index column unless explicitly requested

### Header naming conventions
| Raw name | CSV header |
|---|---|
| Company Name | `company_name` |
| Email Address | `email` |
| Phone Number | `phone` |
| LinkedIn URL | `linkedin_url` |
| Job Title | `job_title` |
| Date Published | `published_date` |

---

## Phase 6 — Deliver & Summarize

After writing the CSV, call `present_files` with the output path. Then provide a
short summary:

```
Scrape complete.

URL(s): [list]
Records extracted: X
Duplicates removed: Y
Fields: [list of column names]
Sparse fields (>30% empty): [list or "none"]

[Any warnings — e.g., "Page 3 returned a 403 — data from that page may be missing."]
```

---

## Anti-Scraping Handling

### Robots.txt compliance
Check `robots.txt` before scraping — `robots_allows(domain, target_url)` in
`scripts/scrape_utils.py`; `scrape_paginated.py` runs this automatically. If the
target path is disallowed, inform the user:
> "The site's robots.txt asks crawlers not to access this path. Proceeding may
> violate the site's terms of service. Do you want to continue anyway?"

Wait for explicit confirmation before proceeding (then `--ignore-robots`).

### Cloudflare / bot protection
If the page returns a Cloudflare challenge or bot detection page:
> "This site uses bot protection (Cloudflare / CAPTCHA) that prevents automated
> scraping. Options: (1) try at a different time, (2) use the site's official API
> if available, (3) export data manually from the site's UI."

Never attempt to bypass CAPTCHAs.

### Login walls
If the page requires authentication:
> "This page requires a login. If you can export data from within the platform
> (CSV export button), that's the cleanest option. Alternatively, share the
> exported file and I'll structure it into the format you need."

### Rate limiting (429)
On a 429: back off — wait 5 seconds, retry once. If still 429, increase the
delay (up to ~30 seconds), retry once more. If still blocked, notify the user
and stop. `fetch_with_retry(url, max_retries=3, delay=5)` in
`scripts/scrape_utils.py` implements this (5s / 10s / 15s by default; raise
`delay` for stricter sites).
