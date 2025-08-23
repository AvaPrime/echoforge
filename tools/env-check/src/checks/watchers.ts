import fs from 'node:fs';
import os from 'node:os';
import type { CheckResult } from '../types';

export function watcherCheck(minWatches = 524288, minInstances = 512): CheckResult {
  const isLinux = os.platform() === 'linux';
  if (!isLinux) return { id: 'watchers', status: 'PASS', detail: 'Non-Linux platform' };
  try {
    const watches = Number(fs.readFileSync('/proc/sys/fs/inotify/max_user_watches', 'utf8').trim());
    const instances = Number(fs.readFileSync('/proc/sys/fs/inotify/max_user_instances', 'utf8').trim());
    if (watches >= minWatches && instances >= minInstances) {
      return { id: 'watchers', status: 'PASS', detail: `watches=${watches}, instances=${instances}` };
    }
    return { id: 'watchers', status: 'WARN', detail: `watches=${watches}, instances=${instances} (low)` };
  } catch {
    return { id: 'watchers', status: 'WARN', detail: 'Unable to read fs.inotify limits' };
  }
}
