/**
 * ValidatorConfig.ts
 * Provides default configuration and utility functions for the Blueprint Validator Engine.
 */

import path from 'path';
import {
  ValidatorOptions,
  ValidationMode,
  ValidationLevel,
  MockConfig,
  ReflexiveMemoryOptions,
} from './interfaces/ValidatorOptions';

/**
 * Default validator configuration
 */
export const DEFAULT_VALIDATOR_CONFIG: ValidatorOptions = {
  mode: ValidationMode.HEADLESS,
  validationLevel: ValidationLevel.NORMAL,
  mockConfig: {
    useMocks: true,
    mockDataPath: path.join(process.cwd(), '.codessa', 'mocks'),
  },
  reflexiveMemory: {
    saveToMemory: true,
    memoryPath: path.join(process.cwd(), '.codessa', 'validation'),
    annotateBlueprint: true,
  },
  autofix: false,
  useGuildContracts: false,
  timeout: 30000, // 30 seconds
  continueOnFailure: true,
  assertionProviders: ['default'],
  customValidationScriptsPath: path.join(
    process.cwd(),
    '.codessa',
    'validation-scripts'
  ),
};

/**
 * Merges user-provided options with default configuration
 */
export function mergeWithDefaultConfig(
  options?: Partial<ValidatorOptions>
): ValidatorOptions {
  if (!options) {
    return DEFAULT_VALIDATOR_CONFIG;
  }

  return {
    ...DEFAULT_VALIDATOR_CONFIG,
    ...options,
    mockConfig: {
      ...DEFAULT_VALIDATOR_CONFIG.mockConfig,
      ...(options.mockConfig || {}),
    },
    reflexiveMemory: {
      ...DEFAULT_VALIDATOR_CONFIG.reflexiveMemory,
      ...(options.reflexiveMemory || {}),
    },
  };
}

/**
 * Creates a configuration for interactive validation mode
 */
export function createInteractiveConfig(
  baseConfig?: Partial<ValidatorOptions>
): ValidatorOptions {
  return mergeWithDefaultConfig({
    ...baseConfig,
    mode: ValidationMode.INTERACTIVE,
  });
}

/**
 * Creates a configuration for headless validation mode
 */
export function createHeadlessConfig(
  baseConfig?: Partial<ValidatorOptions>
): ValidatorOptions {
  return mergeWithDefaultConfig({
    ...baseConfig,
    mode: ValidationMode.HEADLESS,
  });
}

/**
 * Creates a configuration with autofix enabled
 */
export function createAutofixConfig(
  baseConfig?: Partial<ValidatorOptions>
): ValidatorOptions {
  return mergeWithDefaultConfig({
    ...baseConfig,
    autofix: true,
  });
}

/**
 * Creates a configuration with guild contracts enabled
 */
export function createGuildConfig(
  baseConfig?: Partial<ValidatorOptions>
): ValidatorOptions {
  return mergeWithDefaultConfig({
    ...baseConfig,
    useGuildContracts: true,
  });
}
