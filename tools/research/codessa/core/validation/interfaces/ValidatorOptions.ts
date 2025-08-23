/**
 * ValidatorOptions.ts
 * Defines configuration options for the Blueprint Validator Engine.
 */

export enum ValidationMode {
  HEADLESS = 'headless',
  INTERACTIVE = 'interactive',
}

export enum ValidationLevel {
  STRICT = 'strict', // All assertions must pass
  NORMAL = 'normal', // Critical and high severity assertions must pass
  RELAXED = 'relaxed', // Only critical assertions must pass
}

export interface MockConfig {
  /**
   * Whether to use mocks for external dependencies
   */
  useMocks: boolean;

  /**
   * Path to mock data directory
   */
  mockDataPath?: string;

  /**
   * Custom mock implementations
   */
  customMocks?: Record<string, any>;
}

export interface ReflexiveMemoryOptions {
  /**
   * Whether to save validation results to reflexive memory
   */
  saveToMemory: boolean;

  /**
   * Path to save validation results
   */
  memoryPath?: string;

  /**
   * Whether to annotate the blueprint with validation results
   */
  annotateBlueprint: boolean;
}

export interface ValidatorOptions {
  /**
   * Validation mode (headless or interactive)
   */
  mode: ValidationMode;

  /**
   * Validation strictness level
   */
  validationLevel: ValidationLevel;

  /**
   * Mock configuration
   */
  mockConfig: MockConfig;

  /**
   * Reflexive memory options
   */
  reflexiveMemory: ReflexiveMemoryOptions;

  /**
   * Whether to automatically fix failed assertions when possible
   */
  autofix: boolean;

  /**
   * Whether to use guild behavioral contracts for validation
   */
  useGuildContracts: boolean;

  /**
   * Maximum execution time for validation in milliseconds
   */
  timeout: number;

  /**
   * Whether to continue validation after a failure
   */
  continueOnFailure: boolean;

  /**
   * Custom assertion providers
   */
  assertionProviders?: string[];

  /**
   * Path to custom validation scripts
   */
  customValidationScriptsPath?: string;
}
