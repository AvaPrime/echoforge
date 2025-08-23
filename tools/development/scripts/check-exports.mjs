#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const pkgsDir = "packages";
const entries = await readdir(pkgsDir, { withFileTypes: true });
const pkgs = entries.filter(e => e.isDirectory()).map(e => join(pkgsDir, e.name));

const missing = [];
for (const p of pkgs) {
  try {
    const pkg = JSON.parse(await readFile(join(p, "package.json"), "utf8"));
    if (!pkg.private && !pkg.exports) missing.push(pkg.name || p);
  } catch { /* ignore */ }
}
if (missing.length) {
  console.error("❌ Missing `exports` map:", missing.join(", "));
  process.exit(1);
}
console.log("✅ All public packages have `exports`.");