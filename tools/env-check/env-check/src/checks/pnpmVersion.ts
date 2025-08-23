import { execFileSafe } from '../utils/exec';
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
    ? { id: 'pnpm', status: 'PASS', detail: `pnpm ${res.stdout}`, durationMs }
    : { id: 'pnpm', status: 'FAIL', detail: `pnpm ${res.stdout} < ${minMajor}`, durationMs };
}
