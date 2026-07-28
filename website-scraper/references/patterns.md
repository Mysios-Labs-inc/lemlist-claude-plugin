# Common Scraping Patterns

Ready-made selector/extraction recipes for the page types that come up most
often. Each pattern shows both the CLI invocation of
`scripts/scrape_paginated.py` and the equivalent inline Python, in case a
custom script is needed.

Always adapt the selectors to the actual page inspected in Phase 2 — the class
names below are placeholders.

## Table of contents

- [Note on safe extraction](#note-on-safe-extraction)
- [Directory / listing page (companies, people, jobs)](#directory--listing-page-companies-people-jobs)
- [Article / blog index](#article--blog-index)
- [E-commerce product list](#e-commerce-product-list)
- [Paginated results (URL pattern)](#paginated-results-url-pattern)
- [Paginated results ("Next" button)](#paginated-results-next-button)
- [Table rows](#table-rows)
- [Selector discovery tips](#selector-discovery-tips)

---

## Note on safe extraction

Python has **no `?.` optional-chaining operator**. `soup.select_one(".x")`
returns `None` when nothing matches, so calling `.get_text()` on it raises
`AttributeError`. Use the helpers from `scripts/scrape_utils.py`:

```python
from scrape_utils import text_of, attr_of

text_of(item, ".name")        # -> "" when .name is absent
attr_of(item, "a", "href")    # -> "" when there is no <a> or no href
```

Inline equivalent when copying code elsewhere:

```python
def text_of(el, sel):
    found = el.select_one(sel)
    return found.get_text(strip=True) if found else ""

def attr_of(el, sel, attr):
    found = el.select_one(sel)
    return (found.get(attr) or "") if found else ""
```

---

## Directory / listing page (companies, people, jobs)

```bash
python3 scripts/scrape_paginated.py \
    --url "https://example.com/directory?page={page}" \
    --item-selector ".listing-card" \
    --field "name=.name" --field "url=a@href" --field "location=.location" \
    --output /mnt/user-data/outputs/scraped-data.csv
```

Inline:

```python
items = soup.select(".listing-card")  # adapt selector
for item in items:
    results.append({
        "name":     text_of(item, ".name"),
        "url":      attr_of(item, "a", "href"),
        "location": text_of(item, ".location"),
    })
```

Contact fields (email, phone, LinkedIn) usually live on the detail page, not
the listing card. Collect the detail URLs first, then fetch each one.

---

## Article / blog index

```bash
python3 scripts/scrape_paginated.py \
    --start-url "https://example.com/blog" \
    --next-selector "a[rel='next'], .pagination-next a" \
    --item-selector "article" \
    --field "title=h2" --field "date=time@datetime" \
    --field "url=a@href" --field "author=.author"
```

Inline:

```python
articles = soup.select("article")
for a in articles:
    results.append({
        "title":  text_of(a, "h2"),
        "date":   attr_of(a, "time", "datetime"),
        "url":    attr_of(a, "a", "href"),
        "author": text_of(a, ".author"),
    })
```

Prefer `time@datetime` over the visible date text — it is already ISO-8601.

---

## E-commerce product list

```bash
python3 scripts/scrape_paginated.py \
    --url "https://example.com/shop?page={page}" \
    --item-selector ".product-item" \
    --field "product_name=.product-title" --field "price=.price" \
    --field "url=a@href" --field "image_url=img@src"
```

Inline (with the price cleanup rule — strip currency symbols and units, keep
the number only):

```python
import re

products = soup.select(".product-item")
for p in products:
    price_raw = text_of(p, ".price")
    price_clean = re.sub(r"[^\d.,]", "", price_raw)
    results.append({
        "product_name": text_of(p, ".product-title"),
        "price":        price_clean,
        "url":          attr_of(p, "a", "href"),
        "image_url":    attr_of(p, "img", "src"),
    })
```

`scripts/scrape_utils.py` exposes this as `normalize_number(value)`. Watch for
lazy-loaded images: the real URL is often in `data-src` rather than `src`.

---

## Paginated results (URL pattern)

Increment the page number until a page returns no items.

```python
page = 1
while True:
    url = BASE_URL.format(page=page)
    soup = scrape_page(url)
    items = soup.select(".item")
    if not items:
        break
    # extract items...
    page += 1
    time.sleep(1)  # polite delay between requests
```

Implemented as `scrape_by_url_pattern()` in `scripts/scrape_paginated.py`
(`--url "...page={page}"`). Common patterns: `/page/2`, `?page=2`, `?p=2`,
`?offset=50`. Cap runaway loops with `--max-pages`.

---

## Paginated results ("Next" button)

Follow the next link until it disappears.

```python
url = START_URL
while url:
    soup = scrape_page(url)
    # extract items...
    next_btn = soup.select_one("a[rel='next'], .pagination-next a")
    url = next_btn.get("href") if next_btn else None
    if url and not url.startswith("http"):
        url = BASE_DOMAIN + url
    time.sleep(1)
```

Implemented as `scrape_by_next_button()` in `scripts/scrape_paginated.py`
(`--start-url` + `--next-selector`). Relative hrefs are resolved with
`normalize_url(value, base_url)`.

---

## Table rows

```python
for row in soup.select("table tbody tr"):
    cells = [c.get_text(strip=True) for c in row.select("td")]
    if len(cells) < 3:
        continue  # skip spacer / header rows
    results.append({
        "column_a": cells[0],
        "column_b": cells[1],
        "column_c": cells[2],
    })
```

Read the header row (`table thead th`) first to confirm the column order
before hard-coding indices.

---

## Selector discovery tips

- Repeating data almost always sits in a repeating wrapper: `.card`, `.item`,
  `li`, `tr`, `article`. Find the wrapper first, then extract within it.
- Prefer semantic/stable hooks (`article`, `[itemprop]`, `[data-*]`,
  `a[rel='next']`) over hashed build-time classes like `.css-1x2y3z`.
- Count matches before extracting: if `len(soup.select(sel))` is 1 or 0, the
  selector is targeting the container instead of the items.
- If the HTML holds no data at all, the page is JavaScript-rendered — look for
  the internal JSON API instead (Strategy D, `scripts/api_scrape.py`), often in
  `__NEXT_DATA__`, `window.__INITIAL_STATE__`, or an XHR to `/api/...`.
