#!/usr/bin/env python3
"""Strategy D - internal API / JSON endpoint (best case).

Many sites load their data from an internal JSON API. Parsing that is far
cleaner than scraping HTML, so always check for it first:

  1. Look in the page source for API calls (`fetch(`, `axios.get(`, XHR/network
     requests, `__NEXT_DATA__`, `window.__INITIAL_STATE__`).
  2. If found, call the JSON endpoint directly (web_fetch or this script).
  3. Parse JSON -> CSV.

Examples:
    # Single call, records under data["results"]
    python3 api_scrape.py --url "https://example.com/api/listings?page=1" \\
        --items-key results --output /mnt/user-data/outputs/scraped-data.csv

    # Paginated endpoint, keeping selected keys and renaming them
    python3 api_scrape.py --url "https://example.com/api/listings?page={page}" \\
        --items-key data.items --max-pages 20 \\
        --field "company_name=name" --field "email=contact.email"

Dotted paths work for both --items-key and --field values (nested JSON).
"""

import argparse
import json
import sys
import time

from scrape_utils import clean_row, deduplicate, fetch_with_retry, quality_report, write_csv


def dig_raw(data, path):
    """Follow a dotted path into nested dicts/lists. Missing -> None."""
    current = data
    for part in path.split("."):
        if isinstance(current, dict):
            current = current.get(part)
        elif isinstance(current, list) and part.isdigit():
            current = current[int(part)] if int(part) < len(current) else None
        else:
            return None
        if current is None:
            return None
    return current


def dig(data, path):
    """dig_raw flattened to a CSV-safe scalar. Missing -> ""."""
    current = dig_raw(data, path)
    if current is None:
        return ""
    if isinstance(current, (dict, list)):
        return json.dumps(current, ensure_ascii=False)
    return current


def get_items(payload, items_key):
    """Extract the record list from the JSON payload."""
    if items_key:
        items = dig_raw(payload, items_key)
        return items if isinstance(items, list) else []
    if isinstance(payload, list):
        return payload
    for key in ("results", "data", "items", "records"):
        if isinstance(payload.get(key), list):
            return payload[key]
    return []


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--url", required=True,
                        help="Endpoint URL; may contain {page} for pagination")
    parser.add_argument("--items-key", default=None,
                        help="Dotted path to the list of records, e.g. data.items")
    parser.add_argument("--field", action="append", default=[],
                        help="column=json.path (repeatable). Omit to keep all keys.")
    parser.add_argument("--output", default="scraped-data.csv")
    parser.add_argument("--delimiter", default=",")
    parser.add_argument("--start-page", type=int, default=1)
    parser.add_argument("--max-pages", type=int, default=1)
    parser.add_argument("--delay", type=float, default=1.0)
    parser.add_argument("--dedup-key", default=None)
    args = parser.parse_args()

    fields = {}
    for spec in args.field:
        if "=" not in spec:
            sys.exit(f"Invalid --field {spec!r}; expected 'column=json.path'")
        column, path = spec.split("=", 1)
        fields[column.strip()] = path.strip()

    paginated = "{page}" in args.url
    results = []
    for offset in range(args.max_pages if paginated else 1):
        page = args.start_page + offset
        url = args.url.format(page=page) if paginated else args.url
        print(f"Fetching: {url}", file=sys.stderr)
        payload = fetch_with_retry(url).json()
        items = get_items(payload, args.items_key)
        if not items:
            break
        for item in items:
            row = ({col: dig(item, path) for col, path in fields.items()}
                   if fields else item)
            results.append(clean_row(row))
        if not paginated:
            break
        time.sleep(args.delay)

    results, removed = deduplicate(results, key=args.dedup_key)
    report = quality_report(results)
    write_csv(results, args.output, delimiter=args.delimiter)
    print(f"Removed {removed} duplicates - {report['total']} unique records "
          f"written to CSV.")
    print(f"Sparse fields (>30% empty): {', '.join(report['sparse']) or 'none'}")


if __name__ == "__main__":
    main()
