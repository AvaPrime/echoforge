/**
 * Options for blueprint composition
 */

/**
 * Strategy for resolving conflicts during blueprint composition
 */
export enum ConflictStrategy {
  /**
   * Conservative strategy - preserves existing functionality when conflicts occur
   * Prioritizes the first blueprint in the composition list
   */
  CONSERVATIVE = 'conservative',

  /**
   * Aggressive strategy - adopts new functionality when conflicts occur
   * Prioritizes the last blueprint in the composition list
   */
  AGGRESSIVE = 'aggressive',

  /**
   * Manual strategy - requires explicit resolution for each conflict
   * Will throw an error if conflicts are not manually resolved
   */
  MANUAL = 'manual',
}

/**
 * Options for blueprint composition
 */
export interface CompositionOptions {
  /**
   * Strategy for resolving conflicts during composition
   * @default ConflictStrategy.CONSERVATIVE
   */
  conflictStrategy?: ConflictStrategy;

  /**
   * Whether to automatically refine the composed blueprint
   * @default false
   */
  autoRefine?: boolean;

  /**
   * Whether to maintain agent ID lineage and capability provenance
   * @default true
   */
  maintainLineage?: boolean;

  /**
   * Whether to validate the composed blueprint after composition
   * @default true
   */
  validateAfterComposition?: boolean;

  /**
   * Custom conflict resolution handlers for specific capabilities
   * Keys are capability names, values are resolution strategies
   */
  customResolutionHandlers?: Record<
    string,
    ConflictStrategy | CustomResolutionHandler
  >;
}

/**
 * Custom resolution handler for conflicts
 */
export type CustomResolutionHandler = (
  conflictingCapabilities: any[],
  blueprintSources: any[]
) => any;
