import path from 'node:path';
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
    logger.info(`Summary: ${checks.length} checks → ${errors} error(s), ${warnings} warning(s)`);
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
