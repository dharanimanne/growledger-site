# Website editing guidance

## Scope and release workflow

- This is the source of the live `https://growledger.com/` website: static HTML, CSS and JavaScript in `public/`, served by Cloudflare Worker `growledger-website`. No framework migration is part of the SEO/performance brief.
- The sibling `Growledger-website` repository contains a separate Astro staging showcase. Do not copy its noindex policy or contact backend assumptions into this production site.
- Read `CLAUDE.md`, `README.md` and `docs/seo-performance-2026-11-17.md` before revisions. The dated report distinguishes source changes from external rollout/account work.
- Branch from `main` and push a pull request. Never push to main directly: merging to main deploys the live site. Do not deploy, merge, or change DNS/edge configuration unless explicitly requested. Preserve all email MX/TXT records.
- No new blog or expansion of existing Insights is authorized. Preserve existing article content and legacy URL redirects. A chatbot is deferred; retain lightweight WhatsApp links.
- Cloudflare currently injects the Web Analytics beacon at the edge. Do not add a duplicate script. Custom events are unsupported by that product; the `growledger:conversion` event is a local integration hook, not a persistent analytics collector.

## SEO requirements for public production pages

- Render meaningful page content, one descriptive primary `h1`, a logical heading hierarchy, a unique title and relevant meta description in the initial HTML. Use real crawlable links for navigation. Do not hide essential service content behind client-side execution.
- Use `https://growledger.com` as the preferred production origin unless the owner changes it. Each indexable page needs exactly one absolute canonical pointing directly to its final, indexable HTTP 200 URL. Align canonical, internal links, sitemap, Open Graph URLs and actual routing, including extension and trailing-slash conventions. Exclude tracking parameters from canonicals; preserve meaningful content distinctions.
- Permanently redirect equivalent HTTP, `www`, legacy and duplicate URLs to their matching final URL, preserving paths and appropriate query parameters. Prefer a single redirect; prevent loops. Never redirect every unknown URL to the homepage. Maintain an explicit old-to-new map when migrating URLs.
- Serve a static XML sitemap at `/sitemap.xml` containing only canonical, indexable 200 pages, including public service and case-study pages. Keep `lastmod` truthful, reference it from production `robots.txt`, and submit it to Search Console. Do not include redirects, staging, API routes or error pages. Do not use `robots.txt` as a substitute for canonicalization or `noindex`.
- Preserve a useful custom 404 with home, service and contact links and an actual HTTP 404 status. Ensure SSR fallbacks do not turn invalid routes into soft 404s.
- Keep JSON-LD consistent with visible, verified business facts. Use an appropriate Organization/LocalBusiness subtype, Service and BreadcrumbList where relevant. Validate syntax and eligibility with Schema.org Validator and Google's Rich Results Test. Never invent reviews, credentials, locations or outcomes, or promise rich results. FAQ markup does not guarantee FAQ search features.
- Use working absolute social image URLs without duplicate slashes. Maintain descriptive link labels and useful internal links between related services, audiences, case studies and contact pages. Avoid keyword stuffing, thin location duplicates and bought links.
- Treat domain/page authority as third-party diagnostics, not Google scores or acceptance criteria. Judge results through relevant search impressions, qualified visits and enquiries. Improve credibility through accurate firm/team information, legitimate business profiles and earned relevant references.

## Performance requirements

- Measure before optimizing. Use production builds and representative deployed URLs, mobile and desktop cold loads, repeat visits, and the same test conditions before/after. Record transfer sizes, request counts, LCP resource, long tasks and coverage. Distinguish lab measurements from real-user data and server bundle size from browser payload.
- Aim for real-user 75th-percentile LCP <= 2.5 s, INP <= 200 ms and CLS <= 0.1, separately on mobile and desktop. Use Lighthouse diagnostically; do not promise a score or invent timing/savings when tooling or field data is unavailable.
- Preserve the static/server-rendered approach. Send JavaScript only for interactions that need it. Load page-specific code only where used; defer noncritical scripts and initialize expensive offscreen interactions on demand. Verify unused code through coverage and route checks before removal. Avoid adding a framework or large dependency for a small interaction.
- Prefer a clear, stable hero over automatic slides and continuous decorative animation. Respect reduced motion, pause timers when hidden, and avoid layout-thrashing scroll handlers. Essential content and contact paths must remain usable if enhancement scripts fail.
- Use appropriately sized WebP/AVIF photography with responsive `srcset`/`sizes` where useful; retain SVG for suitable vector assets. Set dimensions or aspect ratios. Lazy-load below-the-fold images, never the LCP hero. Apply high fetch priority/preload only to a confirmed critical asset. Use meaningful alt text for informative images and `alt=""` for decorative images; do not stuff keywords.
- Keep fonts local where practical, subset to required languages/weights, prefer WOFF2, and use a suitable font-display strategy. Preload only the critical face actually used above the fold. Avoid shipping all concept fonts/themes to one production direction.
- Keep CSS small and route-relevant. Inspect compiled CSS and coverage before deleting selectors; retain dynamic, responsive and accessibility states. Use critical CSS only when measurement justifies it. Do not defer styles that cause flashes or layout shifts merely to remove a render-blocking warning.
- Verify Brotli/gzip and CDN behaviour from response headers. Give fingerprinted assets long immutable cache lifetimes; keep mutable HTML revalidatable and private/form responses out of public caches. Do not cache unversioned assets immutably. Separate inline noncritical assets only when caching and measured rendering improve.
- Review every new analytics, chat, video or other third-party integration for transfer size, main-thread cost and layout shifts. Prefer lightweight links to WhatsApp and load optional chat on user interaction. A chatbot is not an SEO requirement.

## Content, conversion and accessibility

- The first viewport should explain what GrowLedger does, who it serves and the next useful action. Preserve a consistent brand theme and one primary conversion; prioritize clarity over stock imagery or decoration.
- Keep factual claims and regulated-service boundaries accurate. Publish client names, testimonials and case outcomes only with evidence and permission. Prefer substantive service pages over introducing a blog for traffic alone.
- Check keyboard navigation, focus visibility, labels, form errors, contrast, reduced motion and mobile layouts. Floating controls must not obscure content or form actions. Test 360, 390, 768, 1024 and 1440 px widths and a no-JavaScript fallback where supported.
- Verify analytics configuration in the deployed site and account; source inspection alone cannot prove monitoring is absent. Track successful enquiry completion, WhatsApp, phone and email clicks without sending form contents, email addresses or other personal data to analytics. Distinguish clicks from completed enquiries; apply the approved privacy/consent approach.
- Keep the existing FormSubmit validation, honeypot and fallback contact paths intact. Do not log submitted contact details or include them in analytics events. This static site does not have the staging application’s Turnstile or Worker rate limiter; do not claim those protections exist here.

## Verification and handoff

- For documentation-only changes, check formatting, links and the diff; application tests are not required.
- For code changes, run `npm run check`, `npm run check:browser` with Wrangler serving locally, and `npm run check:deploy`. This repository serves static files and has no application build/typecheck step. Add meaningful regressions for changed routing, canonicals, sitemap and forms; use `npm run assets:hash` after editing fingerprinted CSS/JS. Run `npm run check:perf -- <url> <output-directory>` when delivery or interactions change.
- After deployment, verify final status/redirect chains, raw HTML metadata, sitemap contents, structured data, assets, mobile interactions and successful contact delivery on the actual production hostname. Use the appropriate production repository's checks when its stack differs from this checkout.
- Report what changed, measured before/after evidence, checks actually run, remaining limitations and any deployment requirements. Never claim production improvements from local code or historical build artifacts alone.
