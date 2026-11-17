"""Verify published routes, SEO metadata and asset references without a browser."""

import json
import re
import sys
import unittest
import hashlib
import fnmatch
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
ORIGIN = "https://growledger.com"


def route(page):
    path = "/" + page.relative_to(PUBLIC).as_posix()
    return path.removesuffix("index.html") if page.name == "index.html" else path.removesuffix(".html")


class Page(HTMLParser):
    def __init__(self, page):
        super().__init__()
        self.tags = []
        self.jsonld = []
        self.in_json = False
        self.feed(page.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        self.in_json = tag == "script" and attrs.get("type") == "application/ld+json"

    def handle_data(self, data):
        if self.in_json:
            self.jsonld.append(json.loads(data))

    def handle_endtag(self, tag):
        if tag == "script":
            self.in_json = False


class SiteChecks(unittest.TestCase):
    def test_canonicals_and_social_urls_match_final_routes(self):
        for page in PUBLIC.rglob("*.html"):
            if page.name == "404.html":
                continue
            with self.subTest(page=page):
                parsed = Page(page)
                canonical = [a["href"] for t, a in parsed.tags if t == "link" and a.get("rel") == "canonical"]
                self.assertEqual(canonical, [ORIGIN + route(page)])
                og = [a["content"] for t, a in parsed.tags if t == "meta" and a.get("property") == "og:url"]
                self.assertEqual(og, canonical)
                self.assertNotIn(ORIGIN + "//", page.read_text())
                self.assertEqual(sum(t == "h1" for t, _ in parsed.tags), 1)
                self.assertEqual(sum(t == "main" for t, _ in parsed.tags), 1)
                self.assertTrue(any(t == "meta" and a.get("name") == "description" and a.get("content") for t, a in parsed.tags))

    def test_sitemap_covers_all_public_pages(self):
        actual = [x.text for x in ET.parse(PUBLIC / "sitemap.xml").findall(".//{*}loc")]
        expected = {ORIGIN + route(p) for p in PUBLIC.rglob("*.html") if p.name != "404.html"}
        self.assertEqual(set(actual), expected)
        self.assertEqual(len(actual), len(set(actual)))

    def test_internal_links_and_images(self):
        for page in PUBLIC.rglob("*.html"):
            parsed = Page(page)
            for tag, attrs in parsed.tags:
                if tag == "img":
                    self.assertIn("alt", attrs, str(page))
                    self.assertIn("width", attrs, str(page))
                    self.assertIn("height", attrs, str(page))
                ref = attrs.get("href") if tag in ("a", "link", "use") else attrs.get("src")
                if not ref or ref.startswith(("#", "mailto:", "tel:", "data:")):
                    continue
                url = urlsplit(urljoin(ORIGIN + route(page), ref))
                if url.netloc != "growledger.com":
                    continue
                path = PUBLIC / url.path.lstrip("/")
                candidates = [path, Path(str(path) + ".html"), path / "index.html"]
                self.assertTrue(any(p.is_file() for p in candidates), f"{page}: {ref}")
                if tag == "a":
                    self.assertFalse(url.path.endswith(".html"), f"redirecting link {page}: {ref}")

    def test_legacy_redirects_are_permanent(self):
        lines = (PUBLIC / "_redirects").read_text().splitlines()
        rules = {x.split()[0]: x.split()[1:] for x in lines if x and not x.startswith("#")}
        for page in PUBLIC.rglob("*.html"):
            if page.name == "404.html":
                continue
            legacy = "/" + page.relative_to(PUBLIC).as_posix()
            self.assertEqual(rules.get(legacy), [route(page), "301"], legacy)

    def test_home_content_is_static_and_contact_has_fallback(self):
        home = (PUBLIC / "index.html").read_text()
        parsed = Page(PUBLIC / "index.html")
        cards = [a for t, a in parsed.tags if t == "a" and "card" in a.get("class", "").split()]
        self.assertGreaterEqual(len(cards), 6)
        self.assertNotIn('id="reader"', home)
        self.assertNotIn('id="pause"', home)
        forms = [a for t, a in parsed.tags if t == "form"]
        self.assertEqual(forms[0].get("method"), "post")
        self.assertTrue(forms[0].get("action", "").startswith("https://formsubmit.co/"))
        self.assertIn('href="mailto:info@growledger.com"', home)
        self.assertIn('href="/#expertise"', (PUBLIC / "404.html").read_text())

    def test_structured_data_and_metadata_are_parseable(self):
        titles = []
        for page in PUBLIC.rglob("*.html"):
            parsed = Page(page)
            if page.name != "404.html":
                titles.append(re.search(r"<title>(.*?)</title>", page.read_text(), re.S).group(1))
            for entry in parsed.jsonld:
                self.assertEqual(entry.get("@context"), "https://schema.org")
            if page.parent.name in ("services", "case-studies"):
                self.assertEqual(sum(j.get("@type") == "BreadcrumbList" for j in parsed.jsonld), 1, str(page))
        self.assertEqual(len(titles), len(set(titles)))
        json.loads((PUBLIC / "site.webmanifest").read_text())

    def test_immutable_assets_match_their_fingerprints(self):
        headers = (PUBLIC / "_headers").read_text()
        for folder in (PUBLIC / "js", PUBLIC / "css"):
            for asset in folder.iterdir():
                match = re.search(r"\.([a-f0-9]{12})\.(css|js)$", asset.name)
                if match:
                    self.assertEqual(hashlib.sha256(asset.read_bytes()).hexdigest()[:12], match[1], str(asset))
                    self.assertIn("/" + asset.relative_to(PUBLIC).as_posix() + "\n  Cache-Control: public, max-age=31536000, immutable", headers)

    def test_each_asset_has_one_cache_policy(self):
        policies = []
        pattern = None
        for line in (PUBLIC / "_headers").read_text().splitlines():
            if line.startswith("/"):
                pattern = line
            elif line.strip().lower().startswith("cache-control:"):
                policies.append(pattern)
        for folder in (PUBLIC / "js", PUBLIC / "css"):
            for asset in folder.iterdir():
                pathname = "/" + asset.relative_to(PUBLIC).as_posix()
                matches = [p for p in policies if fnmatch.fnmatchcase(pathname, p)]
                self.assertEqual(len(matches), 1, f"{pathname}: overlapping Cache-Control rules {matches}")


if __name__ == "__main__":
    unittest.main(argv=[sys.argv[0]], verbosity=2)
