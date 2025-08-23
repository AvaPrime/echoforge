#!/usr/bin/env node
/**
 * EchoForge env-check scaffolder
 * - Creates packages/env-check with TypeScript CLI
 * - Adds root scripts (check:env, postinstall)
 * - Safe by default: will not overwrite existing files
 *   * --force           overwrite package files
 *   * --force-config    also overwrite root helper configs (.eslintrc, .prettierrc, tsup.lib.ts)
 */

const fs = require('fs');
const path = require('path');

const force = process.argv.includes('--force');
const forceConfig = process.argv.includes('--force-config');

// ---- helpers -------------------------------------------------------
function exitWith(msg) {
  console.error(msg);
  process.exit(1);
}

function warn(msg) {
  console.warn(`\x1b[33m${msg}\x1b[0m`);
}

function info(msg) {
  console.log(msg);
}

function writeFileSafe(filePath, content, { allowOverwrite = force } = {}) {
  const exists = fs.existsSync(filePath);
  if (exists && !allowOverwrite) {
    console.log(`↷  Skipped (exists): ${filePath}`);
    return false;
  }
  if (exists && allowOverwrite) {
    warn(`⚠️  Overwriting existing file: ${filePath}`);
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`${exists ? '✎  Updated' : '✓  Created'}: ${filePath}`);
  return true;
}

function upsertRootPackageScripts() {
  const rootPkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(rootPkgPath)) {
    warn('! Root package.json not found; skipping root script wiring.');
    return;
  }
  const pkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
  pkg.scripts = pkg.scripts || {};

  if (!pkg.scripts['check:env']) {
    pkg.scripts['check:env'] = 'pnpm -F @echoforge/env-check run check';
  }
  // keep non-blocking by default
  const desiredPostinstall = 'pnpm -F @echoforge/env-check run check || true';
  if (!pkg.scripts.postinstall) {
    pkg.scripts.postinstall = desiredPostinstall;
  } else if (!pkg.scripts.postinstall.includes('@echoforge/env-check')) {
    pkg.scripts.postinstall += ` && ${desiredPostinstall}`;
  }

  // convenience test runner
  if (!pkg.scripts['test:env-check']) {
    pkg.scripts['test:env-check'] = 'pnpm -F @echoforge/env-check run test';
  }

  // convenience init alias
  if (!pkg.scripts['init:env-check']) {
    pkg.scripts['init:env-check'] = 'node scripts/init-env-check.js';
  }

  fs.writeFileSync(rootPkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log('✓ Root package.json scripts wired: check:env, postinstall, test:env-check, init:env-check');
}

// ---- repo-root guard ------------------------------------------------
const ROOT = process.cwd();
const rootPkg = path.join(ROOT, 'package.json');
if (!fs.existsSync(rootPkg)) {
  exitWith('❌  No package.json in current directory. Run this from the repo root.');
}

const PKG_DIR = path.join(ROOT, 'packages', 'env-check');

