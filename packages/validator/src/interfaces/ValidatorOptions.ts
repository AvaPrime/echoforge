/**
 * ValidatorOptions interfaces
 */

export enum ValidationMode {
  INTERACTIVE = 'interactive',
  HEADLESS = 'headless',
  AUTOFIX = 'autofix'
}

export enum ValidationLevel {
  STRICT = 'strict',
  MODERATE = 'moderate',
  LENIENT = 'lenient'
}

export interface ValidatorOptions {
  mode: ValidationMode;
  level: ValidationLevel;
  timeout?: number;
  retries?: number;
  verbose?: boolean;
  outputPath?: string;
}