import { spawn } from 'node:child_process';

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
    child.on('error', (error) => {
      // Handle ENOENT (command not found) and other spawn errors gracefully
      resolve({ stdout: '', stderr: error.message, exitCode: -1 });
    });
  });
}
