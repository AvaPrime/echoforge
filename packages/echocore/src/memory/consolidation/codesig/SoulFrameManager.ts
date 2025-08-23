/**
 * SoulFrame Manager
 *
 * Responsible for managing SoulFrame entities and orchestrating memory consolidation
 * based on SoulFrame growth lifecycle.
 */

import { MemoryProvider, MemoryQuery } from '../../MemoryContract';
import { MemoryConsolidator } from '../MemoryConsolidator';
import {
  CODESIGConsolidationOptions,
  CODESIGConsolidationResult,
} from './CODESIGTypes';
import { Codalogue } from '../../../../codalism/src/models/Codalogue';
import { Soulframe } from '../../../../codalism/src/models/Soulframe';
import {
  GrowthHook,
  GrowthPattern,
  EmotionalResonance,
} from '../../../../codalism/src/models/SoulframeTypes';

/**
 * Interface for SoulFrame metadata used in consolidation
 */
export interface SoulFrameMetadata {
  id: string;
  name: string;
  purpose: string;
  emotionalResonance: EmotionalResonance[];
  growthPatterns: GrowthPattern[];
  lastConsolidation?: Date;
}

/**
 * SoulFrame Manager class
 *
 * Manages SoulFrame entities and orchestrates memory consolidation
 * based on SoulFrame growth lifecycle.
 */
export class SoulFrameManager {
  private registeredSoulFrames: Map<string, SoulFrameMetadata> = new Map();
  private soulframeInstances: Map<string, Soulframe> = new Map();

  /**
   * Creates a new SoulFrameManager instance
   *
   * @param memoryProvider The memory provider to use for storing and retrieving memories
   * @param memoryConsolidator The memory consolidator to use for consolidation operations
   * @param codalogue The codalogue instance for recording consolidation events
   */
  constructor(
    private memoryProvider: MemoryProvider,
    private memoryConsolidator: MemoryConsolidator,
    private codalogue: Codalogue
  ) {}

  /**
   * Registers a SoulFrame with the manager
   *
   * @param soulframe The SoulFrame instance to register
   * @returns Promise that resolves when registration is complete
   */
  async registerSoulFrame(soulframe: Soulframe): Promise<void> {
    // Extract metadata from the SoulFrame
    const metadata: SoulFrameMetadata = {
      id: soulframe.identity.id,
      name: soulframe.identity.name,
      purpose: soulframe.identity.purpose,
      emotionalResonance: soulframe.essence.emotionalResonance,
      growthPatterns: soulframe.growth.hooks.map((hook) => hook.pattern),
      lastConsolidation: new Date(),
    };

    // Register the SoulFrame
    this.registeredSoulFrames.set(soulframe.identity.id, metadata);
    this.soulframeInstances.set(soulframe.identity.id, soulframe);

    // Add a consolidation growth hook if it doesn't exist
    this.ensureConsolidationGrowthHook(soulframe);

    // Record registration in Codalogue
    await this.codalogue.addEntry({
      type: 'system',
      content: `Registered SoulFrame ${soulframe.identity.name} (${soulframe.identity.id}) with CODESIG`,
      metadata: {
        soulFrameId: soulframe.identity.id,
        eventType: 'registration',
      },
    });
  }

  /**
   * Ensures that the SoulFrame has a growth hook for memory consolidation
   *
   * @param soulframe The SoulFrame to add the hook to
   */
  private ensureConsolidationGrowthHook(soulframe: Soulframe): void {
    // Check if a consolidation hook already exists
    const hasConsolidationHook = soulframe.growth.hooks.some((hook) =>
      hook.trigger.includes('consolidation')
    );

    if (!hasConsolidationHook) {
      // Create a new growth hook for memory consolidation
      const consolidationHook: GrowthHook = {
        id: `consolidation-${soulframe.identity.id}`,
        trigger: 'time-based-consolidation',
        action: 'consolidate-memories',
        pattern: GrowthPattern.CYCLICAL,
        activationCount: 0,
      };

      // Add the hook to the SoulFrame
      soulframe.growth.hooks.push(consolidationHook);
    }
  }

