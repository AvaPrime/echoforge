/**
 * ValidatorConfig - Configuration presets for the validator
 */

import { ValidatorOptions, ValidationMode, ValidationLevel } from './interfaces/ValidatorOptions';

export const DEFAULT_VALIDATOR_CONFIG: ValidatorOptions = {
  mode: ValidationMode.INTERACTIVE,
  level: ValidationLevel.MODERATE,
  timeout: 30000,
  retries: 3,
  verbose: false
};

export function createInteractiveConfig(overrides?: Partial<ValidatorOptions>): ValidatorOptions {
  return {
    ...DEFAULT_VALIDATOR_CONFIG,
    mode: ValidationMode.INTERACTIVE,
    ...overrides
  };
}

export function createHeadlessConfig(overrides?: Partial<ValidatorOptions>): ValidatorOptions {
  return {
    ...DEFAULT_VALIDATOR_CONFIG,
    mode: ValidationMode.HEADLESS,
    verbose: true,
    ...overrides
  };
}

export function createAutofixConfig(overrides?: Partial<ValidatorOptions>): ValidatorOptions {
  return {
    ...DEFAULT_VALIDATOR_CONFIG,
    mode: ValidationMode.AUTOFIX,
    level: ValidationLevel.STRICT,
    ...overrides
  };
}

export function createGuildModeConfig(overrides?: Partial<ValidatorOptions>): ValidatorOptions {
  return {
    ...DEFAULT_VALIDATOR_CONFIG,
    mode: ValidationMode.INTERACTIVE,
    level: ValidationLevel.LENIENT,
    verbose: true,
    ...overrides
  };
}