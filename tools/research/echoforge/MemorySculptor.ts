import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  MemoryEntry,
  MemoryQuery,
} from '../packages/echocore/src/memory/MemoryContract';
import { ReflexiveMemoryManager } from '../packages/echocore/src/memory/reflexive/ReflexiveMemoryManager';
import {
  SculptingOperation,
  SculptingOperationRegistry,
} from './SculptingOperation';
import { SculptorIntent } from './SculptorIntent';
import { SculptorResult } from './SculptorResult';
import { SculptorHook, SculptorHookOptions } from './SculptorHookContract';

/**
 * Configuration options for the Memory Sculptor
 */
export interface MemorySculptorConfig {
  /**
   * Whether to enable automatic triggering of SoulWeaver recalibration
   * when significant memory changes occur
   */
  enableSoulWeaverTriggers?: boolean;

  /**
   * Whether to record sculpting operations in the Codalogue
   */
  recordInCodalogue?: boolean;

  /**
   * Maximum number of memories that can be affected in a single operation
   */
  maxMemoriesPerOperation?: number;

  /**
   * Whether to validate memory existence before performing operations
   */
  validateMemoryExistence?: boolean;
}

/**
 * The Memory Sculptor API provides capabilities for introspecting and
 * reshaping an agent's cognitive landscape through targeted memory operations.
 */
export class MemorySculptor extends EventEmitter {
  private hooks: Map<
    string,
    { options: SculptorHookOptions; hook: SculptorHook }
  > = new Map();
  private operationHistory: SculptorResult[] = [];

  /**
   * Creates a new Memory Sculptor instance
   *
   * @param memoryManager The memory manager to use for accessing memories
   * @param reflexiveManager Optional reflexive memory manager for triggering events
   * @param config Configuration options
   */
  constructor(
    private memoryManager: any, // Replace with actual MemoryManager type
    private reflexiveManager?: ReflexiveMemoryManager,
    private config: MemorySculptorConfig = {}
  ) {
    super();

    // Set default configuration
    this.config = {
      enableSoulWeaverTriggers: true,
      recordInCodalogue: true,
      maxMemoriesPerOperation: 50,
      validateMemoryExistence: true,
      ...config,
    };
  }

  /**
   * Registers a hook for sculptor operations
   *
   * @param options Hook options
   * @param hook The hook implementation
   */
  registerHook(options: SculptorHookOptions, hook: SculptorHook): void {
    this.hooks.set(options.id, { options, hook });
  }

  /**
   * Unregisters a hook by ID
   *
   * @param id The hook ID
   * @returns Whether the hook was successfully unregistered
   */
  unregisterHook(id: string): boolean {
    return this.hooks.delete(id);
  }

  /**
   * Performs a memory sculpting operation
   *
   * @param intent The sculpting intent
   * @returns The result of the sculpting operation
   */
  async sculptMemory(intent: SculptorIntent): Promise<SculptorResult> {
    // Validate the intent
    this.validateIntent(intent);

    // Create a base result object
    const result: SculptorResult = {
      id: uuidv4(),
      timestamp: Date.now(),
      intent,
      success: false,
      affectedMemoryIds: [...intent.targetMemoryIds],
    };

    try {
      // Run pre-sculpt hooks
      const shouldProceed = await this.runPreSculptHooks(intent);
      if (!shouldProceed) {
        result.error = 'Operation prevented by pre-sculpt hook';
        return result;
      }

      // Perform the operation
      switch (intent.operation) {
        case 'relabel':
          await this.performRelabelOperation(intent, result);
          break;
        case 'merge':
          await this.performMergeOperation(intent, result);
          break;
        case 'prune':
          await this.performPruneOperation(intent, result);
          break;
        case 'relink':
          await this.performRelinkOperation(intent, result);
          break;
        case 'extract':
          await this.performExtractOperation(intent, result);
          break;
        case 'preserve':
          await this.performPreserveOperation(intent, result);
          break;
        default:
          throw new Error(`Unsupported operation: ${intent.operation}`);
      }

      // Mark as successful
      result.success = true;

      // Run post-sculpt hooks
      await this.runPostSculptHooks(result);

      // Trigger SoulWeaver recalibration if enabled and significant changes occurred
      if (
        this.config.enableSoulWeaverTriggers &&
        this.shouldTriggerSoulWeaver(result)
      ) {
        await this.triggerSoulWeaverRecalibration(result);
      }

      // Record in Codalogue if enabled
      if (this.config.recordInCodalogue) {
        await this.recordInCodalogue(result);
      }

      // Add to operation history
      this.operationHistory.push(result);

      // Emit event
      this.emit('sculptingCompleted', result);

      return result;
    } catch (error) {
      result.error = error.message;
      this.emit('sculptingError', result, error);
      return result;
    }
  }

