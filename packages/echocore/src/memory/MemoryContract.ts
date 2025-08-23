/**
 * Memory System Contracts
 *
 * Defines the core interfaces for the EchoForge memory system, including
 * memory entries, queries, and provider interfaces.
 */

/**
 * Represents a single memory entry in the system
 */
export interface MemoryEntry {
  /**
   * Unique identifier for the memory entry
   */
  id: string;

  /**
   * Type of memory
   */
  type: 'short-term' | 'long-term' | 'semantic' | 'procedural';

  /**
   * Timestamp when the memory was created (milliseconds since epoch)
   */
  timestamp: number;

  /**
   * The actual content of the memory
   */
  content: any;

  /**
   * Optional tags for categorizing and filtering memories
   */
  tags?: string[];

  /**
   * Memory scope (agent-specific, guild-shared, or global)
   */
  scope: 'agent' | 'guild' | 'global';

  /**
   * Agent ID if scope is 'agent'
   */
  agentId?: string;

  /**
   * Visibility of the memory
   */
  visibility: 'private' | 'public' | 'protected';

  /**
   * Optional expiration time (milliseconds since epoch)
   * Used primarily for short-term memories
   */
  expiresAt?: number;

  /**
   * Optional vector embedding for semantic memory
   * Used for similarity search and semantic retrieval
   */
  embedding?: number[];

  /**
   * Optional metadata about the embedding
   */
  embeddingMetadata?: {
    /**
     * Model used to generate the embedding
     */
    model?: string;

    /**
     * Dimensions of the embedding vector
     */
    dimensions?: number;

    /**
     * Additional provider-specific metadata
     */
    [key: string]: any;
  };
}

/**
 * Query parameters for retrieving memories
 */
export interface MemoryQuery {
  /**
   * Filter by memory type
   */
  type?: string;

  /**
   * Filter by tags (matches if any tag matches)
   */
  tags?: string[];

  /**
   * Filter by time range
   */
  timeRange?: { from: number; to: number };

  /**
   * For semantic search - find memories similar to this text
   */
  similarityTo?: string;

  /**
   * For semantic search - find memories similar to this vector embedding
   */
  similarityToVector?: number[];

  /**
   * For semantic search - minimum similarity threshold (0-1)
   */
  similarityThreshold?: number;

  /**
   * Maximum number of results to return
   */
  maxResults?: number;

  /**
   * Filter by scope
   */
  scope?: 'agent' | 'guild' | 'global';

  /**
   * Filter by agent ID
   */
  agentId?: string;

  /**
   * Filter by visibility
   */
  visibility?: 'private' | 'public' | 'protected';

  /**
   * Whether to include the embedding vectors in the results
   * @default false
   */
  includeEmbeddings?: boolean;
}

/**
 * Interface for memory providers
 */
export interface MemoryProvider {
  /**
   * Store a memory entry
   */
  store(entry: MemoryEntry): Promise<void>;

  /**
   * Query for memory entries
   */
  query(query: MemoryQuery): Promise<MemoryEntry[]>;

  /**
   * Delete a memory entry by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Optional method to consolidate memories
   * (e.g., move short-term to long-term)
   */
  consolidate?(): Promise<void>;

  /**
   * Check if this provider supports a specific memory type
   */
  supportsType?(type: string): boolean;

  /**
   * Optional method to perform semantic search
   * If not implemented, the MemoryManager will use the standard query method
   */
  semanticSearch?(
    query: MemoryQuery
  ): Promise<Array<MemoryEntry & { similarity?: number }>>;
}

/**
 * Result of a semantic search, including similarity score
 */
export interface SemanticSearchResult {
  /**
   * The memory entry
   */
  entry: MemoryEntry;

  /**
   * Similarity score (0-1)
   */
  similarity: number;
}
