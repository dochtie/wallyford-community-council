#!/usr/bin/env python3
"""Test every link from the live website to other websites.

Used by .github/workflows/check-links.yml. Run by hand with:

    python3 tools/check_links.py https://dochtie.github.io/wallyford-community-council

It reads the list of pages from sitemap.xml, collects each page's links to
other websites, and requests each one. A link counts as broken only when
the other website says the page is gone (404 or 410) or the website can't
be found at all. Anything else that isn't a plain success (for example a
website refusing automatic checks) is listed as "couldn't check".
Exits with an error if any link is broken.
"""
import re
import socket
import sys
import urllib.error
import urllib.request
from html import unescape

AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


def fetch(url):
    """Return (status, body). Status 0 means the website couldn't be found."""
    request = urllib.request.Request(url, headers={"User-Agent": AGENT, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, response.read(2_000_000).decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        return error.code, ""
    except urllib.error.URLError as error:
        if isinstance(error.reason, socket.gaierror):
            return 0, ""
        return -1, ""
    except Exception:
        return -1, ""


def main():
    site = sys.argv[1].rstrip("/")
    status, sitemap = fetch(site + "/sitemap.xml")
    if status != 200:
        sys.exit("::error::Couldn't read %s/sitemap.xml (is the website up?)" % site)
    pages = re.findall(r"<loc>([^<]+)</loc>", sitemap)

    found = {}  # link -> the pages it is on
    for page in pages:
        status, body = fetch(page)
        if status != 200:
            print("::warning::Couldn't open %s" % page)
            continue
        for link in re.findall(r'<a\s[^>]*href="(https?://[^"]+)"', body):
            link = unescape(link)
            if not link.startswith(site):
                found.setdefault(link, []).append(page)

    broken, unsure = [], []
    for link in sorted(found):
        status, _ = fetch(link)
        if status == -1:  # timed out or dropped: try once more
            status, _ = fetch(link)
        if status in (404, 410) or status == 0:
            broken.append((link, status))
        elif status != 200:
            unsure.append((link, status))

    print("Checked %d links on %d pages." % (len(found), len(pages)))
    for link, status in unsure:
        print("Couldn't check (the website turned the check away): %s" % link)
    for link, status in broken:
        why = "the website can't be found" if status == 0 else "page not found"
        for page in found[link]:
            print("::error::Broken link on %s : %s (%s)" % (page, link, why))
    if broken:
        sys.exit(1)
    print("No broken links.")


if __name__ == "__main__":
    main()
