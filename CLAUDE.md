# CLAUDE.md

Read and follow [AGENTS.md](AGENTS.md) for detailed SEO, performance, privacy, accessibility and verification rules. Keep the two instruction files consistent.

## Source and deployment

This repository serves the live `https://growledger.com/` website through Cloudflare Worker `growledger-website`. It uses static HTML/CSS/JS with no application build step. The sibling Astro showcase is a separate staging application.

Branch from `main`, verify locally, then push a pull request. Never push to `main` directly: merging deploys production. Cloudflare Workers Builds uploads branch previews; deploys/merges and DNS or edge-rule changes need an explicit request. Do not modify MX or mail-related TXT records.

## Layout and editing

- `public/` contains all published assets. `index.html` holds homepage markup, essential styles and JSON-LD. Page files live under `services/`, `case-studies/`, `insights/`, plus privacy and CFO-role pages.
- `public/js/home.<hash>.js` enhances filters, keyboard tabs, mobile menu and the FormSubmit enquiry form. `public/js/site.<hash>.js` handles WhatsApp visibility and privacy-safe conversion hooks. The hook emits only an allowlisted event name and canonical path, never submitted data or contact URL queries.
- Shared subpage styles and accessibility rules live in `public/css/*.<hash>.css`. Keep design tokens and existing brand vocabulary. After editing fingerprinted CSS/JS, run `npm run assets:hash` to rename assets and update HTML/header references. Never edit content under an immutable filename without rehashing.
- Physical `.html` files are served at extensionless canonical URLs; directory `index.html` files use trailing-slash routes. Align exactly one canonical, Open Graph/schema URLs, internal links, sitemap and redirects. Legacy `.html` URLs must permanently redirect to the matching final route, preserving queries.
- `public/_redirects` lists known aliases only. Unknown paths return a useful real-status 404, never a homepage redirect. `public/sitemap.xml` covers every intended canonical page and uses truthful `lastmod` dates.

## SEO, performance and content requirements

- Render useful content, unique title/description, one descriptive h1 and logical headings in initial HTML. Keep services and existing article links crawlable without JavaScript. Publish truthful structured data that matches visible content; retain one consistent breadcrumb trail and validate affected schema.
- Aim for real-user p75 LCP <= 2.5 s, INP <= 200 ms and CLS <= 0.1. Record repeatable production/lab evidence before and after delivery changes; lab timings and Lighthouse scores are not field results or guarantees.
- Keep the hero stable and service-led. Send minimal deferred, page-specific JavaScript. Remove code/styles only after source/coverage checks, including dynamic states. Preserve no-JavaScript navigation/contact/service fallbacks and reduced motion; avoid continuous decorative timers and scroll layout work.
- Use appropriately sized WebP/AVIF photography, explicit dimensions, meaningful alt text (empty for decorative media), and lazy loading below the fold. Keep the LCP asset eager. Retain local subset WOFF2 fonts and preload only the critical face. Do not add large stock imagery, chat or dependencies without measuring impact.
- Confirm compression and caching on real responses. Only content-fingerprinted assets get immutable year-long caching; changing HTML must revalidate. Keep CSS lean without deferring essential styles that cause flashes/layout shifts.
- Test keyboard/focus/menu/tab behaviour, contrast and forms at 360, 390, 768, 1024 and 1440 px; also check 320px when changing narrow layouts. Floating controls must not obscure content. Never invent clients, credentials, testimonials, locations or performance figures.
- Cloudflare Web Analytics is already injected at the edge. Do not duplicate its beacon or assume it supports custom events. Contact-click hooks are not completed leads; emit enquiry success only after provider acceptance. No form fields, emails, phone numbers or URL queries may enter analytics. Preserve privacy wording and FormSubmit consent/fallback paths.
- Do not add a blog or expand Insights without a request. Improve existing substantive service pages, internal links and verified credibility. Domain/page authority are third-party diagnostics; use relevant search visibility and qualified enquiries to judge results.

## Checks and release handoff

```sh
npm ci
npm run check                # all HTML, SEO, sitemap, assets and legacy redirect inventory
npm run dev                  # Wrangler on http://localhost:8790
npm run check:browser        # separate terminal; routes, layouts, axe, mocked forms and no-JS
npm run check:deploy         # dry run only; no publication
npm run check:perf -- http://localhost:8790/ output/lighthouse
```

Install the QA browser with `npx playwright install chromium`. To use locally installed Chrome, set `BROWSER_CHANNEL=chrome` for the browser check. Screenshots/raw reports stay in ignored `output/`. Do not send real test enquiries; the browser suite intercepts provider requests.

After an explicitly approved production deployment, verify real hostname redirect chains, raw metadata, sitemap, schema, assets, mobile/contact behaviour and dashboard receipt. HTTP/www edge rules are separate from repository `_redirects`; see the release checklist in `docs/seo-performance-2026-11-17.md`. Report checks actually run and remaining account/rollout work. For documentation-only edits, formatting, links and diff verification suffice.
