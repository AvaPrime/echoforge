/**
 * In-Memory Memory Provider
 *
 * Provides an ephemeral, in-memory implementation of the MemoryProvider interface
 * for short-term memory storage. Entries are stored in a Map and can have TTL.
 */

import { v4 as uuidv4 } from 'uuid';
import { MemoryEntry, MemoryProvider, MemoryQuery } from './MemoryContract';

/**
 * In-memory implementation of MemoryProvider
 * Primarily designed for short-term memory with optional TTL
 */
export class InMemoryProvider implements MemoryProvider {
  private memories: Map<string, MemoryEntry> = new Map();
  private expirationCheckInterval: NodeJS.Timeout | null = null;

  constructor(
    private options: {
      /**
       * Default TTL in milliseconds for memories (if not specified in the entry)
       */
      defaultTTL?: number;

      /**
       * How often to check for expired memories (in milliseconds)
       */
      cleanupInterval?: number;
    } = {}
  ) {
    // Set up periodic cleanup of expired memories
    if (options.cleanupInterval) {
      this.expirationCheckInterval = setInterval(
        () => this.removeExpiredMemories(),
        options.cleanupInterval
      );
    }
  }

  /**
   * Store a memory entry
   */
  async store(entry: MemoryEntry): Promise<void> {
    // Generate ID if not provided
    if (!entry.id) {
      entry.id = uuidv4();
    }

    // Set timestamp if not provided
    if (!entry.timestamp) {
      entry.timestamp = Date.now();
    }

    // Set expiration if not provided but we have a default TTL
    if (!entry.expiresAt && this.options.defaultTTL) {
      entry.expiresAt = Date.now() + this.options.defaultTTL;
    }

    this.memories.set(entry.id, entry);
  }

  /**
   * Query for memory entries
   */
  async query(query: MemoryQuery): Promise<MemoryEntry[]> {
    let results = Array.from(this.memories.values());

    // Filter by type
    if (query.type) {
      results = results.filter((entry) => entry.type === query.type);
    }

    // Filter by tags (if any tag matches)
    if (query.tags && query.tags.length > 0) {
      results = results.filter(
        (entry) =>
          entry.tags && entry.tags.some((tag) => query.tags!.includes(tag))
      );
    }

    // Filter by time range
    if (query.timeRange) {
      results = results.filter(
        (entry) =>
          entry.timestamp >= query.timeRange!.from &&
          entry.timestamp <= query.timeRange!.to
      );
    }

    // Filter by scope
    if (query.scope) {
      results = results.filter((entry) => entry.scope === query.scope);
    }

    // Filter by agent ID
    if (query.agentId) {
      results = results.filter((entry) => entry.agentId === query.agentId);
    }

    // Filter by visibility
    if (query.visibility) {
      results = results.filter(
        (entry) => entry.visibility === query.visibility
      );
    }

    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp - a.timestamp);

    // Limit results if maxResults is specified
    if (query.maxResults && query.maxResults > 0) {
      results = results.slice(0, query.maxResults);
    }

    return results;
  }

  /**
   * Delete a memory entry by ID
   */
  async delete(id: string): Promise<void> {
    this.memories.delete(id);
  }

  /**
   * Check if this provider supports a specific memory type
   */
  supportsType(type: string): boolean {
    // This provider is primarily for short-term memory
    return type === 'short-term';
  }

  /**
   * Remove expired memories
   */
  private removeExpiredMemories(): void {
    const now = Date.now();

    for (const [id, entry] of this.memories.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        this.memories.delete(id);
      }
    }
  }

  /**
   * Clean up resources when this provider is no longer needed
   */
  dispose(): void {
    if (this.expirationCheckInterval) {
      clearInterval(this.expirationCheckInterval);
      this.expirationCheckInterval = null;
    }
  }
}
