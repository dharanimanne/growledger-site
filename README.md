# GrowLedger Advisors website

A static, single-page site built from the approved Claude artifact design. It needs no build step and no server code.

```
wrangler.jsonc        Cloudflare Worker config (static assets only, serves public/)
public/               everything below is what gets published
index.html            page markup, SEO meta tags and JSON-LD structured data
404.html              not-found page (wrangler.jsonc: not_found_handling "404-page")
css/styles.css        all styles; self-hosted @font-face rules first, design tokens in :root
js/main.js            mobile menu, copy buttons, Join Us application builder
assets/fonts/         Instrument Serif and Archivo (latin subset, woff2, OFL)
assets/brand/         logo (full-size PNG for search engines, 400px WebP for the page), icons, og-image.png
assets/team/          partner photos (296px WebP)
robots.txt            allows all crawlers, points to the sitemap
sitemap.xml           single-URL sitemap (update <lastmod> when content changes)
site.webmanifest      app name and icons
_headers              security and cache headers (applied by Cloudflare)
favicon.ico           32px fallback icon
```

## Run locally

```sh
npx wrangler dev             # Cloudflare runtime, http://localhost:8787 (applies _headers and 404)
cd public && python3 -m http.server 8000   # or any static server
```

Serve public/ at the site root: icons, fonts and the 404 page use root-relative paths (`/assets/...`).

## Forms

The Join Us form submits nothing to a server. It builds the application text and offers to send it by WhatsApp (+91 81058 53262) or email (info@growledger.com), or to copy it. To change where applications go, edit the two URLs in `js/main.js`.

## SEO notes

- Canonical, Open Graph, Twitter and JSON-LD URLs all assume `https://growledger.com/`. Change them in `index.html`, `robots.txt` and `sitemap.xml` if the domain differs.
- Structured data is a `ProfessionalService` with the partners and six practices. Add a `PostalAddress` (and `sameAs` profile links such as LinkedIn) once confirmed; both help local search.
- After launch, add the site to Google Search Console and Bing Webmaster Tools and submit `sitemap.xml`.

## Editing and deploying

Changes go through GitHub pull requests; Cloudflare Workers Builds deploys them:

1. Edit on a branch (yourself, or ask Claude at claude.ai/code with this repo selected) and open a pull request.
2. The `Check site` action validates the change, and Cloudflare comments a preview URL on the pull request. Check the page there.
3. Merge the pull request. Cloudflare deploys `main` to https://growledger.com within a minute or two.

Undo a release with `npx wrangler rollback` or by reverting the merge on GitHub. See `CLAUDE.md` for editing rules.

`growledger.com` and `www.growledger.com` are Worker custom domains (`wrangler.jsonc`); a Cloudflare Redirect Rule sends `www` to the apex. Never change the zone's MX or TXT (SPF, DKIM, DMARC) records; they carry `info@growledger.com` mail.
