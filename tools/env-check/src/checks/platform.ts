import os from 'node:os';
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
