/**
 * Memory Manager
 *
 * Central controller for managing multiple memory backends and routing
 * queries to the appropriate providers.
 *
 * Includes support for reflexive memory hooks that allow agents to observe
 * and respond to memory operations.
 */

import { v4 as uuidv4 } from 'uuid';
import { MemoryEntry, MemoryProvider, MemoryQuery } from './MemoryContract';
import {
  ReflexiveMemoryManager,
  ReflexiveHook,
  ReflexiveHookOptions,
  MemoryEventType,
} from './reflexive';

/**
 * Options for the MemoryManager
 */
export interface MemoryManagerOptions {
  /**
   * Memory providers to use
   */
  providers: MemoryProvider[];

  /**
   * Default agent ID to use when storing memories with agent scope
   */
  defaultAgentId?: string;

  /**
   * Whether to enable reflexive memory hooks
   * @default true
   */
  enableReflexiveHooks?: boolean;
}

/**
 * Central manager for memory operations across multiple providers
 */
export class MemoryManager {
  private providers: MemoryProvider[];
  private defaultAgentId?: string;
  private reflexiveManager?: ReflexiveMemoryManager;

  /**
   * Create a new memory manager
   */
  constructor(options: MemoryManagerOptions) {
    this.providers = options.providers;
    this.defaultAgentId = options.defaultAgentId;

    // Initialize reflexive memory manager if enabled
    if (options.enableReflexiveHooks !== false) {
      this.reflexiveManager = new ReflexiveMemoryManager();
    }
  }

  /**
   * Store a memory entry
   * @param entry The memory entry to store
   */
  async store(entry: Partial<MemoryEntry>): Promise<string> {
    // Generate ID if not provided
    if (!entry.id) {
      entry.id = uuidv4();
    }

    // Set timestamp if not provided
    if (!entry.timestamp) {
      entry.timestamp = Date.now();
    }

    // Set default scope if not provided
    if (!entry.scope) {
      entry.scope = 'agent';
    }

    // Set default visibility if not provided
    if (!entry.visibility) {
      entry.visibility = 'private';
    }

    // Set default agent ID if scope is 'agent' and no agent ID is provided
    if (entry.scope === 'agent' && !entry.agentId && this.defaultAgentId) {
      entry.agentId = this.defaultAgentId;
    }

    // Find the appropriate provider for this memory type
    const provider = this.resolveProvider(entry.type as string);
    if (!provider) {
      throw new Error(`No provider found for memory type: ${entry.type}`);
    }

    // Store the memory
    await provider.store(entry as MemoryEntry);

    // Trigger reflexive hook if enabled
    if (this.reflexiveManager) {
      await this.reflexiveManager.triggerEvent({
        eventType: 'onStore',
        timestamp: Date.now(),
        agentId: entry.agentId,
        entry: entry as MemoryEntry,
      });
    }

    return entry.id;
  }

  /**
   * Query for memory entries across all providers or specific ones
   * @param query The query parameters
   * @param providerTypes Optional array of memory types to query (e.g., ['short-term', 'long-term'])
   */
  async query(
    query: MemoryQuery,
    providerTypes?: string[]
  ): Promise<MemoryEntry[]> {
    // Check if this is a semantic search query
    const isSemanticSearch = query.similarityTo || query.similarityToVector;

    // For semantic search, prioritize providers with semanticSearch method
    if (isSemanticSearch) {
      return this.semanticSearch(query, providerTypes);
    }

    // Determine which providers to query
    let providersToQuery = this.providers;
    if (providerTypes && providerTypes.length > 0) {
      providersToQuery = this.providers.filter((p) =>
        providerTypes.some((type) => p.supportsType?.(type))
      );
    } else if (query.type) {
      // If query specifies a type, only query providers that support it
      providersToQuery = this.providers.filter((p) =>
        p.supportsType?.(query.type as string)
      );
    }

    // If no providers match, return empty array
    if (providersToQuery.length === 0) {
      return [];
    }

    // Query all matching providers
    const resultsArrays = await Promise.all(
      providersToQuery.map((provider) => provider.query(query))
    );

    // Flatten and sort results
    let results = resultsArrays.flat();

    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp - a.timestamp);

    // Apply maxResults limit if specified
    if (query.maxResults && query.maxResults > 0) {
      results = results.slice(0, query.maxResults);
    }

    // Trigger reflexive hook if enabled
    if (this.reflexiveManager) {
      await this.reflexiveManager.triggerEvent({
        eventType: 'onQuery',
        timestamp: Date.now(),
        agentId: query.agentId,
        query,
        results,
      });
    }

