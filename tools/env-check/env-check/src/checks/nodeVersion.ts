import type { CheckResult } from '../types';

export function nodeVersionCheck(minMajor: number): CheckResult {
  const version = process.version; // v22.x.x
  const major = Number(version.slice(1).split('.')[0] || 0);
  return major >= minMajor
    ? { id: 'node', status: 'PASS', detail: `Node ${version}` }
    : { id: 'node', status: 'FAIL', detail: `Node ${version} < ${minMajor}` };
}
