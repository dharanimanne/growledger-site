# SEO and performance implementation report

Date: 17 November 2026. Production source: `dharanimanne/growledger-site`, base revision `42be17e`. The separate sibling Astro showcase is not this deployment.

## What changed

- Canonicals, Open Graph URLs, schema URLs and internal links now use final extensionless URLs, retaining trailing slashes for directory indexes. Known `.html`, index and slash aliases have explicit 301 mappings with query preservation. No catch-all redirect was added.
- Static sitemap expanded from 14 to all 32 intended pages: home, privacy, CFO role, six services, ten case-study pages and thirteen existing Insights pages. Legacy article URLs remain supported. Newly edited metadata uses the actual change date.
- Normalized double slashes in social/schema image URLs and retained one breadcrumb trail per relevant page. Existing ProfessionalService, Service and FAQ content remains; no invented ratings or qualifications.
- Homepage keeps its original branded finance proposition and primary review CTA. Removed automatic highlight/word rotation, the unused modal reader and duplicated full article bodies. Existing article pages remain intact and their homepage cards are now crawlable initial HTML.
- Removed duplicated scroll/reveal/counting code and unused motion/reader CSS. Reused small deferred scripts and shared subpage CSS with content fingerprints and immutable cache headers. Displayed PNG logos now use existing small WebP variants; local WOFF2 fonts and tiny lazy-loaded portraits were already appropriate and were retained.
- Replaced flipping question cards with visible question/answer cards. Added skip links, keyboard tab/menu behaviour, focus management, semantic article headings, improved muted-text contrast and underlined breadcrumb links. Service panels, navigation, article links and contact remain usable without JavaScript.
- Contact enhancement validates native input, times out a stalled provider after 15 seconds, preserves retry/WhatsApp/email options, and emits a success hook only after provider acceptance. The form now has a normal POST fallback. No enquiry data enters analytics events.
- Preserved the Cloudflare beacon already injected at the edge. Documented its privacy-first use in the existing privacy page. Added local allowlisted contact/conversion hooks without adding another tracker or an unsupported Cloudflare custom-event API.
- Added durable AGENTS.md/CLAUDE.md rules, locked QA tooling, full-page validation, route/sitemap/hash checks, browser regression automation and GitHub Actions evidence uploads.

No new blog, article content, chatbot, framework migration, account provisioning, DNS mutation or live deployment is included. Existing published content and corresponding old links are preserved.

## Measurements

The live homepage baseline scored 100 performance and SEO in three mobile Lighthouse runs; accessibility varied from 89 to 92 due to animated content/controls. The report's large-payload claim was not supported for the current revision. Browser inspection, unlike raw HTML retrieval, revealed the edge-injected Cloudflare Web Analytics beacon.

For a controlled comparison, both base and changed files were served through Wrangler 4.164.0 locally on the same machine. Lighthouse 13.6.0 ran three serial cold-load mobile samples and three desktop samples for each version. The table shows per-metric medians, not one composite run. No live edge beacon is injected into either local version.

| Device  | Performance | Accessibility | SEO       | LCP           | CLS           | TBT      |
| ------- | ----------- | ------------- | --------- | ------------- | ------------- | -------- |
| mobile  | 100 → 100   | 92 → 100      | 100 → 100 | 0.82 → 0.91 s | 0.000 → 0.000 | 9 → 0 ms |
| desktop | 100 → 100   | 96 → 100      | 100 → 100 | 0.22 → 0.25 s | 0.000 → 0.000 | 0 → 0 ms |

Median measured page transfer decreased from 99,817 to 92,038 bytes (about 8%). Homepage HTML decreased from 131,464 to 94,660 uncompressed bytes (about 28%). First-party executable JavaScript decreased from about 32 KB inline to 7.3 KB in deferred shared/home scripts (about 77%). All published HTML combined decreased from 782,395 to 380,102 bytes; shared CSS/JS is additional and cached across page visits. These source sizes are not the entire network payload.

LCP is slightly higher in the local changed samples, while remaining well inside the good threshold; there is no demonstrated loading-time improvement. Both versions already scored 100 performance. The verified benefits are smaller delivery, stable content, removal of background work, improved accessibility and more consistent discoverability. Real-user INP/p75 and post-release performance still require deployed traffic; lab TBT is not field INP.

## Verification