  /**
   * Validates a sculpting intent
   *
   * @param intent The intent to validate
   * @throws Error if the intent is invalid
   */
  private validateIntent(intent: SculptorIntent): void {
    // Check required fields
    if (!intent.agentId) {
      throw new Error('Agent ID is required');
    }

    if (!intent.targetMemoryIds || intent.targetMemoryIds.length === 0) {
      throw new Error('At least one target memory ID is required');
    }

    if (!intent.operation) {
      throw new Error('Operation is required');
    }

    // Check if operation is supported
    if (!Object.keys(SculptingOperationRegistry).includes(intent.operation)) {
      throw new Error(`Unsupported operation: ${intent.operation}`);
    }

    // Check memory limit
    if (intent.targetMemoryIds.length > this.config.maxMemoriesPerOperation) {
      throw new Error(
        `Too many target memories. Maximum allowed: ${this.config.maxMemoriesPerOperation}`
      );
    }

    // Validate memory existence if enabled
    if (this.config.validateMemoryExistence) {
      // This would be implemented to check if all target memories exist
      // We'll skip the actual implementation for now
    }
  }

  /**
   * Runs all registered pre-sculpt hooks
   *
   * @param intent The sculpting intent
   * @returns Whether the operation should proceed
   */
  private async runPreSculptHooks(intent: SculptorIntent): Promise<boolean> {
    for (const [id, { options, hook }] of this.hooks.entries()) {
      // Skip if hook doesn't apply to this operation
      if (
        options.operations &&
        !options.operations.includes(intent.operation)
      ) {
        continue;
      }

      // Skip if hook doesn't apply to this agent
      if (options.agentIds && !options.agentIds.includes(intent.agentId)) {
        continue;
      }

      try {
        const shouldProceed = await Promise.resolve(hook.onPreSculpt(intent));
        if (!shouldProceed) {
          return false;
        }
      } catch (error) {
        console.error(`Error in pre-sculpt hook ${id}:`, error);
      }
    }

    return true;
  }

  /**
   * Runs all registered post-sculpt hooks
   *
   * @param result The sculpting result
   */
  private async runPostSculptHooks(result: SculptorResult): Promise<void> {
    const intent = result.intent;

    for (const [id, { options, hook }] of this.hooks.entries()) {
      // Skip if hook doesn't apply to this operation
      if (
        options.operations &&
        !options.operations.includes(intent.operation)
      ) {
        continue;
      }

      // Skip if hook doesn't apply to this agent
      if (options.agentIds && !options.agentIds.includes(intent.agentId)) {
        continue;
      }

      try {
        await Promise.resolve(hook.onPostSculpt(result));
      } catch (error) {
        console.error(`Error in post-sculpt hook ${id}:`, error);
      }
    }
  }

  /**
   * Determines if a SoulWeaver recalibration should be triggered
   *
   * @param result The sculpting result
   * @returns Whether to trigger a recalibration
   */
  private shouldTriggerSoulWeaver(result: SculptorResult): boolean {
    // Implement logic to determine if changes are significant enough
    // For now, we'll use a simple heuristic based on operation type and number of affected memories
    const operationMetadata =
      SculptingOperationRegistry[result.intent.operation];

    // High impact operations or operations affecting many memories should trigger recalibration
    return (
      operationMetadata.impactLevel >= 7 ||
      result.affectedMemoryIds.length >= 10
    );
  }

  /**
   * Triggers a SoulWeaver protocol recalibration
   *
   * @param result The sculpting result that triggered the recalibration
   */
  private async triggerSoulWeaverRecalibration(
    result: SculptorResult
  ): Promise<void> {
    // This would integrate with the SoulWeaver protocol
    // For now, we'll just emit an event
    this.emit('soulWeaverRecalibrationTriggered', {
      sculptorResultId: result.id,
      agentId: result.intent.agentId,
      timestamp: Date.now(),
      reason: `Significant memory changes from ${result.intent.operation} operation`,
    });
  }

