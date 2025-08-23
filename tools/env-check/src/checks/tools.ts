import { execFileSafe } from '../utils/exec';
import type { CheckResult } from '../types';

export async function toolCheck(name: string, args: string[] = ['--version'], required = true): Promise<CheckResult> {
  const t0 = Date.now();
  const res = await execFileSafe(name, args);
  const durationMs = Date.now() - t0;

  if (res.exitCode === 0) return { id: `tool:${name}`, status: 'PASS', detail: `${name} present`, durationMs };
  return {
    id: `tool:${name}`,
    status: required ? 'FAIL' : 'WARN',
    detail: required ? `${name} missing` : `${name} missing (optional)`,
    durationMs,
  };
}