// -------------------- file map --------------------
const files = {
  // package.json
  [path.join(PKG_DIR, 'package.json')]: `{
  "name": "@echoforge/env-check",
  "version": "0.1.0",
  "private": true,
  "type": "commonjs",
  "main": "dist/index.js",
  "bin": { "ef-env": "dist/cli.js" },
  "scripts": {
    "build": "tsup --config ../../tsup.lib.ts",
    "dev": "tsup --config ../../tsup.lib.ts --watch",
    "lint": "eslint \\"src/**/*.ts\\"",
    "check": "node dist/cli.js",
    "test": "vitest run"
  },
  "dependencies": {
    "chalk": "^5.3.0",
    "commander": "^12.1.0",
    "open": "^9.2.0",
    "yaml": "^2.5.1"
  },
  "devDependencies": {
    "@types/node": "^22.5.0",
    "tsup": "^8.0.2",
    "typescript": "^5.4.0",
    "vitest": "^3.2.4"
  }
}
`,

  // tsconfig.json
  [path.join(PKG_DIR, 'tsconfig.json')]: `{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "target": "ES2022",
    "module": "CommonJS",
    "esModuleInterop": true
  },
  "include": ["src"]
}
`,

  // config/default.yml
  [path.join(PKG_DIR, 'config', 'default.yml')]: `node:
  minVersion: 22
pnpm:
  minVersion: 10
tools:
  - name: git
    required: true
  - name: docker
    required: false
watchers:
  min: 524288
`,

  // src/types.ts
  [path.join(PKG_DIR, 'src', 'types.ts')]: `export type CheckStatus = 'PASS' | 'WARN' | 'FAIL';

export interface CheckResult {
  id: string;
  status: CheckStatus;
  detail?: string;
  durationMs?: number;
}

export interface EnvReport {
  timestamp: string;
  platform: {
    os: NodeJS.Platform;
    isWSL: boolean;
    isWindows: boolean;
    isLinux: boolean;
    isMac: boolean;
  };
  checks: CheckResult[];
  summary: { errors: number; warnings: number };
}
`,

  // src/utils/exec.ts
  [path.join(PKG_DIR, 'src', 'utils', 'exec.ts')]: `import { spawn } from 'node:child_process';

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function execFileSafe(cmd: string, args: string[] = []): Promise<ExecResult> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('close', (code) => resolve({ stdout: out.trim(), stderr: err.trim(), exitCode: code ?? -1 }));
  });
}
`,

  // src/utils/logger.ts
  [path.join(PKG_DIR, 'src', 'utils', 'logger.ts')]: `import chalk from 'chalk';

export interface LoggerOptions { json?: boolean }
export const makeLogger = (opts: LoggerOptions) => ({
  info: (m: string) => (opts.json ? null : console.log(chalk.green(m))),
  warn: (m: string) => (opts.json ? null : console.warn(chalk.yellow(m))),
  error: (m: string) => (opts.json ? null : console.error(chalk.red(m))),
  note: (m: string) => (opts.json ? null : console.log(chalk.blue(m))),
  raw: (m: string) => (opts.json ? null : console.log(m)),
});
`,

  // src/utils/opener.ts
  [path.join(PKG_DIR, 'src', 'utils', 'opener.ts')]: `import open from 'open';

export async function openDocsIfPossible(mdPath: string, _reason: string, allowOpen: boolean) {
  if (!allowOpen) return;
  if (process.env.CI === 'true') return;
  try { await open(mdPath); } catch { /* never fail on docs open */ }
}
`,

  // src/checks/platform.ts
  [path.join(PKG_DIR, 'src', 'checks', 'platform.ts')]: `import os from 'node:os';
import type { CheckResult } from '../types';

export function detectPlatform() {
  const isWSL = os.platform() === 'linux' && os.release().toLowerCase().includes('microsoft');
  const isWindows = os.platform() === 'win32';
  const isMac = os.platform() === 'darwin';
  const isLinux = os.platform() === 'linux' && !isWSL;
  return { isWSL, isWindows, isMac, isLinux };
}

export function platformCheck(): CheckResult {
  const { isWSL, isWindows, isLinux, isMac } = detectPlatform();
  if (isWSL) return { id: 'platform', status: 'PASS', detail: 'WSL2' };
  if (isLinux) return { id: 'platform', status: 'PASS', detail: 'Linux' };
  if (isMac) return { id: 'platform', status: 'PASS', detail: 'macOS' };
  if (isWindows) return { id: 'platform', status: 'WARN', detail: 'Windows (consider WSL2)' };
  return { id: 'platform', status: 'WARN', detail: 'Unknown platform' };
}
`,

  // src/checks/nodeVersion.ts
  [path.join(PKG_DIR, 'src', 'checks', 'nodeVersion.ts')]: `import type { CheckResult } from '../types';

export function nodeVersionCheck(minMajor: number): CheckResult {
  const version = process.version; // v22.x.x
  const major = Number(version.slice(1).split('.')[0] || 0);
  return major >= minMajor
    ? { id: 'node', status: 'PASS', detail: \`Node \${version}\` }
    : { id: 'node', status: 'FAIL', detail: \`Node \${version} < \${minMajor}\` };
}
`,

  // src/checks/pnpmVersion.ts
  [path.join(PKG_DIR, 'src', 'checks', 'pnpmVersion.ts')]: `import { execFileSafe } from '../utils/exec';
import type { CheckResult } from '../types';

export async function pnpmVersionCheck(minMajor: number): Promise<CheckResult> {
  const t0 = Date.now();
  const res = await execFileSafe('pnpm', ['--version']);
  const durationMs = Date.now() - t0;

  if (res.exitCode !== 0 || !res.stdout) {
    return { id: 'pnpm', status: 'FAIL', detail: 'pnpm not found (run: corepack enable)', durationMs };
  }
  const major = Number(res.stdout.split('.')[0] || 0);
  return major >= minMajor
    ? { id: 'pnpm', status: 'PASS', detail: \`pnpm \${res.stdout}\`, durationMs }
    : { id: 'pnpm', status: 'FAIL', detail: \`pnpm \${res.stdout} < \${minMajor}\`, durationMs };
}
`,

  // src/checks/tools.ts
  [path.join(PKG_DIR, 'src', 'checks', 'tools.ts')]: `import { execFileSafe } from '../utils/exec';
import type { CheckResult } from '../types';

export async function toolCheck(name: string, args: string[] = ['--version'], required = true): Promise<CheckResult> {
  const t0 = Date.now();
  const res = await execFileSafe(name, args);
  const durationMs = Date.now() - t0;

  if (res.exitCode === 0) return { id: \`tool:\${name}\`, status: 'PASS', detail: \`\${name} present\`, durationMs };
  return {
    id: \`tool:\${name}\`,
    status: required ? 'FAIL' : 'WARN',
    detail: required ? \`\${name} missing\` : \`\${name} missing (optional)\`,
    durationMs,
  };
}
`,

  // src/checks/watchers.ts
  [path.join(PKG_DIR, 'src', 'checks', 'watchers.ts')]: `import fs from 'node:fs';
import os from 'node:os';
import type { CheckResult } from '../types';

export function watcherCheck(minWatches = 524288, minInstances = 512): CheckResult {
  const isLinux = os.platform() === 'linux';
  if (!isLinux) return { id: 'watchers', status: 'PASS', detail: 'Non-Linux platform' };
  try {
    const watches = Number(fs.readFileSync('/proc/sys/fs/inotify/max_user_watches', 'utf8').trim());
    const instances = Number(fs.readFileSync('/proc/sys/fs/inotify/max_user_instances', 'utf8').trim());
    if (watches >= minWatches && instances >= minInstances) {
      return { id: 'watchers', status: 'PASS', detail: \`watches=\${watches}, instances=\${instances}\` };
    }
    return { id: 'watchers', status: 'WARN', detail: \`watches=\${watches}, instances=\${instances} (low)\` };
  } catch {
    return { id: 'watchers', status: 'WARN', detail: 'Unable to read fs.inotify limits' };
  }
}
`,

  // src/checks/packageJson.ts
  [path.join(PKG_DIR, 'src', 'checks', 'packageJson.ts')]: `import fs from 'node:fs';
import path from 'node:path';
import type { CheckResult } from '../types';

export function packageJsonCheck(cwd = process.cwd()): CheckResult {
  const pkg = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkg)) return { id: 'package.json', status: 'FAIL', detail: 'package.json not found' };
  const nm = path.join(cwd, 'node_modules');
  return fs.existsSync(nm)
    ? { id: 'package.json', status: 'PASS', detail: 'node_modules present' }
    : { id: 'package.json', status: 'WARN', detail: 'node_modules missing (run pnpm install)' };
}
`,

  // src/index.ts
  [path.join(PKG_DIR, 'src', 'index.ts')]: `import path from 'node:path';
import fs from 'node:fs';
import YAML from 'yaml';
import { makeLogger } from './utils/logger';
import { openDocsIfPossible } from './utils/opener';
import { platformCheck, detectPlatform } from './checks/platform';
import { nodeVersionCheck } from './checks/nodeVersion';
import { pnpmVersionCheck } from './checks/pnpmVersion';
import { toolCheck } from './checks/tools';
import { watcherCheck } from './checks/watchers';
import { packageJsonCheck } from './checks/packageJson';
import type { EnvReport, CheckResult } from './types';

export interface RunOptions {
  json?: boolean;
  openDocs?: boolean;
  configPath?: string;
  requiredNode?: number;
  requiredPnpm?: number;
}

function resolveConfigPath(explicit?: string) {
  if (explicit && fs.existsSync(explicit)) return explicit;
  const fallback = path.join(process.cwd(), 'packages', 'env-check', 'config', 'default.yml');
  return fallback;
}

export async function runChecks(opts: RunOptions = {}): Promise<EnvReport> {
  const logger = makeLogger({ json: !!opts.json });
  const cfgPath = resolveConfigPath(opts.configPath);
  const cfg = fs.existsSync(cfgPath) ? YAML.parse(fs.readFileSync(cfgPath, 'utf8')) : {};
  const requiredNode = Number(opts.requiredNode ?? cfg?.node?.minVersion ?? 22);
  const requiredPnpm = Number(opts.requiredPnpm ?? cfg?.pnpm?.minVersion ?? 10);
  const tools: Array<{ name: string; required: boolean }> =
    cfg?.tools ?? [{ name: 'git', required: true }, { name: 'docker', required: false }];

  const plat = detectPlatform();

  const checks: CheckResult[] = [];
  checks.push(platformCheck());
  checks.push(nodeVersionCheck(requiredNode));
  checks.push(await pnpmVersionCheck(requiredPnpm));
  for (const t of tools) checks.push(await toolCheck(t.name, ['--version'], t.required));
  checks.push(watcherCheck());
  checks.push(packageJsonCheck());

  const errors = checks.filter((c) => c.status === 'FAIL').length;
  const warnings = checks.filter((c) => c.status === 'WARN').length;

  if (!opts.json) {
    logger.raw(' ');
    logger.info(\`Summary: \${checks.length} checks → \${errors} error(s), \${warnings} warning(s)\`);
  }

  // Auto-open docs on common issues (skips in CI via opener guard)
  const docs = path.join(process.cwd(), 'docs', 'WSL_DEV.md');
  if (fs.existsSync(docs) && ((plat.isWSL && process.cwd().startsWith('/mnt/')) || errors > 0 || warnings > 0)) {
    await openDocsIfPossible(docs, 'env issues', !!opts.openDocs);
  }

  return {
    timestamp: new Date().toISOString(),
    platform: { os: process.platform, ...plat },
    checks,
    summary: { errors, warnings },
  };
}
`,

  // src/cli.ts
  [path.join(PKG_DIR, 'src', 'cli.ts')]: `#!/usr/bin/env node
import { Command } from 'commander';
import { runChecks } from './index';

const program = new Command();
program
  .name('ef-env')
  .description('EchoForge development environment validator')
  .option('-j, --json', 'Output JSON', false)
  .option('-c, --config <file>', 'Path to YAML/JSON config')
  .option('--no-open-docs', 'Do not attempt to open docs file')
  .option('--required-node <num>', 'Minimum Node major version', (v) => Number(v))
  .option('--required-pnpm <num>', 'Minimum pnpm major version', (v) => Number(v))
  .parse(process.argv);

const opts = program.opts();

const res = await runChecks({
  json: !!opts.json,
  openDocs: opts.openDocs !== false,
  configPath: opts.config,
  requiredNode: opts.requiredNode,
  requiredPnpm: opts.requiredPnpm,
});

if (opts.json) {
  console.log(JSON.stringify(res, null, 2));
}
process.exit(res.summary.errors > 0 ? 1 : 0);
`,

  // test/platform.test.ts
  [path.join(PKG_DIR, 'test', 'platform.test.ts')]: `import { detectPlatform, platformCheck } from '../src/checks/platform';
import { expect, test } from 'vitest';

test('detectPlatform returns boolean flags', () => {
  const p = detectPlatform();
  expect(typeof p.isWSL).toBe('boolean');
  expect(typeof p.isWindows).toBe('boolean');
  expect(typeof p.isLinux).toBe('boolean');
  expect(typeof p.isMac).toBe('boolean');
});

test('platformCheck returns a known status', () => {
  const r = platformCheck();
  expect(['PASS', 'WARN']).toContain(r.status);
});
`,
};

// root helpers (tsup config + eslint + prettier)
const rootFiles = {
  [path.join(ROOT, 'tsup.lib.ts')]: `import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  minify: false,
  sourcemap: true,
  target: 'node22',
  external: ['chalk', 'commander', 'open', 'yaml'],
});
`,
  [path.join(ROOT, '.eslintrc.cjs')]: `module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { node: true, es2022: true },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
  },
};
`,
  [path.join(ROOT, '.prettierrc')]: `{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
`,
};

// -------------------- run --------------------
console.log('▶ Scaffolding @echoforge/env-check ...');
Object.entries(files).forEach(([p, c]) => writeFileSafe(p, c));
Object.entries(rootFiles).forEach(([p, c]) => {
  const allowOverwrite = forceConfig || !fs.existsSync(p);
  writeFileSafe(p, c, { allowOverwrite });
});
upsertRootPackageScripts();

console.log('\n✨ Done. Next steps:');
console.log('   pnpm install');
console.log('   pnpm -F @echoforge/env-check run build');
console.log('   pnpm check:env   # pretty output');
console.log('   pnpm check:env --json   # CI/machine output');
console.log('\n(Pro tip) Re-run with --force to overwrite package files, and --force-config to also overwrite root helper configs.');
