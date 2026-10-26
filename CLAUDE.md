# CLAUDE.md

GrowLedger Advisors marketing site, live at https://growledger.com. Static HTML/CSS/JS with no build step, served by the Cloudflare Worker `growledger-website` (static assets only).

## Layout

- `public/` is the published site. Everything outside it (this file, README, wrangler.jsonc, .github) is never served.
- `public/index.html` holds all page content, the SEO meta tags and the JSON-LD structured data.
- `public/css/styles.css`: `@font-face` rules first, then design tokens in `:root`. Reuse the tokens (`--green`, `--brass`, `--ink-2`, `--serif`, `--sans`) rather than new colours or fonts.
- `public/js/main.js`: mobile menu, copy buttons, and the Join Us form (builds a WhatsApp/email message; nothing is sent to a server).

## Rules for edits

- Branch from `main` and open a pull request. Never push to `main` directly: merging to `main` deploys to the live site.
- Keep copy changes in sync: if you rename a practice, partner or contact detail in the page, update the JSON-LD block in `<head>` too.
- When page content changes, set `<lastmod>` in `public/sitemap.xml` to today's date.
- Images: add WebP, with explicit `width`/`height`, a meaningful `alt`, and `loading="lazy"` below the fold. Partner photos are 296×296.
- The page must work from 320px wide with no horizontal scroll, and keep text contrast at WCAG AA (4.5:1). `--brass` is already tuned for this.
- Keep a single `<h1>`; each section has an `<h2>`.
- Do not invent facts (clients, figures, credentials, addresses). Ask instead.

## Checks

The `Check site` GitHub Action runs on every pull request: HTML validation, JSON-LD/manifest/sitemap parsing, missing-file references and a Wrangler dry run. Run locally with:

```sh
npx -y html-validate@9 --rule 'no-inline-style:off' --rule 'doctype-style:off' public/index.html public/404.html
npx wrangler dev        # http://localhost:8787, Cloudflare runtime incl. _headers and 404
```

## Deploys

Cloudflare Workers Builds is connected to this repo:
- Pull request / non-`main` branch: uploads a preview version and comments its `*.workers.dev` preview URL on the PR. The live site is untouched.
- Merge to `main`: `npx wrangler deploy` publishes to growledger.com.
- Undo a bad release: `npx wrangler rollback`, or revert the merge commit.
