import fs from 'node:fs';
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
