/**
 * Semantic Clustering Strategy
 *
 * Implements a clustering strategy that uses semantic similarity
 * to identify clusters of related memories.
 */

import { MemoryEntry } from '../../MemoryContract';
import { EmbeddingProvider } from '../../embeddings/EmbeddingProvider';
import {
  MemoryCluster,
  MemoryClusteringStrategy,
  ConsolidationOptions,
} from '../MemoryConsolidationContract';
import { createLogger } from '@echoforge/forgekit';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('SemanticClusteringStrategy');

/**
 * Configuration options for the semantic clustering strategy.
 */
export interface SemanticClusteringOptions {
  /** Embedding provider to use for generating embeddings */
  embeddingProvider: EmbeddingProvider;

  /** Similarity threshold for clustering (0-1) */
  similarityThreshold?: number;

  /** Maximum number of clusters to identify */
  maxClusters?: number;

  /** Whether to include embeddings in the cluster metadata */
  includeEmbeddings?: boolean;
}

/**
 * A clustering strategy that uses semantic similarity to identify
 * clusters of related memories.
 */
export class SemanticClusteringStrategy implements MemoryClusteringStrategy {
  private embeddingProvider: EmbeddingProvider;
  private similarityThreshold: number;
  private maxClusters: number;
  private includeEmbeddings: boolean;

  /**
   * Creates a new SemanticClusteringStrategy instance.
   *
   * @param options Configuration options
   */
  constructor(options: SemanticClusteringOptions) {
    this.embeddingProvider = options.embeddingProvider;
    this.similarityThreshold = options.similarityThreshold || 0.7;
    this.maxClusters = options.maxClusters || 10;
    this.includeEmbeddings = options.includeEmbeddings || false;
  }

  /**
   * Identifies clusters of related memories based on semantic similarity.
   *
   * @param entries Memory entries to cluster
   * @param options Consolidation options
   * @returns Array of memory clusters
   */
  async identifyClusters(
    entries: MemoryEntry[],
    options?: ConsolidationOptions
  ): Promise<MemoryCluster[]> {
    // Use options threshold if provided, otherwise use the default
    const threshold = options?.similarityThreshold || this.similarityThreshold;

    // Ensure all entries have embeddings
    const entriesWithEmbeddings = await this.ensureEmbeddings(entries);

    // Group entries into clusters using a simple agglomerative clustering approach
    const clusters: MemoryCluster[] = [];

    // Process each entry
    for (const entry of entriesWithEmbeddings) {
      // Skip entries without embeddings
      if (!entry.embedding) {
        logger.debug(`Skipping entry ${entry.id} without embedding`);
        continue;
      }

      // Try to find an existing cluster for this entry
      let foundCluster = false;

      // Check each cluster
      for (const cluster of clusters) {
        // Calculate average similarity to all entries in the cluster
        const similarities = cluster.entries.map((clusterEntry) => {
          if (!clusterEntry.embedding || !entry.embedding) return 0;
          return this.cosineSimilarity(clusterEntry.embedding, entry.embedding);
        });

        const avgSimilarity =
          similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;

        // If similarity is above threshold, add to this cluster
        if (avgSimilarity >= threshold) {
          cluster.entries.push(entry);
          cluster.updatedAt = Date.now();
          foundCluster = true;
          break;
        }
      }

      // If no suitable cluster found, create a new one
      if (!foundCluster) {
        // Limit the number of clusters
        if (clusters.length >= this.maxClusters) {
          // Find the smallest cluster
          const smallestCluster = clusters.reduce(
            (min, cluster) =>
              cluster.entries.length < min.entries.length ? cluster : min,
            clusters[0]
          );

          // If this entry has higher coherence than the smallest cluster, replace it
          if (smallestCluster && smallestCluster.entries.length === 1) {
            // Replace the smallest cluster
            smallestCluster.entries = [entry];
            smallestCluster.updatedAt = Date.now();
            smallestCluster.createdAt = Date.now();
          }
        } else {
          // Create a new cluster
          const newCluster: MemoryCluster = {
            id: uuidv4(),
            entries: [entry],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            consolidated: false,
            metadata: {
              clusterType: 'semantic',
              threshold,
            },
          };

          clusters.push(newCluster);
        }
      }
    }

    // Calculate coherence scores for each cluster
    for (const cluster of clusters) {
      cluster.coherenceScore = this.calculateClusterCoherence(cluster);

      // Remove embeddings if not requested
      if (!this.includeEmbeddings) {
        for (const entry of cluster.entries) {
          delete entry.embedding;
        }
      }
    }

    // Sort clusters by coherence score (descending)
    clusters.sort((a, b) => {
      const scoreA = a.coherenceScore || 0;
      const scoreB = b.coherenceScore || 0;
      return scoreB - scoreA;
    });

    logger.debug(`Identified ${clusters.length} semantic clusters`);
    return clusters;
  }

  /**
   * Ensures that all memory entries have embeddings.
   *
   * @param entries Memory entries to process
   * @returns Memory entries with embeddings
   */
  private async ensureEmbeddings(
    entries: MemoryEntry[]
  ): Promise<MemoryEntry[]> {
    const result: MemoryEntry[] = [];

    for (const entry of entries) {
      // Skip if entry already has an embedding
      if (entry.embedding) {
        result.push(entry);
        continue;
      }

      // Generate embedding for the entry content
      try {
        const content =
          typeof entry.content === 'string'
            ? entry.content
            : JSON.stringify(entry.content);

        const embedding =
          await this.embeddingProvider.generateEmbedding(content);

        // Add embedding to the entry
        result.push({
          ...entry,
          embedding,
          embeddingMetadata: {
            provider: this.embeddingProvider.name,
            timestamp: Date.now(),
          },
        });
      } catch (error) {
        logger.error(
          `Error generating embedding for entry ${entry.id}:`,
          error
        );
        // Include the entry without embedding
        result.push(entry);
      }
    }

    return result;
  }

  /**
   * Calculates the cosine similarity between two embedding vectors.
   *
   * @param a First embedding vector
   * @param b Second embedding vector
   * @returns Similarity score (0-1)
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embedding vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculates the coherence score for a cluster based on the average
   * pairwise similarity between all entries in the cluster.
   *
   * @param cluster Memory cluster to evaluate
   * @returns Coherence score (0-1)
   */
  private calculateClusterCoherence(cluster: MemoryCluster): number {
    const entries = cluster.entries;

    // If cluster has fewer than 2 entries, coherence is 0
    if (entries.length < 2) return 0;

    // Calculate average pairwise similarity
    let totalSimilarity = 0;
    let pairCount = 0;

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        if (entries[i].embedding && entries[j].embedding) {
          const similarity = this.cosineSimilarity(
            entries[i].embedding!,
            entries[j].embedding!
          );
          totalSimilarity += similarity;
          pairCount++;
        }
      }
    }

    return pairCount > 0 ? totalSimilarity / pairCount : 0;
  }
}