- Seven source-check groups cover all public canonicals/Open Graph tags, metadata, local references, image alt/dimensions, structured data, breadcrumb uniqueness, sitemap completeness, permanent legacy mappings and asset fingerprints.
- HTML validation runs across every published page.
- Browser suite verifies all 32 final routes, `.html` redirects and query preservation, representative additional aliases, nested real-status 404s, five screen widths (360/390/768/1024/1440), keyboard tabs/menu, static article filters and no-JavaScript fallbacks.
- Twelve axe scans cover mobile/desktop home, service, case study, existing article, CFO role and error page. No violations remained after correcting breadcrumb link styling.
- Form success/failure requests are intercepted locally; no test messages were sent. Provider acceptance emits one event with only name/path. Actual inbox delivery is not claimed.
- Wrangler deployment dry run passed. Locked development dependencies had zero known vulnerabilities at the time of verification.
- Screenshots and raw reports remain in ignored `output/` or temporary audit directories. CI uploads browser evidence on each PR; do not confuse local results with production verification.

## Analytics and external work

Cloudflare Web Analytics is free and already loads on the production page. Its beacon uses the existing site's public token, but dashboard ownership, available history and field metrics could not be inspected with the currently connected account. Do not create a duplicate property or manually inject a second beacon. Switch to the account owning `growledger.com`, open Web Analytics, select the site and confirm visits/performance appear. Account verification is still required; local code cannot establish dashboard receipt.

Cloudflare Web Analytics currently does not support custom events. `window` dispatches `growledger:conversion` with `{name, path}` for `whatsapp_click`, `phone_click`, `email_click`, `primary_cta_click` and `enquiry_success`. The hook does not make a network request or persist data. No custom conversion dashboard is claimed; choosing a collector is separate follow-up work if that reporting is wanted. WhatsApp clicks are intent rather than conversations; provider acceptance is not proof of inbox delivery.

Search Console ownership/sitemap submission, eligible business profile updates, earned mentions, verified new proof and 30/60/90-day search/enquiry review need the owner's accounts and real evidence. No backlink purchases, fabricated case outcomes or promised authority/ranking gains are included.

## Release checklist

This branch is for review. Pushing does not authorize a merge, production deployment or zone-rule mutation.

1. Review the PR and successful Check site workflow/preview. Keep `42be17e` as the source rollback reference until a newer deployed revision is recorded.
2. In the correct Cloudflare account, inspect the existing HTTPS and www-to-apex zone rules. Repository redirects only fix the asset path stage; they cannot bypass an earlier edge redirect. Prefer a single zone redirect for non-HTTPS or www requests that also maps known legacy paths to their final routes, with query preservation. Do not change unknown paths or mail records. Never claim single-hop HTTP/www conversion from `_redirects` alone.
3. Merge only when authorized. Confirm the resulting Worker version/deployment, timestamp and previous rollback version in Cloudflare Workers Builds.
4. Check `https://growledger.com/`, HTTP and www homepage/deep URLs, `.html`, directory-index and slash aliases, with and without queries. Final indexable routes must be 200 with one matching self-canonical; legacy routes must be permanent and loops absent. Check nested missing URLs remain 404.
5. Fetch `/sitemap.xml`, validate all 32 final URLs, confirm robots remains crawlable, submit in the verified Search Console property and inspect representative service/case-study URLs. Validate changed schema with Schema.org Validator/Rich Results Test; rich-result display is not guaranteed.
6. Check compression, CDN headers, fingerprinted files and repeat navigation on production. Repeat mobile/desktop Lighthouse and visual/keyboard/contact smoke checks on the real hostname; compare against the live baseline separately from the local table.
7. With approved test details and mailbox-owner coordination, confirm one real enquiry reaches the inbox and WhatsApp reaches the approved number. Verify the Cloudflare analytics dashboard records the site without duplicate beacons. No external test message was sent by this task.
8. Revert the release merge or select the prior verified Worker version if acceptance fails. Confirm rollback restores content, routes, form behaviour and assets; zone-rule changes require their own rollback.

## References

- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Core Web Vitals](https://web.dev/articles/vitals)
- [Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/about/)
- [Cloudflare analytics event limitations](https://developers.cloudflare.com/web-analytics/faq/)
- [Workers static-asset redirects](https://developers.cloudflare.com/workers/static-assets/redirects/)
