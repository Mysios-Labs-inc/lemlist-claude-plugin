#!/usr/bin/env python3
"""Shared helpers for the website-scraper skill.

Import from the sibling scripts, or copy the pieces needed into an ad-hoc
scraper. Covers: browser-like headers, fetching with rate-limit retry,
robots.txt checking, safe field extraction, cleaning, dedup, QA and CSV export.

Dependencies:
    pip install requests beautifulsoup4 lxml --break-system-packages
(lxml is required for XML sitemap parsing.)
"""

import csv
import re
import sys
import time
from urllib.parse import urljoin
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


# --------------------------------------------------------------------------
# Fetching
# --------------------------------------------------------------------------

def fetch_with_retry(url, max_retries=3, delay=5, headers=None, timeout=15):
    """GET a URL, backing off on HTTP 429.

    Back-off schedule: wait 5s and retry, then 10s, then 15s (delay * attempt).
    Raises after max_retries so the caller can notify the user and stop.
    """
    for attempt in range(max_retries):
        r = requests.get(url, headers=headers or HEADERS, timeout=timeout)
        if r.status_code == 429:
            wait = delay * (attempt + 1)
            print(f"Rate limited. Waiting {wait}s...", file=sys.stderr)
            time.sleep(wait)
            continue
        r.raise_for_status()
        return r
    raise RuntimeError("Max retries reached - site is rate limiting.")


def scrape_page(url, headers=None, timeout=15):
    """Fetch a URL and return a BeautifulSoup document."""
    response = fetch_with_retry(url, headers=headers, timeout=timeout)
    response.encoding = response.apparent_encoding or response.encoding
    return BeautifulSoup(response.text, "html.parser")


def robots_allows(domain, target_url, user_agent="*"):
    """Return True if robots.txt permits fetching target_url.

    Returns True when robots.txt cannot be read (nothing forbids the fetch).
    If this returns False, ask the user for explicit confirmation before
    proceeding - do not silently scrape.
    """
    rp = RobotFileParser()
    rp.set_url(f"{domain.rstrip('/')}/robots.txt")
    try:
        rp.read()
    except Exception:
        return True
    return rp.can_fetch(user_agent, target_url)


# --------------------------------------------------------------------------
# Safe extraction (Python has no `?.` optional chaining - use these instead)
# --------------------------------------------------------------------------

def text_of(element, selector):
    """Text of the first match for `selector`, stripped. "" when absent."""
    found = element.select_one(selector)
    return found.get_text(strip=True) if found else ""


def attr_of(element, selector, attr):
    """Attribute of the first match for `selector`. "" when absent."""
    found = element.select_one(selector)
    return (found.get(attr) or "") if found else ""


def extract_field(element, spec):
    """Extract one field from `spec`.

    spec is a CSS selector for text, or "selector@attr" for an attribute:
        ".name"      -> text of .name
        "a@href"     -> href of the first <a>
    """
    if "@" in spec:
        selector, attr = spec.rsplit("@", 1)
        return attr_of(element, selector.strip(), attr.strip())
    return text_of(element, spec.strip())


# --------------------------------------------------------------------------
# Cleaning
# --------------------------------------------------------------------------

def normalize_url(value, base_url=""):
    """Make a URL absolute and https-prefixed. "" stays "" ."""
    if not value:
        return ""
    value = value.strip()
    if value.startswith(("http://", "https://")):
        return value
    if base_url:
        return urljoin(base_url, value)
    return "https://" + value.lstrip("/")


def normalize_email(value):
    """Lowercase, strip spaces."""
    return (value or "").strip().lower().replace(" ", "")


def normalize_number(value):
    """Strip currency symbols and units, keep digits/separators only."""
    return re.sub(r"[^\d.,]", "", value or "")


def clean_row(row, base_url=""):
    """Apply the standard cleaning rules to one record.

    - strip whitespace on every field
    - normalize any field whose name contains url/link, or email
    - missing values become "" (never None / null / N/A)
    """
    cleaned = {}
    for key, value in row.items():
        if value is None:
            value = ""
        value = str(value).strip()
        lowered = key.lower()
        if "url" in lowered or "link" in lowered:
            value = normalize_url(value, base_url)
        elif "email" in lowered:
            value = normalize_email(value)
        cleaned[key] = value
    return cleaned


def deduplicate(rows, key=None):
    """Remove duplicates. On `key` when given (url/email/id), else exact rows.

    Returns (unique_rows, removed_count).
    """
    seen = set()
    unique = []
    for row in rows:
        marker = row.get(key, "") if key else tuple(sorted(row.items()))
        if key and not marker:
            unique.append(row)
            continue
        if marker in seen:
            continue
        seen.add(marker)
        unique.append(row)
    return unique, len(rows) - len(unique)


def quality_report(rows):
    """Flag sparse fields (>30% empty) and truncated values.

    Returns {"total": n, "sparse": [...], "truncated": [...]}.
    Garbled characters usually mean an encoding problem - re-fetch as utf-8.
    """
    if not rows:
        return {"total": 0, "sparse": [], "truncated": []}
    sparse, truncated = [], []
    for field in rows[0].keys():
        empty = sum(1 for r in rows if not str(r.get(field, "")).strip())
        if empty / len(rows) > 0.30:
            sparse.append(f"{field} ({empty}/{len(rows)} empty)")
        if any(str(r.get(field, "")).rstrip().endswith(("…", "...")) for r in rows):
            truncated.append(field)
    return {"total": len(rows), "sparse": sparse, "truncated": truncated}


# --------------------------------------------------------------------------
# CSV export
# --------------------------------------------------------------------------

def to_snake_case(name):
    """"Company Name" -> "company_name", "LinkedIn URL" -> "linkedin_url"."""
    name = re.sub(r"[^\w\s-]", "", name or "").strip()
    return re.sub(r"[\s-]+", "_", name).lower()


def write_csv(rows, output_path, delimiter=","):
    """Write rows to CSV with Excel-safe encoding.

    - utf-8-sig (BOM) so Excel opens accented characters correctly
    - headers in snake_case on the first row, no index column
    - QUOTE_MINIMAL quotes any value containing the delimiter
    - pass delimiter=";" for French / European spreadsheet locales
    """
    if not rows:
        print("No rows to write.", file=sys.stderr)
        return 0
    fieldnames = list(rows[0].keys())
    headers = {f: to_snake_case(f) for f in fieldnames}
    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(
            f, fieldnames=fieldnames, delimiter=delimiter, quoting=csv.QUOTE_MINIMAL
        )
        writer.writerow(headers)
        writer.writerows(rows)
    print(f"Written {len(rows)} rows to {output_path}")
    return len(rows)