    return results;
  }

  /**
   * Perform semantic search across providers
   * @param query The query parameters
   * @param providerTypes Optional array of memory types to query
   */
  async semanticSearch(
    query: MemoryQuery,
    providerTypes?: string[]
  ): Promise<MemoryEntry[]> {
    // Determine which providers to query
    let providersToQuery = this.providers;

    // First, prioritize providers with semanticSearch method
    const semanticProviders = this.providers.filter(
      (p) => typeof p.semanticSearch === 'function'
    );

    if (semanticProviders.length > 0) {
      // If we have semantic providers, use them
      providersToQuery = semanticProviders;
    } else if (providerTypes && providerTypes.length > 0) {
      // Otherwise filter by provider types
      providersToQuery = this.providers.filter((p) =>
        providerTypes.some((type) => p.supportsType?.(type))
      );
    } else if (query.type) {
      // If query specifies a type, only query providers that support it
      providersToQuery = this.providers.filter((p) =>
        p.supportsType?.(query.type as string)
      );
    }

    // If no providers match, return empty array
    if (providersToQuery.length === 0) {
      return [];
    }

    // Collect results from all providers
    let resultsWithScores: Array<MemoryEntry & { similarity?: number }> = [];

    // Query each provider
    for (const provider of providersToQuery) {
      if (provider.semanticSearch) {
        // Use specialized semantic search if available
        const providerResults = await provider.semanticSearch(query);
        resultsWithScores.push(...providerResults);
      } else {
        // Fall back to regular query
        const providerResults = await provider.query(query);
        resultsWithScores.push(...providerResults);
      }
    }

    // Sort results by similarity score if available, otherwise by timestamp
    if (resultsWithScores.some((r) => r.similarity !== undefined)) {
      resultsWithScores.sort((a, b) => {
        // If both have similarity scores, sort by score (highest first)
        if (a.similarity !== undefined && b.similarity !== undefined) {
          return b.similarity - a.similarity;
        }
        // If only one has a similarity score, prioritize it
        if (a.similarity !== undefined) return -1;
        if (b.similarity !== undefined) return 1;
        // Otherwise sort by timestamp
        return b.timestamp - a.timestamp;
      });
    } else {
      // Sort by timestamp if no similarity scores
      resultsWithScores.sort((a, b) => b.timestamp - a.timestamp);
    }

    // Apply maxResults limit if specified
    if (query.maxResults && query.maxResults > 0) {
      resultsWithScores = resultsWithScores.slice(0, query.maxResults);
    }

    // Trigger reflexive hook if enabled
    if (this.reflexiveManager) {
      await this.reflexiveManager.triggerEvent({
        eventType: 'onQuery',
        timestamp: Date.now(),
        agentId: query.agentId,
        query,
        results: resultsWithScores,
      });
    }

    return resultsWithScores;
  }

  /**
   * Delete a memory entry by ID
   * @param id The ID of the memory to delete
   */
  async delete(id: string): Promise<void> {
    // Try to delete from all providers
    // This is inefficient but ensures the memory is deleted
    // regardless of which provider it's stored in
    await Promise.all(this.providers.map((provider) => provider.delete(id)));

    // Trigger reflexive hook if enabled
    if (this.reflexiveManager) {
      await this.reflexiveManager.triggerEvent({
        eventType: 'onDelete',
        timestamp: Date.now(),
        entryId: id,
      });
    }
  }

  /**
   * Consolidate memories across providers
   * This might move short-term memories to long-term storage
   * or perform other maintenance tasks
   */
  async consolidate(): Promise<void> {
    await Promise.all(
      this.providers
        .filter((provider) => typeof provider.consolidate === 'function')
        .map((provider) => provider.consolidate!())
    );

    // Trigger reflexive hook if enabled
    if (this.reflexiveManager) {
      await this.reflexiveManager.triggerEvent({
        eventType: 'onConsolidate',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Find the appropriate provider for a memory type
   * @param type The memory type
   */
  private resolveProvider(type: string): MemoryProvider | undefined {
    return this.providers.find((provider) => provider.supportsType?.(type));
  }

  /**
   * Register a reflexive hook for memory events
   * @param options Hook options including events to listen for
   * @param hook The hook function to call when events occur
   */
  registerHook(options: ReflexiveHookOptions, hook: ReflexiveHook): void {
    if (!this.reflexiveManager) {
      throw new Error('Reflexive hooks are not enabled for this MemoryManager');
    }

    this.reflexiveManager.registerHook(options, hook);
  }

  /**
   * Unregister a reflexive hook by ID
   * @param id The ID of the hook to remove
   * @returns True if a hook was removed, false otherwise
   */
  unregisterHook(id: string): boolean {
    if (!this.reflexiveManager) {
      return false;
    }

    return this.reflexiveManager.unregisterHook(id);
  }

  /**
   * Get the reflexive memory manager
   * @returns The reflexive memory manager, or undefined if not enabled
   */
  getReflexiveManager(): ReflexiveMemoryManager | undefined {
    return this.reflexiveManager;
  }
}
