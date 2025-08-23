/**
 * CODESIG Types
 *
 * Type definitions for the CODESIG (Codalism Design, Evolution, and Synthesis Intelligence Gateway)
 * integration between Memory Consolidation and SoulFrame/Codalogue components.
 */

import { MemoryEntry, MemoryQuery } from '../../MemoryContract';
import {
  MemoryCluster,
  ConsolidationOptions,
  ConsolidationResult,
} from '../MemoryConsolidationContract';

/**
 * Emotional weighting for memory consolidation
 */
export interface EmotionalWeight {
  /** The emotion type */
  emotion: string;

  /** The weight of this emotion (0-1) */
  weight: number;
}

/**
 * Intent metadata for memory consolidation
 */
export interface IntentMetadata {
  /** The primary intent behind this consolidation */
  primaryIntent: string;

  /** Secondary intents that may be relevant */
  secondaryIntents?: string[];

  /** Alignment score with system purpose (0-1) */
  purposeAlignment?: number;
}

/**
 * Extended consolidation options for CODESIG
 */
export interface CODESIGConsolidationOptions extends ConsolidationOptions {
  /** Emotional weighting to apply during consolidation */
  emotionalWeights?: EmotionalWeight[];

  /** Intent metadata to guide consolidation */
  intentMetadata?: IntentMetadata;

  /** SoulFrame ID to associate with this consolidation */
  soulFrameId?: string;

  /** Whether to record consolidation events in the Codalogue */
  recordInCodalogue?: boolean;

  /** Whether to trigger SoulFrame growth hooks after consolidation */
  triggerGrowthHooks?: boolean;
}

/**
 * Extended consolidation result for CODESIG
 */
export interface CODESIGConsolidationResult extends ConsolidationResult {
  /** Emotional resonance score of the consolidation */
  emotionalResonance?: number;

  /** Intent alignment score of the consolidation */
  intentAlignment?: number;

  /** ID of the Codalogue entry created for this consolidation */
  codalogueEntryId?: string;

  /** IDs of any growth hooks triggered by this consolidation */
  triggeredGrowthHookIds?: string[];
}

/**
 * Interface for the CODESIG consolidation manager
 */
export interface CODESIGConsolidationManager {
  /**
   * Runs the CODESIG-enhanced consolidation process on the specified memories.
   *
   * @param query Query to select memories for consolidation
   * @param options CODESIG-specific consolidation options
   * @returns Results of the consolidation process
   */
  consolidate(
    query: MemoryQuery,
    options?: CODESIGConsolidationOptions
  ): Promise<CODESIGConsolidationResult[]>;

  /**
   * Performs meta-consolidation across multiple SoulFrames.
   *
   * @param soulFrameIds IDs of SoulFrames to include in meta-consolidation
   * @param options CODESIG-specific consolidation options
   * @returns Results of the meta-consolidation process
   */
  metaConsolidate(
    soulFrameIds: string[],
    options?: CODESIGConsolidationOptions
  ): Promise<CODESIGConsolidationResult[]>;

  /**
   * Registers a SoulFrame with the CODESIG system.
   *
   * @param soulFrameId ID of the SoulFrame to register
   * @param metadata Additional metadata about the SoulFrame
   */
  registerSoulFrame(
    soulFrameId: string,
    metadata?: Record<string, any>
  ): Promise<void>;

  /**
   * Triggers consolidation for a specific SoulFrame.
   *
   * @param soulFrameId ID of the SoulFrame to consolidate memories for
   * @param timeRange Optional time range for consolidation
   * @param options CODESIG-specific consolidation options
   * @returns Results of the consolidation process
   */
  triggerSoulFrameConsolidation(
    soulFrameId: string,
    timeRange?: { from: Date | number; to: Date | number },
    options?: CODESIGConsolidationOptions
  ): Promise<CODESIGConsolidationResult[]>;
}
