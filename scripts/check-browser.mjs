import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const base = process.env.SITE_URL || "http://localhost:8790";
const output = process.env.QA_OUTPUT || "output/playwright";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
});
await mkdir(output, { recursive: true });
const results = { routes: [], layouts: [], accessibility: [], forms: [] };
try {
  const context = await browser.newContext();
  // All provider submissions are intercepted below; never send test enquiries.
  await context.route("https://formsubmit.co/**", (route) => route.abort());
  const sitemap = await readFile("public/sitemap.xml", "utf8");
  const paths = [
    ...sitemap.matchAll(/<loc>https:\/\/growledger.com([^<]*)<\/loc>/g),
  ].map((m) => m[1]);
  for (const path of paths) {
    const response = await context.request.get(base + path, {
      maxRedirects: 0,
    });
    assert.equal(response.status(), 200, path);
    const source = await response.text();
    assert(
      source.includes(`rel="canonical" href="https://growledger.com${path}"`),
      path,
    );
    results.routes.push(path);
    if (path !== "/") {
      const legacy = path.endsWith("/") ? `${path}index.html` : `${path}.html`;
      const old = await context.request.get(
        base + legacy + "?utm_source=regression",
        { maxRedirects: 0 },
      );
      assert.equal(old.status(), 301, legacy);
      assert.equal(
        new URL(old.headers().location, base).pathname,
        path,
        legacy,
      );
      assert.equal(
        new URL(old.headers().location, base).search,
        "?utm_source=regression",
        legacy,
      );
    }
  }
  for (const path of [
    "/missing-regression-page",
    "/services/missing-regression-page",
    "/missing-regression-page.html",
  ]) {
    const response = await context.request.get(base + path);
    assert.equal(response.status(), 404, path);
    assert((await response.text()).includes("Explore our services"));
  }
  for (const [legacy, canonical] of [
    ["/insights", "/insights/"],
    ["/case-studies/index", "/case-studies/"],
    ["/services/virtual-cfo-services/", "/services/virtual-cfo-services"],
  ]) {
    const response = await context.request.get(base + legacy + "?source=test", {
      maxRedirects: 0,
    });
    assert.equal(response.status(), 301, legacy);
    assert.equal(
      new URL(response.headers().location, base).pathname,
      canonical,
    );
    assert.equal(
      new URL(response.headers().location, base).search,
      "?source=test",
    );
  }

  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const sample = [
    "/",
    "/services/virtual-cfo-services",
    "/case-studies/manufacturer-pricing-profitability",
    "/insights/product-customer-profitability",
    "/the-cfo-role",
    "/missing-regression-page",
  ];
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of sample) {
      await page.goto(base + path);
      await page.locator("main").waitFor();
      assert.equal(await page.locator("h1").count(), 1, path);
      assert(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
        `${path} overflows at ${width}`,
      );
      if (width === 390 || width === 1440) {
        const scan = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        results.accessibility.push({
          path,
          width,
          violations: scan.violations,
        });
      }
      results.layouts.push({ path, width });
    }
    await page.goto(base);
    await page.screenshot({
      path: `${output}/home-${width}.png`,
      fullPage: true,
    });
  }

  await page.goto(base);
  // Keyboard tab selection follows the ARIA tab pattern.
  const tab = page.getByRole("tab", { name: "Startups & growth companies" });
  await tab.focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page
      .getByRole("tab", { name: "Family businesses", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.getByRole("button", { name: "Tax", exact: true }).click();
  assert.equal(await page.locator("#cards .card:visible").count(), 2);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByRole("button", { name: "Show all insights" }).click();
  assert.equal(await page.locator("#cards .card:visible").count(), 12);
  // The enquiry journey must distinguish rejection from accepted delivery.
  async function fillForm() {
    await page.locator("#c-name").fill("Regression Test");
    await page.locator("#c-phone").fill("0000000000");
    await page.locator("#c-email").fill("regression@example.invalid");
    await page.locator("#c-who").selectOption({ label: "Other" });
  }
  await page.evaluate(() => {
    window.conversions = [];
    window.addEventListener("growledger:conversion", (e) =>
      window.conversions.push(e.detail),
    );
  });
  await fillForm();
  await page.route("https://formsubmit.co/ajax/**", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: '{"success":false}',
    }),
  );
  await page.locator("#c-send").click();
  await page.locator("#c-ready").waitFor({ state: "visible" });
  assert(!(await page.locator("#c-sent").isVisible()));
  assert.equal(
    (await page.evaluate(() => window.conversions)).filter(
      (e) => e.name === "enquiry_success",
    ).length,
    0,
  );
  results.forms.push(
    "failure keeps the message and exposes WhatsApp/email fallback",
  );
  await page.unroute("https://formsubmit.co/ajax/**");
  await page.route("https://formsubmit.co/ajax/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"success":"true"}',
    }),
  );
  await page.locator("#c-send").click();
  await page.locator("#c-sent").waitFor({ state: "visible" });
  const events = await page.evaluate(() => window.conversions);
  assert.equal(events.filter((e) => e.name === "enquiry_success").length, 1);
  assert.deepEqual(
    events.find((e) => e.name === "enquiry_success"),
    { name: "enquiry_success", path: "/" },
  );
  assert(!JSON.stringify(events).includes("Regression"));
  assert.equal(await page.locator("#c-name").inputValue(), "");
  results.forms.push(
    "provider acceptance emits one event with no personal data",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#menu-open").click();
  assert(
    await page
      .locator("#menu-close")
      .evaluate((e) => e === document.activeElement),
  );
  await page.keyboard.press("Escape");
  assert(await page.locator("#drawer").evaluate((e) => e.hidden));
  assert(
    await page
      .locator("#menu-open")
      .evaluate((e) => e === document.activeElement),
  );

  // No JavaScript: service information, article links, contact and mobile navigation remain useful.
  const plain = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const fallback = await plain.newPage();
  await fallback.goto(base);
  assert.equal(await fallback.locator("#cards .card:visible").count(), 12);
  assert.equal(await fallback.locator("[data-tab-panel]:visible").count(), 4);
  assert(await fallback.locator(".nojs-nav").isVisible());
  assert.equal(await fallback.locator("#cform").getAttribute("method"), "post");
  assert(
    (await fallback.locator("#cform").getAttribute("action")).startsWith(
      "https://formsubmit.co/",
    ),
  );
  await plain.close();
  assert.deepEqual(errors, [], "browser JavaScript errors");
  const violations = results.accessibility.flatMap((x) =>
    x.violations.map((v) => ({
      path: x.path,
      width: x.width,
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    })),
  );
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({ ...results, violations }, null, 2),
  );
  assert.equal(violations.length, 0, JSON.stringify(violations, null, 2));
  console.log(
    `Verified ${results.routes.length} routes, ${results.layouts.length} layouts, ${results.accessibility.length} accessibility scans, form states, keyboard and no-JS fallbacks.`,
  );
} finally {
  await browser.close();
}
