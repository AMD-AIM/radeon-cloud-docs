#!/usr/bin/env python3
"""Check internal links, anchors and images in the built site.

    npm run build
    python3 scripts/check-links.py [dist]

Every internal URL in every HTML page under dist must resolve to a file, and
every #fragment must match an id on the target page. Internal means under
BASE, or under SITE + BASE for absolute URLs (canonical, hreflang, og:*).
A root-relative URL outside BASE is reported too: it works locally only by
accident and 404s on GitHub Pages. External URLs are not fetched.

Exits 1 if anything is broken. Standard library only.
"""
import os
import re
import sys
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

SITE = "https://amd-aim.github.io"
BASE = "/radeon-cloud-docs"

# Attributes that hold a URL, by tag. srcset is handled separately.
URL_ATTRS = {
    "a": ("href",),
    "area": ("href",),
    "link": ("href",),
    "img": ("src",),
    "source": ("src",),
    "script": ("src",),
    "iframe": ("src",),
    "video": ("src", "poster"),
    "audio": ("src",),
    "track": ("src",),
    "embed": ("src",),
    "object": ("data",),
}
META_URL_PROPS = {"og:url", "og:image", "og:image:url", "og:image:secure_url", "twitter:image"}


class Page(HTMLParser):
    def __init__(self, is_404):
        super().__init__(convert_charrefs=True)
        self.is_404 = is_404
        self.ids = set()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "a" and a.get("name"):
            self.ids.add(a["name"])
        # GitHub Pages serves 404.html for every missing URL, never at the
        # /404/ address Starlight gives it in canonical, hreflang and og:url.
        if self.is_404 and (
            tag == "link" and a.get("rel") in ("canonical", "alternate")
            or tag == "meta" and a.get("property") == "og:url"
        ):
            return
        for name in URL_ATTRS.get(tag, ()):
            if a.get(name):
                self.urls.append(a[name])
        if tag in ("img", "source") and a.get("srcset"):
            for candidate in a["srcset"].split(","):
                if candidate.strip():
                    self.urls.append(candidate.split()[0])
        if tag == "meta":
            prop = a.get("property") or a.get("name") or ""
            content = a.get("content") or ""
            if prop in META_URL_PROPS and content:
                self.urls.append(content)
            if (a.get("http-equiv") or "").lower() == "refresh":
                match = re.search(r"url\s*=\s*['\"]?([^'\"]+)", content, re.I)
                if match:
                    self.urls.append(match.group(1).strip())

    handle_startendtag = handle_starttag


def is_internal(url):
    if url.startswith("//"):
        return False
    return url.startswith(("/", "#", SITE + BASE + "/")) or url == SITE + BASE


def resolve(dist, page_path, url):
    """Return (file, fragment, problem) for an internal URL."""
    if url.startswith("#"):
        return page_path, unquote(url[1:]), None
    if url.startswith(SITE):
        url = url[len(SITE):]
    parts = urlsplit(url)
    path = unquote(parts.path)
    if path != BASE and not path.startswith(BASE + "/"):
        return None, None, "no-base"
    target = os.path.normpath(os.path.join(dist, path[len(BASE):].lstrip("/")))
    if os.path.isdir(target):
        target = os.path.join(target, "index.html")
    if not os.path.isfile(target):
        return None, None, "missing"
    return target, unquote(parts.fragment), None


def main():
    dist = os.path.normpath(sys.argv[1] if len(sys.argv) > 1 else "dist")
    if not os.path.isdir(dist):
        sys.exit(f"{dist}/ not found; run `npm run build` first")

    pages = {}
    for root, _, files in os.walk(dist):
        for name in files:
            if name.endswith(".html"):
                path = os.path.join(root, name)
                page = Page(is_404=path == os.path.join(dist, "404.html"))
                with open(path, encoding="utf-8") as f:
                    page.feed(f.read())
                pages[path] = page

    broken = set()
    checked = 0
    for path, page in pages.items():
        for url in page.urls:
            if not is_internal(url):
                continue
            checked += 1
            target, anchor, problem = resolve(dist, path, url)
            if problem:
                broken.add((problem, path, url))
            elif anchor and target in pages and anchor not in pages[target].ids:
                broken.add(("anchor", path, url))

    for kind, path, url in sorted(broken, key=lambda b: (b[1], b[2])):
        print(f"{kind:8} {os.path.relpath(path, dist)} -> {url}")
    print(f"checked {checked} internal URLs on {len(pages)} pages; {len(broken)} broken")
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
