import { MemoryEntry } from '../packages/echocore/src/memory/MemoryContract';
import { SculptingOperation } from './SculptingOperation';
import { SculptorIntent } from './SculptorIntent';

/**
 * Represents the result of a memory sculpting operation.
 */
export interface SculptorResult {
  /**
   * Unique identifier for this sculpting result
   */
  id: string;

  /**
   * Timestamp when the sculpting was performed
   */
  timestamp: number;

  /**
   * The original sculpting intent
   */
  intent: SculptorIntent;

  /**
   * Whether the sculpting operation was successful
   */
  success: boolean;

  /**
   * Error message if the operation failed
   */
  error?: string;

  /**
   * IDs of memories that were affected by the operation
   */
  affectedMemoryIds: string[];

  /**
   * New memories that were created as a result of the operation
   */
  createdMemories?: MemoryEntry[];

  /**
   * Memories that were modified by the operation
   * Contains before and after states
   */
  modifiedMemories?: Array<{
    before: MemoryEntry;
    after: MemoryEntry;
  }>;

  /**
   * IDs of memories that were deleted by the operation
   */
  deletedMemoryIds?: string[];

  /**
   * Metadata about the impact of the operation
   */
  impactMetadata?: {
    /**
     * Estimated cognitive impact (1-10)
     */
    cognitiveImpact: number;

    /**
     * Whether the operation triggered any reflexive hooks
     */
    triggeredReflexiveHooks: boolean;

    /**
     * IDs of any reflexive hooks that were triggered
     */
    triggeredHookIds?: string[];
  };
}
