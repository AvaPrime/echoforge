import { SculptingOperation } from './SculptingOperation';

/**
 * Represents the intent to perform a memory sculpting operation.
 * This is the primary input structure for the Memory Sculptor API.
 */
export interface SculptorIntent {
  /**
   * ID of the agent whose memories will be sculpted
   */
  agentId: string;

  /**
   * IDs of the memory entries to be targeted by the operation
   */
  targetMemoryIds: string[];

  /**
   * The sculpting operation to perform
   */
  operation: SculptingOperation;

  /**
   * Optional reason for performing this sculpting operation
   * Used for traceability and reflection
   */
  reason?: string;

  /**
   * Optional tags to apply to the operation result or modified memories
   */
  tags?: string[];

  /**
   * Optional operation-specific parameters
   */
  parameters?: {
    /**
     * For relabel: new tags to apply
     */
    newTags?: string[];

    /**
     * For relabel: metadata to update
     */
    newMetadata?: Record<string, any>;

    /**
     * For merge: title of the new consolidated memory
     */
    mergedTitle?: string;

    /**
     * For extract: extraction pattern or query
     */
    extractionPattern?: string;

    /**
     * For relink: IDs of memories to link to
     */
    linkToMemoryIds?: string[];

    /**
     * For preserve: duration to preserve (in milliseconds)
     */
    preservationDuration?: number;

    /**
     * Any other operation-specific parameters
     */
    [key: string]: any;
  };
}
