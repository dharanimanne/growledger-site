// Keep immutable asset URLs aligned with their contents after an edit.
import { readdir, readFile, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const changes = [];
for (const directory of ["css", "js"]) {
  for (const name of await readdir(`public/${directory}`)) {
    if (!/\.[a-f0-9]{12}\.(css|js)$/.test(name)) continue;
    const source = `public/${directory}/${name}`;
    const digest = createHash("sha256")
      .update(await readFile(source))
      .digest("hex")
      .slice(0, 12);
    const next = name.replace(/\.[a-f0-9]{12}\./, `.${digest}.`);
    if (next === name) continue;
    await rename(source, `public/${directory}/${next}`);
    changes.push([`/${directory}/${name}`, `/${directory}/${next}`]);
  }
}
async function update(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await update(file);
    else if (file.endsWith(".html") || entry.name === "_headers") {
      let text = await readFile(file, "utf8");
      for (const [before, after] of changes)
        text = text.replaceAll(before, after);
      await writeFile(file, text);
    }
  }
}
await update("public");
console.log(
  `Updated ${changes.length} asset fingerprints and their HTML/header references.`,
);
