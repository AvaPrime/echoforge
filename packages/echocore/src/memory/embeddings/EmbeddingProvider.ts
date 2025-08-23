/**
 * EmbeddingProvider Interface
 *
 * Defines the contract for embedding providers that convert text to vector embeddings
 * for semantic memory storage and retrieval.
 */

/**
 * Options for embedding generation
 */
export interface EmbeddingOptions {
  /**
   * Model to use for embeddings (provider-specific)
   */
  model?: string;

  /**
   * Dimension of the embedding vectors
   */
  dimensions?: number;

  /**
   * Additional provider-specific options
   */
  [key: string]: any;
}

/**
 * Interface for embedding providers
 */
export interface EmbeddingProvider {
  /**
   * Generate an embedding vector for a text string
   * @param text The text to embed
   * @param options Optional embedding options
   * @returns Promise resolving to a numeric vector
   */
  embedText(text: string, options?: EmbeddingOptions): Promise<number[]>;

  /**
   * Generate embeddings for multiple texts in batch
   * @param texts Array of texts to embed
   * @param options Optional embedding options
   * @returns Promise resolving to an array of numeric vectors
   */
  embedBatch(texts: string[], options?: EmbeddingOptions): Promise<number[][]>;

  /**
   * Calculate similarity between two vectors
   * @param vec1 First vector
   * @param vec2 Second vector
   * @returns Similarity score (typically between 0 and 1)
   */
  calculateSimilarity(vec1: number[], vec2: number[]): number;
}
