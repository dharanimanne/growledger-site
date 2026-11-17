# GrowLedger Advisors website

Source for the live `https://growledger.com/` website. Static HTML, CSS and JavaScript are served by Cloudflare Worker `growledger-website`; there is no application build step or database.

## Files and routes

- `public/index.html`: homepage, static content and JSON-LD.
- `public/services/`: six substantive service pages.
- `public/case-studies/`: an index and nine illustrative case studies.
- `public/insights/`: the existing index and twelve published articles. No new blog or article expansion is part of the improvement brief.
- `public/the-cfo-role.html`, `public/privacy.html`, `public/404.html`: CFO self-check, privacy policy and branded error page.
- `public/js/home.<hash>.js`: deferred homepage filters, keyboard tabs, mobile menu and contact enhancement.
- `public/js/site.<hash>.js`: shared WhatsApp visibility and local conversion event hooks.
- `public/css/*.<hash>.css`: shared subpage/accessibility styles; homepage essential styles remain inline.
- `public/assets/`: local subset WOFF2 fonts, WebP logos/portraits and social image.
- `public/_redirects`, `_headers`, `robots.txt`, `sitemap.xml`: permanent legacy-route redirects, response/cache headers, crawling policy and complete static sitemap.
- `scripts/`: checks, asset fingerprinting and repeatable Lighthouse measurements.
- `wrangler.jsonc`: static asset hosting configuration and custom domains.

Canonical pages use extensionless file URLs (for example `/services/virtual-cfo-services`) and trailing slashes for directory indexes (`/case-studies/`). Physical `.html` files stay in place; old published URLs redirect permanently to their equivalent canonical page, preserving query strings. Missing pages return a real 404.

## Local development and verification

Use Node.js 22.19 or newer, below 26, and npm.

```sh
npm ci
npm run dev                  # http://localhost:8790; applies redirects, headers and real 404 handling
```

In a second terminal:

```sh
npm run check                # every HTML page, metadata, links, JSON-LD, sitemap, asset hashes
npx playwright install chromium
npm run check:browser        # routes, five widths, axe, keyboard, no-JS, intercepted form requests
npm run check:deploy         # package validation only, no deployment
npm run check:perf -- http://localhost:8790/ output/lighthouse
```

`BROWSER_CHANNEL=chrome npm run check:browser` can use a locally installed Chrome. Browser evidence and raw Lighthouse reports go into ignored `output/`. The performance command runs three mobile and three desktop samples serially and writes medians; compare the same URL/environment and distinguish these lab results from field data.

After editing a fingerprinted script or stylesheet, run `npm run assets:hash`. This renames changed files from their SHA-256 prefix and updates all page/header references. Do not keep changed bytes under an immutable cached URL. Unversioned assets use a short revalidatable cache policy.

## Contact and analytics

The form posts to FormSubmit, which delivers enquiries to `info@growledger.com`. JavaScript adds validation, a 15-second timeout and WhatsApp/email alternatives on failure. Without JavaScript the form uses a normal POST. Provider acceptance is distinct from final inbox delivery; confirm delivery with the mailbox owner after an approved release. The browser suite intercepts all test submissions and sends no real enquiries.

Cloudflare injects its Web Analytics beacon into the deployed site. Do not add a duplicate tracker. It provides traffic and real-user performance metrics but does not support custom conversion events. `growledger:conversion` is a browser integration hook containing only an allowlisted `name` and canonical `path`; it is not a network collector or persistent dashboard. A future collector requires an explicitly chosen account/provider and privacy review. Never forward form contents, email addresses, phone numbers, query strings or full WhatsApp URLs to analytics.

## Publishing

Work on a branch and open a pull request. The `Check site` action validates every page, runs the browser regression suite, uploads evidence and performs a Wrangler dry run. Cloudflare Workers Builds provides branch previews where configured. Merging to `main` deploys the live site; do not push directly to main.

Before merging, review [the improvement report and release checklist](docs/seo-performance-2026-11-17.md). HTTP/www redirects are configured at the Cloudflare zone and must be reviewed separately from repository `_redirects`; do not modify mail MX/TXT records. Undo an approved release by reverting its merge or selecting the previous verified Worker version.

Read [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md) before future revisions. The sibling `Growledger-website` repository is a separate Astro staging showcase and is not deployed by changes here.
