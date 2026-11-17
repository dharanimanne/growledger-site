import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const run = promisify(execFile);
const url = process.argv[2] || "http://localhost:8790/";
const directory = process.argv[3] || "output/lighthouse";
const count = Number(process.env.LIGHTHOUSE_RUNS || 3);
await mkdir(directory, { recursive: true });
const summary = [];
// Run serially: competing Chromium runs would distort the comparison.
for (const device of ["mobile", "desktop"]) {
  const samples = [];
  for (let index = 1; index <= count; index++) {
    const file = path.resolve(directory, `${device}-${index}.json`);
    const args = [
      "node_modules/lighthouse/cli/index.js",
      url,
      "--chrome-flags=--headless --no-sandbox",
      "--only-categories=performance,accessibility,seo",
      "--output=json",
      `--output-path=${file}`,
      "--quiet",
      ...(device === "desktop" ? ["--preset=desktop"] : []),
    ];
    await run(process.execPath, args, { maxBuffer: 1024 * 1024 });
    const report = JSON.parse(await readFile(file, "utf8"));
    samples.push({
      performance: report.categories.performance.score * 100,
      accessibility: report.categories.accessibility.score * 100,
      seo: report.categories.seo.score * 100,
      lcp: report.audits["largest-contentful-paint"].numericValue,
      cls: report.audits["cumulative-layout-shift"].numericValue,
      tbt: report.audits["total-blocking-time"].numericValue,
      bytes: report.audits["total-byte-weight"].numericValue,
    });
    console.log(
      `${device} ${index}/${count}: performance ${samples.at(-1).performance}`,
    );
  }
  const median = (values) =>
    [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  summary.push({
    device,
    samples,
    median: Object.fromEntries(
      Object.keys(samples[0]).map((key) => [
        key,
        median(samples.map((s) => s[key])),
      ]),
    ),
  });
}
await writeFile(
  path.resolve(directory, "summary.json"),
  JSON.stringify({ url, count, summary }, null, 2),
);
console.log(
  JSON.stringify(
    summary.map(({ device, median }) => ({ device, ...median })),
    null,
    2,
  ),
);