  /**
   * Triggers consolidation for a specific SoulFrame
   *
   * @param soulFrameId ID of the SoulFrame to consolidate memories for
   * @param timeRange Optional time range for consolidation
   * @param options CODESIG-specific consolidation options
   * @returns Results of the consolidation process
   */
  async triggerConsolidation(
    soulFrameId: string,
    timeRange?: { from: string | Date; to: string | Date },
    options?: CODESIGConsolidationOptions
  ): Promise<CODESIGConsolidationResult[]> {
    // Verify the SoulFrame is registered
    if (!this.registeredSoulFrames.has(soulFrameId)) {
      throw new Error(
        `SoulFrame ${soulFrameId} is not registered with CODESIG`
      );
    }

    const soulframe = this.soulframeInstances.get(soulFrameId);
    const metadata = this.registeredSoulFrames.get(soulFrameId);

    // Create a query to select memories for this SoulFrame
    const query: MemoryQuery = {
      agentId: soulFrameId,
      timeRange: timeRange
        ? {
            start: new Date(timeRange.from),
            end: new Date(timeRange.to),
          }
        : undefined,
    };

    // Prepare consolidation options with emotional weighting
    const consolidationOptions: CODESIGConsolidationOptions = {
      ...options,
      soulFrameId,
      emotionalWeights: metadata.emotionalResonance.map((emotion) => ({
        emotion,
        weight: 0.8, // Default high weight for the SoulFrame's emotional resonance
      })),
      intentMetadata: {
        primaryIntent: metadata.purpose,
        purposeAlignment: 1.0,
      },
      recordInCodalogue: options?.recordInCodalogue ?? true,
      triggerGrowthHooks: options?.triggerGrowthHooks ?? true,
    };

    // Run the consolidation
    const results = await this.memoryConsolidator.runConsolidation(
      query,
      consolidationOptions
    );

    // Update the last consolidation timestamp
    metadata.lastConsolidation = new Date();
    this.registeredSoulFrames.set(soulFrameId, metadata);

    // Record the consolidation event in the Codalogue
    if (consolidationOptions.recordInCodalogue) {
      await this.recordConsolidationInCodalogue(soulFrameId, results);
    }

    // Trigger growth hooks if enabled
    if (consolidationOptions.triggerGrowthHooks && soulframe) {
      await this.triggerGrowthHooksForConsolidation(soulframe, results);
    }

    return results as CODESIGConsolidationResult[];
  }

  /**
   * Records a consolidation event in the Codalogue
   *
   * @param soulFrameId ID of the SoulFrame
   * @param results Results of the consolidation
   */
  private async recordConsolidationInCodalogue(
    soulFrameId: string,
    results: any[]
  ): Promise<void> {
    const metadata = this.registeredSoulFrames.get(soulFrameId);

    // Create a Codalogue entry for the consolidation
    const entryId = await this.codalogue.addEntry({
      type: 'reflection',
      content: `Memory consolidation for SoulFrame ${metadata.name} (${soulFrameId})`,
      metadata: {
        soulFrameId,
        eventType: 'consolidation',
        clusterCount: results.length,
        timestamp: new Date().toISOString(),
      },
    });

    // Add the Codalogue entry ID to the results
    results.forEach((result) => {
      (result as CODESIGConsolidationResult).codalogueEntryId = entryId;
    });
  }

  /**
   * Triggers growth hooks in response to memory consolidation
   *
   * @param soulframe The SoulFrame instance
   * @param results Results of the consolidation
   */
  private async triggerGrowthHooksForConsolidation(
    soulframe: Soulframe,
    results: any[]
  ): Promise<void> {
    // Find consolidation-related growth hooks
    const consolidationHooks = soulframe.growth.hooks.filter((hook) =>
      hook.trigger.includes('consolidation')
    );

    // Trigger each hook
    const triggeredHookIds: string[] = [];

    for (const hook of consolidationHooks) {
      // Update the hook's activation information
      hook.lastActivated = new Date();
      hook.activationCount += 1;

      // Add the hook ID to the triggered list
      triggeredHookIds.push(hook.id);
    }

    // Add the triggered hook IDs to the results
    results.forEach((result) => {
      (result as CODESIGConsolidationResult).triggeredGrowthHookIds =
        triggeredHookIds;
    });
  }

  /**
   * Gets all registered SoulFrames
   *
   * @returns Array of registered SoulFrame metadata
   */
  getRegisteredSoulFrames(): SoulFrameMetadata[] {
    return Array.from(this.registeredSoulFrames.values());
  }

  /**
   * Gets a specific SoulFrame by ID
   *
   * @param soulFrameId ID of the SoulFrame to retrieve
   * @returns The SoulFrame metadata or undefined if not found
   */
  getSoulFrame(soulFrameId: string): SoulFrameMetadata | undefined {
    return this.registeredSoulFrames.get(soulFrameId);
  }
}
