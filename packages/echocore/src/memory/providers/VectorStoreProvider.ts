/**
 * Vector Store Provider
 *
 * Implements the MemoryProvider interface for semantic memory using vector embeddings.
 * This provider stores memory entries with vector embeddings for semantic search.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  MemoryEntry,
  MemoryProvider,
  MemoryQuery,
  SemanticSearchResult,
} from '../MemoryContract';
import { EmbeddingProvider } from '../embeddings/EmbeddingProvider';

/**
 * Options for the VectorStoreProvider
 */
export interface VectorStoreOptions {
  /**
   * Embedding provider to use for generating embeddings
   */
  embeddingProvider: EmbeddingProvider;

  /**
   * Maximum number of vectors to store in memory
   * @default 10000
   */
  maxVectors?: number;

  /**
   * Default similarity threshold for semantic search
   * @default 0.7
   */
  defaultSimilarityThreshold?: number;

  /**
   * Whether to persist vectors to disk
   * @default false
   */
  persistToDisk?: boolean;

  /**
   * Path to store vector data if persistToDisk is true
   */
  persistPath?: string;
}

/**
 * Internal structure for storing vector entries
 */
interface VectorEntry {
  /**
   * The memory entry
   */
  entry: MemoryEntry;

  /**
   * The vector embedding
   */
  vector: number[];
}

/**
 * Vector Store implementation of MemoryProvider
 * Designed for semantic memory with vector embeddings
 */
export class VectorStoreProvider implements MemoryProvider {
  private vectors: VectorEntry[] = [];
  private embeddingProvider: EmbeddingProvider;
  private maxVectors: number;
  private defaultSimilarityThreshold: number;
  private persistToDisk: boolean;
  private persistPath?: string;

  /**
   * Create a new vector store provider
   * @param options Provider options
   */
  constructor(options: VectorStoreOptions) {
    this.embeddingProvider = options.embeddingProvider;
    this.maxVectors = options.maxVectors || 10000;
    this.defaultSimilarityThreshold = options.defaultSimilarityThreshold || 0.7;
    this.persistToDisk = options.persistToDisk || false;
    this.persistPath = options.persistPath;

    // Load persisted vectors if enabled
    if (this.persistToDisk && this.persistPath) {
      this.loadVectors();
    }
  }

  /**
   * Store a memory entry with vector embedding
   * @param entry The memory entry to store
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

    // Generate embedding if not provided
    if (!entry.embedding) {
      // Extract text to embed from the entry content
      const textToEmbed = this.extractTextToEmbed(entry.content);

      // Generate embedding
      entry.embedding = await this.embeddingProvider.embedText(textToEmbed);

      // Add embedding metadata
      entry.embeddingMetadata = {
        dimensions: entry.embedding.length,
        // Add more metadata as needed
      };
    }

    // Store the entry with its vector
    this.vectors.push({
      entry,
      vector: entry.embedding,
    });

    // Enforce maximum vector limit
    if (this.vectors.length > this.maxVectors) {
      // Remove oldest entry
      this.vectors.sort((a, b) => a.entry.timestamp - b.entry.timestamp);
      this.vectors.shift();
    }

    // Persist vectors if enabled
    if (this.persistToDisk && this.persistPath) {
      this.saveVectors();
    }
  }

  /**
   * Query for memory entries
   * @param query The query parameters
   */
  async query(query: MemoryQuery): Promise<MemoryEntry[]> {
    // If semantic search is requested, use semanticSearch
    if (query.similarityTo || query.similarityToVector) {
      const results = await this.semanticSearch(query);
      return results.map((result) => {
        // Remove embedding from result if not requested
        if (!query.includeEmbeddings) {
          const { embedding, ...entryWithoutEmbedding } = result.entry;
          return entryWithoutEmbedding as MemoryEntry;
        }
        return result.entry;
      });
    }

    // Otherwise, perform standard filtering
    let results = this.vectors.map((v) => v.entry);

    // Filter by type
    if (query.type) {
      results = results.filter((entry) => entry.type === query.type);
    }

    // Filter by tags
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

    // Limit results
    if (query.maxResults && query.maxResults > 0) {
      results = results.slice(0, query.maxResults);
    }

    // Remove embeddings if not requested
    if (!query.includeEmbeddings) {
      results = results.map((entry) => {
        const { embedding, embeddingMetadata, ...entryWithoutEmbedding } =
          entry;
        return entryWithoutEmbedding as MemoryEntry;
      });
    }

    return results;
  }

