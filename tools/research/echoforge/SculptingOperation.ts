/**
 * Defines the available memory sculpting operations.
 * Each operation represents a different way to modify or transform memory entries.
 */
export type SculptingOperation =
  | 'relabel' // Change tags or metadata of memories
  | 'merge' // Combine multiple related memories into a consolidated one
  | 'prune' // Remove redundant or low-value memories
  | 'relink' // Create new associations between memories
  | 'extract' // Pull out specific information from memories
  | 'preserve'; // Mark memories as important to prevent automatic pruning

/**
 * Metadata about a sculpting operation
 */
export interface SculptingOperationMetadata {
  /**
   * The type of operation
   */
  operation: SculptingOperation;

  /**
   * Human-readable description of what the operation does
   */
  description: string;

  /**
   * Potential impact level of the operation (1-10)
   */
  impactLevel: number;

  /**
   * Whether the operation can be reversed
   */
  reversible: boolean;
}

/**
 * Registry of available sculpting operations with their metadata
 */
export const SculptingOperationRegistry: Record<
  SculptingOperation,
  SculptingOperationMetadata
> = {
  relabel: {
    operation: 'relabel',
    description:
      'Changes tags or metadata of memories without altering core content',
    impactLevel: 3,
    reversible: true,
  },
  merge: {
    operation: 'merge',
    description: 'Combines multiple related memories into a consolidated one',
    impactLevel: 7,
    reversible: false,
  },
  prune: {
    operation: 'prune',
    description: 'Removes redundant or low-value memories',
    impactLevel: 8,
    reversible: false,
  },
  relink: {
    operation: 'relink',
    description: 'Creates new associations between memories',
    impactLevel: 5,
    reversible: true,
  },
  extract: {
    operation: 'extract',
    description:
      'Pulls out specific information from memories into a new memory',
    impactLevel: 4,
    reversible: true,
  },
  preserve: {
    operation: 'preserve',
    description: 'Marks memories as important to prevent automatic pruning',
    impactLevel: 2,
    reversible: true,
  },
};
