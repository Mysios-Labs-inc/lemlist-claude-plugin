#!/usr/bin/env python3
"""Strategy B - requests + BeautifulSoup scraper with pagination.

Use for paginated sites, sites requiring browser-like headers, and structured
HTML with stable CSS classes.

Two pagination modes:
  1. URL pattern  - --url "https://example.com/listings?page={page}"
  2. "Next" button - --start-url plus --next-selector

Both stop when a page yields no items (or the next link disappears), and sleep
--delay seconds between requests to stay polite.

Examples:
    python3 scrape_paginated.py \\
        --url "https://example.com/listings?page={page}" \\
        --item-selector ".listing-card" \\
        --field "name=.name" --field "url=a@href" --field "location=.location" \\
        --output /mnt/user-data/outputs/scraped-data.csv

    python3 scrape_paginated.py \\
        --start-url "https://example.com/blog" \\
        --next-selector "a[rel='next'], .pagination-next a" \\
        --item-selector "article" \\
        --field "title=h2" --field "date=time@datetime" --field "url=a@href"

Field specs are "column=selector" for text, or "column=selector@attr" for an
attribute. Clean-up, dedup, QA and CSV export are applied automatically.
"""

import argparse
import sys
import time

from scrape_utils import (
    HEADERS, clean_row, deduplicate, extract_field, normalize_url,
    quality_report, robots_allows, scrape_page, write_csv,
)


def parse_fields(specs):
    """["name=.name", "url=a@href"] -> {"name": ".name", "url": "a@href"}"""
    fields = {}
    for spec in specs:
        if "=" not in spec:
            sys.exit(f"Invalid --field {spec!r}; expected 'column=selector'")
        column, selector = spec.split("=", 1)
        fields[column.strip()] = selector.strip()
    return fields


def extract_items(soup, item_selector, fields, base_url):
    """Return one dict per element matching item_selector."""
    rows = []
    for item in soup.select(item_selector):
        rows.append(clean_row(
            {col: extract_field(item, sel) for col, sel in fields.items()},
            base_url=base_url,
        ))
    return rows


def scrape_by_url_pattern(url_pattern, item_selector, fields, start_page,
                          max_pages, delay):
    """Increment {page} in the URL until a page returns no items."""
    results = []
    page = start_page
    while max_pages is None or page < start_page + max_pages:
        url = url_pattern.format(page=page)
        print(f"Fetching page {page}: {url}", file=sys.stderr)
        soup = scrape_page(url)
        items = extract_items(soup, item_selector, fields, url)
        if not items:
            break
        results.extend(items)
        page += 1
        time.sleep(delay)
    return results


def scrape_by_next_button(start_url, next_selector, item_selector, fields,
                          max_pages, delay):
    """Follow the "next" link until it disappears."""
    results = []
    url = start_url
    pages = 0
    while url and (max_pages is None or pages < max_pages):
        print(f"Fetching: {url}", file=sys.stderr)
        soup = scrape_page(url)
        results.extend(extract_items(soup, item_selector, fields, url))
        next_btn = soup.select_one(next_selector)
        next_url = next_btn.get("href") if next_btn else None
        url = normalize_url(next_url, url) if next_url else None
        pages += 1
        time.sleep(delay)
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--url", help="URL pattern containing {page}")
    parser.add_argument("--start-url", help="First page URL (next-button mode)")
    parser.add_argument("--next-selector",
                        default="a[rel='next'], .pagination-next a",
                        help="CSS selector for the next-page link")
    parser.add_argument("--item-selector", required=True,
                        help="CSS selector for the repeating item block")
    parser.add_argument("--field", action="append", default=[], required=True,
                        help="column=selector or column=selector@attr (repeatable)")
    parser.add_argument("--output", default="scraped-data.csv")
    parser.add_argument("--delimiter", default=",",
                        help="CSV delimiter; use ';' for European locales")
    parser.add_argument("--start-page", type=int, default=1)
    parser.add_argument("--max-pages", type=int, default=None)
    parser.add_argument("--delay", type=float, default=1.0,
                        help="Seconds between requests (default 1)")
    parser.add_argument("--dedup-key", default=None,
                        help="Dedup on this column (url/email/id) instead of whole rows")
    parser.add_argument("--ignore-robots", action="store_true",
                        help="Skip the robots.txt check (only after user confirmation)")
    args = parser.parse_args()

    if not args.url and not args.start_url:
        sys.exit("Provide --url (with {page}) or --start-url.")

    fields = parse_fields(args.field)
    first_url = args.start_url or args.url.format(page=args.start_page)

    if not args.ignore_robots:
        from urllib.parse import urlsplit
        parts = urlsplit(first_url)
        domain = f"{parts.scheme}://{parts.netloc}"
        if not robots_allows(domain, first_url):
            sys.exit("robots.txt disallows this path. Ask the user for explicit "
                     "confirmation, then re-run with --ignore-robots.")

    if args.url:
        results = scrape_by_url_pattern(args.url, args.item_selector, fields,
                                        args.start_page, args.max_pages, args.delay)
    else:
        results = scrape_by_next_button(args.start_url, args.next_selector,
                                        args.item_selector, fields,
                                        args.max_pages, args.delay)

    results, removed = deduplicate(results, key=args.dedup_key)
    report = quality_report(results)
    write_csv(results, args.output, delimiter=args.delimiter)
    print(f"Removed {removed} duplicates - {report['total']} unique records "
          f"written to CSV.")
    print(f"Sparse fields (>30% empty): {', '.join(report['sparse']) or 'none'}")
    if report["truncated"]:
        print(f"Possibly truncated values in: {', '.join(report['truncated'])}")


if __name__ == "__main__":
    main()