  /**
   * Records a sculpting operation in the Codalogue
   *
   * @param result The sculpting result to record
   */
  private async recordInCodalogue(result: SculptorResult): Promise<void> {
    // This would integrate with the Codalogue system
    // For now, we'll just emit an event
    this.emit('codalogueEntryCreated', {
      sculptorResultId: result.id,
      agentId: result.intent.agentId,
      timestamp: Date.now(),
      operation: result.intent.operation,
      affectedMemoryCount: result.affectedMemoryIds.length,
    });
  }

  /**
   * Performs a relabel operation
   */
  private async performRelabelOperation(
    intent: SculptorIntent,
    result: SculptorResult
  ): Promise<void> {
    // Initialize the modified memories array
    result.modifiedMemories = [];

    // Validate required parameters
    if (!intent.parameters?.newTags && !intent.parameters?.newMetadata) {
      throw new Error(
        'Relabel operation requires newTags or newMetadata parameters'
      );
    }

    // Query for all target memories
    const targetMemories = await this.memoryManager.query({
      agentId: intent.agentId,
      // Use a custom query that filters by IDs
      customFilter: (memory: MemoryEntry) =>
        intent.targetMemoryIds.includes(memory.id),
    });

    // Check if all target memories were found
    if (targetMemories.length !== intent.targetMemoryIds.length) {
      const foundIds = targetMemories.map((memory) => memory.id);
      const missingIds = intent.targetMemoryIds.filter(
        (id) => !foundIds.includes(id)
      );
      throw new Error(
        `Some target memories were not found: ${missingIds.join(', ')}`
      );
    }

    // Process each memory
    for (const memory of targetMemories) {
      // Create a copy of the original memory for the 'before' state
      const beforeMemory = { ...memory };

      // Create a modified copy for the 'after' state, ensuring deep copy for metadata if needed
      const afterMemory = { ...memory };

      // Apply new tags if provided
      if (intent.parameters?.newTags) {
        // Replace tags if replaceTags is true, otherwise merge them
        if (intent.parameters.replaceTags) {
          afterMemory.tags = [...intent.parameters.newTags];
        } else {
          // Merge tags, ensuring no duplicates
          const existingTags = afterMemory.tags || [];
          const newTags = intent.parameters.newTags;
          afterMemory.tags = [...new Set([...existingTags, ...newTags])];
        }
      }

      // Apply new metadata if provided
      if (intent.parameters?.newMetadata) {
        afterMemory.metadata = {
          ...(afterMemory.metadata || {}),
          ...intent.parameters.newMetadata,
        };
      }

      // Store the updated memory
      await this.memoryManager.store(afterMemory);

      // Record the before/after states
      result.modifiedMemories.push({
        before: beforeMemory,
        after: afterMemory,
      });
    }

    // Set impact metadata
    result.impactMetadata = {
      cognitiveImpact: 3, // Moderate impact for relabeling
      triggeredReflexiveHooks: false, // Will be updated by post-hooks if needed
    };
  }

  /**
   * Performs a merge operation
   */
  private async performMergeOperation(
    intent: SculptorIntent,
    result: SculptorResult
  ): Promise<void> {
    // Initialize result arrays
    result.createdMemories = [];
    result.deletedMemoryIds = [];

    // Query for all target memories
    const targetMemories = await this.memoryManager.query({
      agentId: intent.agentId,
      customFilter: (memory: MemoryEntry) =>
        intent.targetMemoryIds.includes(memory.id),
    });

    // Check if all target memories were found
    if (targetMemories.length !== intent.targetMemoryIds.length) {
      const foundIds = targetMemories.map((memory) => memory.id);
      const missingIds = intent.targetMemoryIds.filter(
        (id) => !foundIds.includes(id)
      );
      throw new Error(
        `Some target memories were not found: ${missingIds.join(', ')}`
      );
    }

    // Check if we have at least two memories to merge
    if (targetMemories.length < 2) {
      throw new Error('Merge operation requires at least two memories');
    }

    // Sort memories by timestamp (oldest first)
    targetMemories.sort((a, b) => a.timestamp - b.timestamp);

    // Create a new consolidated memory
    const mergedMemory: MemoryEntry = {
      id: uuidv4(),
      type: 'consolidated', // Use a special type for consolidated memories
      timestamp: Date.now(),
      content: this.mergeMemoryContents(
        targetMemories,
        intent.parameters?.mergeStrategy
      ),
      tags: this.mergeMemoryTags(targetMemories),
      scope: targetMemories[0].scope, // Use the scope of the first memory
      agentId: intent.agentId,
      visibility: targetMemories[0].visibility, // Use the visibility of the first memory
      metadata: {
        mergedFrom: targetMemories.map((m) => m.id),
        mergeTimestamp: Date.now(),
        mergeReason: intent.reason || 'Manual merge operation',
        originalCount: targetMemories.length,
      },
    };

    // Add custom title if provided
    if (intent.parameters?.mergedTitle) {
      mergedMemory.title = intent.parameters.mergedTitle;
    }

    // Add operation tags if provided
    if (intent.tags && intent.tags.length > 0) {
      mergedMemory.tags = [...(mergedMemory.tags || []), ...intent.tags];
    }

    // Store the new consolidated memory
    await this.memoryManager.store(mergedMemory);

    // Add to created memories
    result.createdMemories.push(mergedMemory);

    // Delete original memories if specified
    if (intent.parameters?.deleteOriginals !== false) {
      for (const memory of targetMemories) {
        await this.memoryManager.delete(memory.id);
        result.deletedMemoryIds.push(memory.id);
      }
    }

    // Set impact metadata
    result.impactMetadata = {
      cognitiveImpact: 7, // High impact for merging
      triggeredReflexiveHooks: false, // Will be updated by post-hooks if needed
    };
  }

