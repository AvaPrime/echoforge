import chalk from 'chalk';

export interface LoggerOptions { json?: boolean }
export const makeLogger = (opts: LoggerOptions) => ({
  info: (m: string) => (opts.json ? null : console.log(chalk.green(m))),
  warn: (m: string) => (opts.json ? null : console.warn(chalk.yellow(m))),
  error: (m: string) => (opts.json ? null : console.error(chalk.red(m))),
  note: (m: string) => (opts.json ? null : console.log(chalk.blue(m))),
  raw: (m: string) => (opts.json ? null : console.log(m)),
});