  /**
   * Perform semantic search on memory entries
   * @param query The query parameters
   */
  async semanticSearch(
    query: MemoryQuery
  ): Promise<Array<MemoryEntry & { similarity: number }>> {
    let queryVector: number[];

    // Get query vector
    if (query.similarityToVector) {
      // Use provided vector
      queryVector = query.similarityToVector;
    } else if (query.similarityTo) {
      // Generate embedding for the query text
      queryVector = await this.embeddingProvider.embedText(query.similarityTo);
    } else {
      throw new Error(
        'Semantic search requires either similarityTo or similarityToVector'
      );
    }

    // Calculate similarity for each vector
    const results = this.vectors.map((vectorEntry) => {
      const similarity = this.embeddingProvider.calculateSimilarity(
        queryVector,
        vectorEntry.vector
      );

      return {
        ...vectorEntry.entry,
        similarity,
      };
    });

    // Apply similarity threshold
    const threshold =
      query.similarityThreshold || this.defaultSimilarityThreshold;
    let filteredResults = results.filter(
      (result) => result.similarity >= threshold
    );

    // Apply other filters
    if (query.type) {
      filteredResults = filteredResults.filter(
        (entry) => entry.type === query.type
      );
    }

    if (query.tags && query.tags.length > 0) {
      filteredResults = filteredResults.filter(
        (entry) =>
          entry.tags && entry.tags.some((tag) => query.tags!.includes(tag))
      );
    }

    if (query.timeRange) {
      filteredResults = filteredResults.filter(
        (entry) =>
          entry.timestamp >= query.timeRange!.from &&
          entry.timestamp <= query.timeRange!.to
      );
    }

    if (query.scope) {
      filteredResults = filteredResults.filter(
        (entry) => entry.scope === query.scope
      );
    }

    if (query.agentId) {
      filteredResults = filteredResults.filter(
        (entry) => entry.agentId === query.agentId
      );
    }

    if (query.visibility) {
      filteredResults = filteredResults.filter(
        (entry) => entry.visibility === query.visibility
      );
    }

    // Sort by similarity (highest first)
    filteredResults.sort((a, b) => b.similarity - a.similarity);

    // Limit results
    if (query.maxResults && query.maxResults > 0) {
      filteredResults = filteredResults.slice(0, query.maxResults);
    }

    return filteredResults;
  }

  /**
   * Delete a memory entry by ID
   * @param id The ID of the memory to delete
   */
  async delete(id: string): Promise<void> {
    const initialLength = this.vectors.length;
    this.vectors = this.vectors.filter((v) => v.entry.id !== id);

    // If vectors were removed and persistence is enabled, save
    if (
      this.vectors.length < initialLength &&
      this.persistToDisk &&
      this.persistPath
    ) {
      this.saveVectors();
    }
  }

  /**
   * Check if this provider supports a specific memory type
   * @param type The memory type
   */
  supportsType(type: string): boolean {
    // This provider is primarily for semantic memory
    return type === 'semantic';
  }

  /**
   * Extract text to embed from memory content
   * @param content The memory content
   */
  private extractTextToEmbed(content: any): string {
    // If content is a string, use it directly
    if (typeof content === 'string') {
      return content;
    }

    // If content has a text or thought property, use that
    if (content.text) {
      return content.text;
    }

    if (content.thought) {
      return content.thought;
    }

    // Otherwise, stringify the content
    return JSON.stringify(content);
  }

  /**
   * Save vectors to disk
   * This is a placeholder implementation
   */
  private saveVectors(): void {
    if (!this.persistPath) return;

    // In a real implementation, you would serialize and save the vectors
    // to the specified path
    console.log(`Saving ${this.vectors.length} vectors to ${this.persistPath}`);

    // Example implementation (commented out):
    // const data = JSON.stringify(this.vectors);
    // fs.writeFileSync(this.persistPath, data);
  }

  /**
   * Load vectors from disk
   * This is a placeholder implementation
   */
  private loadVectors(): void {
    if (!this.persistPath) return;

    // In a real implementation, you would load and deserialize the vectors
    // from the specified path
    console.log(`Loading vectors from ${this.persistPath}`);

    // Example implementation (commented out):
    // try {
    //   const data = fs.readFileSync(this.persistPath, 'utf8');
    //   this.vectors = JSON.parse(data);
    // } catch (error) {
    //   console.error('Error loading vectors:', error);
    //   this.vectors = [];
    // }
  }
}
