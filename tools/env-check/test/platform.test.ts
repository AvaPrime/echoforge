import { detectPlatform, platformCheck } from '../src/checks/platform';
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
