#!/usr/bin/env python3
"""Strategy C - sitemap crawl.

Use for extracting all pages/posts from a domain. Probes the usual sitemap
locations, expands sitemap index files, and optionally filters the URLs and
writes them to CSV.

Requires lxml for XML parsing:
    pip install lxml --break-system-packages

Examples:
    # List every URL in the sitemap
    python3 sitemap_crawl.py --domain https://example.com

    # Only blog posts, written to CSV
    python3 sitemap_crawl.py --domain https://example.com \\
        --filter "/blog/" --output /mnt/user-data/outputs/urls.csv

Feed the resulting URLs to scrape_paginated.py (per-page selectors) or to
web_fetch when the pages are simple.
"""

import argparse
import sys

import requests
from bs4 import BeautifulSoup

from scrape_utils import HEADERS, write_csv

SITEMAP_CANDIDATES = ("sitemap.xml", "sitemap_index.xml", "sitemap-0.xml")


def get_sitemap_urls(domain, timeout=10):
    """Return the <loc> URLs from the first sitemap that responds with 200.

    Tries /sitemap.xml, /sitemap_index.xml, /sitemap-0.xml in order.
    Returns [] when none of them exist.
    """
    domain = domain.rstrip("/")
    for candidate in SITEMAP_CANDIDATES:
        url = f"{domain}/{candidate}"
        try:
            r = requests.get(url, headers=HEADERS, timeout=timeout)
        except requests.RequestException:
            continue
        if r.status_code == 200:
            soup = BeautifulSoup(r.content, "xml")
            return [loc.text.strip() for loc in soup.find_all("loc")]
    return []


def expand_sitemap_index(urls, timeout=10, max_children=50):
    """Replace nested .xml sitemap entries with the page URLs they contain."""
    expanded = []
    children = 0
    for url in urls:
        if url.endswith(".xml") and children < max_children:
            children += 1
            try:
                r = requests.get(url, headers=HEADERS, timeout=timeout)
                soup = BeautifulSoup(r.content, "xml")
                expanded.extend(loc.text.strip() for loc in soup.find_all("loc"))
            except requests.RequestException:
                print(f"Could not read child sitemap: {url}", file=sys.stderr)
        else:
            expanded.append(url)
    return expanded


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--domain", required=True, help="https://example.com")
    parser.add_argument("--filter", default=None,
                        help="Keep only URLs containing this substring, e.g. /blog/")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--output", default=None,
                        help="Write URLs to this CSV instead of stdout")
    parser.add_argument("--delimiter", default=",")
    args = parser.parse_args()

    urls = get_sitemap_urls(args.domain)
    if not urls:
        sys.exit(f"No sitemap found at {args.domain} "
                 f"({', '.join(SITEMAP_CANDIDATES)}). Crawl links instead.")

    urls = expand_sitemap_index(urls)
    if args.filter:
        urls = [u for u in urls if args.filter in u]
    if args.limit:
        urls = urls[:args.limit]

    if args.output:
        write_csv([{"url": u} for u in urls], args.output, delimiter=args.delimiter)
    else:
        for u in urls:
            print(u)
        print(f"\n{len(urls)} URLs found.", file=sys.stderr)


if __name__ == "__main__":
    main()