  /**
   * Performs a prune operation
   */
  private async performPruneOperation(
    intent: SculptorIntent,
    result: SculptorResult
  ): Promise<void> {
    // Initialize deletedMemoryIds array
    result.deletedMemoryIds = [];

    // Query for all target memories
    const targetMemories = await this.memoryManager.query({
      agentId: intent.agentId,
      customFilter: (memory: MemoryEntry) =>
        intent.targetMemoryIds.includes(memory.id),
    });

    // Check if memories were found
    if (targetMemories.length === 0) {
      throw new Error('No target memories found for pruning');
    }

    // Check for protected memories if protection check is enabled
    if (intent.parameters?.respectProtection !== false) {
      const protectedMemories = targetMemories.filter(
        (memory) =>
          memory.metadata?.protected ||
          (memory.tags && memory.tags.includes('protected'))
      );

      if (protectedMemories.length > 0) {
        const protectedIds = protectedMemories.map((m) => m.id);
        throw new Error(
          `Cannot prune protected memories: ${protectedIds.join(', ')}`
        );
      }
    }

    // Delete each memory
    for (const memory of targetMemories) {
      await this.memoryManager.delete(memory.id);
      result.deletedMemoryIds.push(memory.id);
    }

    // Set impact metadata
    result.impactMetadata = {
      cognitiveImpact: 8, // High impact for pruning
      triggeredReflexiveHooks: false, // Will be updated by post-hooks if needed
    };
  }

  /**
   * Performs a relink operation
   */
  private async performRelinkOperation(
    intent: SculptorIntent,
    result: SculptorResult
  ): Promise<void> {
    // Initialize modifiedMemories array
    result.modifiedMemories = [];

    // Validate required parameters
    if (
      !intent.parameters?.linkToMemoryIds ||
      intent.parameters.linkToMemoryIds.length === 0
    ) {
      throw new Error('Relink operation requires linkToMemoryIds parameter');
    }

    // Query for all target memories
    const targetMemories = await this.memoryManager.query({
      agentId: intent.agentId,
      customFilter: (memory: MemoryEntry) =>
        intent.targetMemoryIds.includes(memory.id),
    });

    // Query for all link target memories
    const linkTargetMemories = await this.memoryManager.query({
      agentId: intent.agentId,
      customFilter: (memory: MemoryEntry) =>
        intent.parameters.linkToMemoryIds.includes(memory.id),
    });

    // Check if all memories were found
    if (targetMemories.length !== intent.targetMemoryIds.length) {
      const foundIds = targetMemories.map((memory) => memory.id);
      const missingIds = intent.targetMemoryIds.filter(
        (id) => !foundIds.includes(id)
      );
      throw new Error(
        `Some target memories were not found: ${missingIds.join(', ')}`
      );
    }

    if (
      linkTargetMemories.length !== intent.parameters.linkToMemoryIds.length
    ) {
      const foundIds = linkTargetMemories.map((memory) => memory.id);
      const missingIds = intent.parameters.linkToMemoryIds.filter(
        (id) => !foundIds.includes(id)
      );
      throw new Error(
        `Some link target memories were not found: ${missingIds.join(', ')}`
      );
    }

    // Process each target memory
    for (const memory of targetMemories) {
      // Create a copy of the original memory for the 'before' state
      const beforeMemory = { ...memory };

      // Create a modified copy for the 'after' state
      const afterMemory = { ...memory };

      // Initialize or update the links metadata
      afterMemory.metadata = afterMemory.metadata || {};
      afterMemory.metadata.links = afterMemory.metadata.links || [];

      // Add new links
      const newLinks = intent.parameters.linkToMemoryIds.filter(
        (id) => !afterMemory.metadata.links.includes(id)
      );

      afterMemory.metadata.links = [...afterMemory.metadata.links, ...newLinks];

      // Add link metadata if provided
      if (intent.parameters?.linkMetadata) {
        afterMemory.metadata.linkMetadata =
          afterMemory.metadata.linkMetadata || {};

        for (const linkId of newLinks) {
          afterMemory.metadata.linkMetadata[linkId] = {
            createdAt: Date.now(),
            reason: intent.reason || 'Manual relink operation',
            ...intent.parameters.linkMetadata,
          };
        }
      }

      // Store the updated memory
      await this.memoryManager.store(afterMemory);

      // Record the before/after states
      result.modifiedMemories.push({
        before: beforeMemory,
        after: afterMemory,
      });
    }

    // Set impact metadata
    result.impactMetadata = {
      cognitiveImpact: 5, // Medium impact for relinking
      triggeredReflexiveHooks: false, // Will be updated by post-hooks if needed
    };
  }

