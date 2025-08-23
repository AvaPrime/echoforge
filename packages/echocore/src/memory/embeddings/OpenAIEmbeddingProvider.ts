/**
 * OpenAI Embedding Provider
 *
 * Implementation of the EmbeddingProvider interface using OpenAI's embedding models.
 */

import { EmbeddingOptions, EmbeddingProvider } from './EmbeddingProvider';

/**
 * OpenAI-specific embedding options
 */
export interface OpenAIEmbeddingOptions extends EmbeddingOptions {
  /**
   * OpenAI API key
   */
  apiKey?: string;

  /**
   * OpenAI embedding model to use
   * @default 'text-embedding-ada-002'
   */
  model?: string;
}

/**
 * OpenAI implementation of the EmbeddingProvider interface
 */
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private apiKey: string;
  private defaultModel: string;

  /**
   * Create a new OpenAI embedding provider
   * @param options Provider options
   */
  constructor(options: OpenAIEmbeddingOptions = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || '';
    this.defaultModel = options.model || 'text-embedding-ada-002';

    if (!this.apiKey) {
      console.warn(
        'OpenAIEmbeddingProvider initialized without API key. Set OPENAI_API_KEY environment variable or pass apiKey option.'
      );
    }
  }

  /**
   * Generate an embedding vector for a text string using OpenAI
   * @param text The text to embed
   * @param options Optional embedding options
   * @returns Promise resolving to a numeric vector
   */
  async embedText(
    text: string,
    options?: OpenAIEmbeddingOptions
  ): Promise<number[]> {
    const model = options?.model || this.defaultModel;
    const apiKey = options?.apiKey || this.apiKey;

    if (!apiKey) {
      throw new Error('OpenAI API key is required for embedding generation');
    }

    try {
      // Note: This is a placeholder implementation
      // In a real implementation, you would use the OpenAI API client
      // to generate embeddings

      // Example with fetch:
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: model,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Error generating OpenAI embedding:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch using OpenAI
   * @param texts Array of texts to embed
   * @param options Optional embedding options
   * @returns Promise resolving to an array of numeric vectors
   */
  async embedBatch(
    texts: string[],
    options?: OpenAIEmbeddingOptions
  ): Promise<number[][]> {
    // For simplicity, we'll just call embedText for each text
    // In a production implementation, you would use the OpenAI batch API
    // to generate embeddings more efficiently
    return Promise.all(texts.map((text) => this.embedText(text, options)));
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param vec1 First vector
   * @param vec2 Second vector
   * @returns Similarity score between 0 and 1
   */
  calculateSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    // Cosine similarity calculation
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) {
      return 0;
    }

    return dotProduct / (mag1 * mag2);
  }
}
