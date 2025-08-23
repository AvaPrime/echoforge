/**
 * Configuration for the BlueprintComposer
 */

import {
  CompositionOptions,
  ConflictStrategy,
} from './interfaces/CompositionOptions';

/**
 * Default configuration for the BlueprintComposer
 */
export const DEFAULT_COMPOSER_CONFIG: CompositionOptions = {
  conflictStrategy: ConflictStrategy.CONSERVATIVE,
  autoRefine: false,
  maintainLineage: true,
  validateAfterComposition: true,
  customResolutionHandlers: {},
};

/**
 * Creates a configuration with conservative conflict resolution
 * Prioritizes existing functionality and the first blueprint in the composition list
 */
export function createConservativeConfig(
  overrides: Partial<CompositionOptions> = {}
): CompositionOptions {
  return {
    ...DEFAULT_COMPOSER_CONFIG,
    conflictStrategy: ConflictStrategy.CONSERVATIVE,
    ...overrides,
  };
}

/**
 * Creates a configuration with aggressive conflict resolution
 * Prioritizes new functionality and the last blueprint in the composition list
 */
export function createAggressiveConfig(
  overrides: Partial<CompositionOptions> = {}
): CompositionOptions {
  return {
    ...DEFAULT_COMPOSER_CONFIG,
    conflictStrategy: ConflictStrategy.AGGRESSIVE,
    ...overrides,
  };
}

/**
 * Creates a configuration with manual conflict resolution
 * Requires explicit resolution for each conflict
 */
export function createManualConfig(
  overrides: Partial<CompositionOptions> = {}
): CompositionOptions {
  return {
    ...DEFAULT_COMPOSER_CONFIG,
    conflictStrategy: ConflictStrategy.MANUAL,
    ...overrides,
  };
}