  /**
   * Performs an extract operation
   */
  private async performExtractOperation(
    intent: SculptorIntent,
    result: SculptorResult
  ): Promise<void> {
    // Initialize createdMemories array
    result.createdMemories = [];

    // Validate required parameters
    if (!intent.parameters?.extractionPattern) {
      throw new Error('Extract operation requires extractionPattern parameter');
    }

    // Query for all target memories
    const targetMemories = await this.memoryManager.query({
      agentId: intent.agentId,
      customFilter: (memory: MemoryEntry) =>
        intent.targetMemoryIds.includes(memory.id),
    });

    // Check if all target memories were found
    if (targetMemories.length !== intent.targetMemoryIds.length) {
      const foundIds = targetMemories.map((memory) => memory.id);
      const missingIds = intent.targetMemoryIds.filter(
        (id) => !foundIds.includes(id)
      );
      throw new Error(
        `Some target memories were not found: ${missingIds.join(', ')}`
      );
    }

    // Extract content based on the extraction pattern
    // In a real implementation, this might use NLP or other techniques
    // For now, we'll use a simple approach
    const extractedContent = this.extractContentFromMemories(
      targetMemories,
      intent.parameters.extractionPattern
    );

    // Create a new memory with the extracted content
    const extractedMemory: MemoryEntry = {
      id: uuidv4(),
      type: 'extracted',
      timestamp: Date.now(),
      content: extractedContent,
      tags: intent.tags || ['extracted'],
      scope: targetMemories[0].scope,
      agentId: intent.agentId,
      visibility: targetMemories[0].visibility,
      metadata: {
        extractedFrom: targetMemories.map((m) => m.id),
        extractionPattern: intent.parameters.extractionPattern,
        extractionTimestamp: Date.now(),
        extractionReason: intent.reason || 'Manual extraction operation',
      },
    };

    // Store the new memory
    await this.memoryManager.store(extractedMemory);

    // Add to created memories
    result.createdMemories.push(extractedMemory);

    // Set impact metadata
    result.impactMetadata = {
      cognitiveImpact: 4, // Medium impact for extraction
      triggeredReflexiveHooks: false, // Will be updated by post-hooks if needed
    };
  }

