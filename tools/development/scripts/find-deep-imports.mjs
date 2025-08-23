#!/usr/bin/env node
import { execSync } from "node:child_process";

const cmd = 'git grep -nE "from [\'\"].*src/|require\\([\'\"][^\'\"]src/" -- "*.js" "*.ts" "*.jsx" "*.tsx" "*.mjs" "*.cjs" ":(exclude)dist"';
let out = "";
try {
  out = execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString();
} catch (e) {
  out = e.stdout?.toString() || "";
}

if (out.trim()) {
  console.error("❌ Deep imports detected (use package public entrypoints):\n" + out);
  process.exit(1);
}

console.log("✅ No deep imports detected.");