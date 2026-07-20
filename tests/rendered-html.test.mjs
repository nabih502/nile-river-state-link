import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("builds the Vite app and serves the Arabic site", async () => {
  const [html, packageJson] = await Promise.all([
    readFile(new URL("dist/index.html", projectRoot), "utf8"),
    readFile(new URL("package.json", projectRoot), "utf8"),
  ]);

  assert.match(packageJson, /"vite"/);
  assert.doesNotMatch(packageJson, /vinext|@cloudflare\/vite-plugin/);

  assert.match(html, /<title>رابطة ولاية نهر النيل الرقمية<\/title>/);
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /type="module"/);
});

test("entry point and site component exist", async () => {
  const [main, site] = await Promise.all([
    readFile(new URL("src/main.tsx", projectRoot), "utf8"),
    readFile(new URL("src/site.tsx", projectRoot), "utf8"),
  ]);

  assert.match(main, /createRoot/);
  assert.match(main, /import.*\.\/site/);
  assert.match(site, /export default function NileSite/);
});