  /**
   * Performs a preserve operation
   */
  private async performPreserveOperation(
    intent: SculptorIntent,
    result: SculptorResult
  ): Promise<void> {
    // Initialize modifiedMemories array
    result.modifiedMemories = [];

    // Query for all target memories
    const targetMemories = await this.memoryManager.query({
      agentId: intent.agentId,
      customFilter: (memory: MemoryEntry) =>
        intent.targetMemoryIds.includes(memory.id),
    });

    // Check if all target memories were found
    if (targetMemories.length !== intent.targetMemoryIds.length) {
      const foundIds = targetMemories.map((memory) => memory.id);
      const missingIds = intent.targetMemoryIds.filter(
        (id) => !foundIds.includes(id)
      );
      throw new Error(
        `Some target memories were not found: ${missingIds.join(', ')}`
      );
    }

    // Process each memory
    for (const memory of targetMemories) {
      // Create a copy of the original memory for the 'before' state
      const beforeMemory = { ...memory };

      // Create a modified copy for the 'after' state
      const afterMemory = { ...memory };

      // Mark as protected
      afterMemory.metadata = afterMemory.metadata || {};
      afterMemory.metadata.protected = true;

      // Add protection expiration if duration is specified
      if (intent.parameters?.preservationDuration) {
        afterMemory.metadata.protectionExpires =
          Date.now() + intent.parameters.preservationDuration;
      }

      // Add protection reason if provided
      if (intent.reason) {
        afterMemory.metadata.protectionReason = intent.reason;
      }

      // Add 'protected' tag if it doesn't exist
      if (!afterMemory.tags) {
        afterMemory.tags = ['protected'];
      } else if (!afterMemory.tags.includes('protected')) {
        afterMemory.tags.push('protected');
      }

      // Store the updated memory
      await this.memoryManager.store(afterMemory);

      // Record the before/after states
      result.modifiedMemories.push({
        before: beforeMemory,
        after: afterMemory,
      });
    }

    // Set impact metadata
    result.impactMetadata = {
      cognitiveImpact: 2, // Low impact for preservation
      triggeredReflexiveHooks: false, // Will be updated by post-hooks if needed
    };
  }

  /**
   * Helper method to merge memory contents
   */
  private mergeMemoryContents(memories: MemoryEntry[], strategy?: string): any {
    // Different strategies could be implemented here
    // For now, we'll use a simple approach based on content type

    // Check if all memories have string content
    const allStrings = memories.every((m) => typeof m.content === 'string');

    if (allStrings) {
      // For string contents, concatenate with separators
      return memories.map((m) => m.content).join('\n\n---\n\n');
    }

    // For object contents, create an array of all contents
    return {
      type: 'merged',
      parts: memories.map((m) => ({
        id: m.id,
        timestamp: m.timestamp,
        content: m.content,
      })),
    };
  }

  /**
   * Helper method to merge memory tags
   */
  private mergeMemoryTags(memories: MemoryEntry[]): string[] {
    // Collect all unique tags
    const tagSet = new Set<string>();

    for (const memory of memories) {
      if (memory.tags) {
        for (const tag of memory.tags) {
          tagSet.add(tag);
        }
      }
    }

    return Array.from(tagSet);
  }

  /**
   * Helper method to extract content from memories based on a pattern
   */
  private extractContentFromMemories(
    memories: MemoryEntry[],
    pattern: string
  ): any {
    // In a real implementation, this might use NLP or other techniques
    // For now, we'll use a simple approach for demonstration

    // For string contents, extract parts that match the pattern
    const extractedParts: string[] = [];

    for (const memory of memories) {
      if (typeof memory.content === 'string') {
        // Simple pattern matching - in a real implementation this would be more sophisticated
        if (memory.content.includes(pattern)) {
          // Extract the matching part and some context
          const index = memory.content.indexOf(pattern);
          const start = Math.max(0, index - 50);
          const end = Math.min(
            memory.content.length,
            index + pattern.length + 50
          );
          const extract = memory.content.substring(start, end);

          extractedParts.push(extract);
        }
      } else if (typeof memory.content === 'object') {
        // For object contents, we'd need a more sophisticated approach
        // For now, just include a reference to the source
        extractedParts.push(
          `Reference to structured content in memory ${memory.id}`
        );
      }
    }

    return {
      type: 'extraction',
      pattern,
      extracts: extractedParts,
      sourceCount: memories.length,
    };
  }

  /**
   * Gets the operation history
   *
   * @param limit Maximum number of results to return
   * @returns Recent sculpting operations
   */
  getOperationHistory(limit?: number): SculptorResult[] {
    if (limit) {
      return this.operationHistory.slice(-limit);
    }
    return [...this.operationHistory];
  }
}

/**
 * Creates and configures a Memory Sculptor instance
 *
 * @param memoryManager The memory manager to use
 * @param reflexiveManager Optional reflexive memory manager
 * @param config Configuration options
 * @returns Configured Memory Sculptor instance
 */
export function createMemorySculptor(
  memoryManager: any,
  reflexiveManager?: ReflexiveMemoryManager,
  config?: MemorySculptorConfig
): MemorySculptor {
  return new MemorySculptor(memoryManager, reflexiveManager, config);
}
