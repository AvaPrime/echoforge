export type CheckStatus = 'PASS' | 'WARN' | 'FAIL';

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
