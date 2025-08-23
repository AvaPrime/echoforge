/**
 * Interfaces for blueprint diffing
 */

/**
 * Type of change in a blueprint diff
 */
export enum ChangeType {
  /**
   * Added - a new element was added
   */
  ADDED = 'added',

  /**
   * Removed - an element was removed
   */
  REMOVED = 'removed',

  /**
   * Modified - an element was modified
   */
  MODIFIED = 'modified',

  /**
   * Unchanged - an element remained unchanged
   */
  UNCHANGED = 'unchanged',
}

/**
 * Change in a capability
 */
export interface CapabilityChange {
  /**
   * The type of change
   */
  type: ChangeType;

  /**
   * The path to the changed element
   */
  path: string;

  /**
   * The original value (undefined for added elements)
   */
  originalValue?: any;

  /**
   * The new value (undefined for removed elements)
   */
  newValue?: any;

  /**
   * The source of the change (e.g., blueprint ID)
   */
  source?: string;

  /**
   * The importance of the change (0-1)
   */
  importance?: number;
}

/**
 * Result of a blueprint diff
 */
export interface DiffResult {
  /**
   * The original blueprint ID
   */
  originalId: string;

  /**
   * The recomposed blueprint ID
   */
  recomposedId: string;

  /**
   * Changes to the intent
   */
  intentChanges: CapabilityChange[];

  /**
   * Changes to the dominant sequence
   */
  dominantSequenceChanges: CapabilityChange[];

  /**
   * Changes to capabilities, grouped by capability name
   */
  capabilityChanges: Record<string, CapabilityChange[]>;

  /**
   * Changes to suggested agents
   */
  suggestedAgentChanges: CapabilityChange[];

  /**
   * Changes to refinement annotations
   */
  refinementAnnotationChanges: CapabilityChange[];

  /**
   * Overall similarity score (0-1)
   */
  similarityScore: number;

  /**
   * Timestamp of the diff
   */
  timestamp: string;
}
