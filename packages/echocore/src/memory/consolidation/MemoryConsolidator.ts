/**
 * Memory Consolidator
 *
 * Implements the memory consolidation system, which identifies clusters of related
 * memories and generates consolidated summary memories.
 */

import { MemoryEntry, MemoryManager, MemoryQuery } from '..';
import {
  ConsolidationOptions,
  ConsolidationResult,
  MemoryCluster,
  MemoryClusteringStrategy,
  MemoryConsolidator as IMemoryConsolidator,
  MemorySummarizationStrategy,
} from './MemoryConsolidationContract';
import { createLogger } from '@echoforge/forgekit';

const logger = createLogger('MemoryConsolidator');

/**
 * Default consolidation options
 */
const DEFAULT_CONSOLIDATION_OPTIONS: ConsolidationOptions = {
  similarityThreshold: 0.7,
  maxEntries: 100,
  minClusterSize: 3,
  maxMemoryAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  includePrivate: false,
  consolidationMetadata: {
    source: 'memory-consolidator',
    version: '1.0',
  },
};

/**
 * Implementation of the MemoryConsolidator interface that orchestrates
 * the process of identifying clusters and generating consolidated memories.
 */
export class MemoryConsolidator implements IMemoryConsolidator {
  private clusteringStrategy?: MemoryClusteringStrategy;
  private summarizationStrategy?: MemorySummarizationStrategy;
  private memoryManager: MemoryManager;

  /**
   * Creates a new MemoryConsolidator instance.
   *
   * @param memoryManager The memory manager to use for querying and storing memories
   * @param clusteringStrategy Optional clustering strategy to use
   * @param summarizationStrategy Optional summarization strategy to use
   */
  constructor(
    memoryManager: MemoryManager,
    clusteringStrategy?: MemoryClusteringStrategy,
    summarizationStrategy?: MemorySummarizationStrategy
  ) {
    this.memoryManager = memoryManager;
    this.clusteringStrategy = clusteringStrategy;
    this.summarizationStrategy = summarizationStrategy;
  }

  /**
   * Sets the clustering strategy to use for identifying related memories.
   *
   * @param strategy Clustering strategy implementation
   */
  setClusteringStrategy(strategy: MemoryClusteringStrategy): void {
    this.clusteringStrategy = strategy;
  }

  /**
   * Sets the summarization strategy to use for generating consolidated memories.
   *
   * @param strategy Summarization strategy implementation
   */
  setSummarizationStrategy(strategy: MemorySummarizationStrategy): void {
    this.summarizationStrategy = strategy;
  }

  /**
   * Runs the consolidation process on the specified memories.
   *
   * @param query Query to select memories for consolidation
   * @param options Consolidation options
   * @returns Results of the consolidation process
   */
  async consolidate(
    query: MemoryQuery,
    options?: ConsolidationOptions
  ): Promise<ConsolidationResult[]> {
    // Merge default options with provided options
    const consolidationOptions = {
      ...DEFAULT_CONSOLIDATION_OPTIONS,
      ...options,
    };

    // Validate required strategies
    if (!this.clusteringStrategy) {
      throw new Error(
        'Clustering strategy not set. Call setClusteringStrategy() before consolidating.'
      );
    }

    if (!this.summarizationStrategy) {
      throw new Error(
        'Summarization strategy not set. Call setSummarizationStrategy() before consolidating.'
      );
    }

    // Apply time range filter if maxMemoryAge is specified
    if (consolidationOptions.maxMemoryAge) {
      const oldestTimestamp = Date.now() - consolidationOptions.maxMemoryAge;
      query = {
        ...query,
        timeRange: {
          start: oldestTimestamp,
          ...(query.timeRange?.end ? { end: query.timeRange.end } : {}),
        },
      };
    }

    // Apply memory type filter if specified
    if (
      consolidationOptions.memoryTypes &&
      consolidationOptions.memoryTypes.length > 0
    ) {
      query = {
        ...query,
        type: consolidationOptions.memoryTypes,
      };
    }

    // Apply agent ID filter if specified
    if (
      consolidationOptions.agentIds &&
      consolidationOptions.agentIds.length > 0
    ) {
      query = {
        ...query,
        agentId: consolidationOptions.agentIds,
      };
    }

    // Apply visibility filter
    if (!consolidationOptions.includePrivate) {
      query = {
        ...query,
        visibility: 'shared',
      };
    }

    // Query memories for consolidation
    logger.debug('Querying memories for consolidation', { query });
    const memories = await this.memoryManager.query(query);

    // Limit the number of entries if maxEntries is specified
    const limitedMemories = consolidationOptions.maxEntries
      ? memories.slice(0, consolidationOptions.maxEntries)
      : memories;

    if (limitedMemories.length === 0) {
      logger.debug('No memories found for consolidation');
      return [];
    }

    logger.debug(`Found ${limitedMemories.length} memories for consolidation`);

    // Identify clusters of related memories
    const clusters = await this.clusteringStrategy.identifyClusters(
      limitedMemories,
      consolidationOptions
    );

    // Filter clusters by minimum size
    const validClusters = clusters.filter(
      (cluster) =>
        cluster.entries.length >= (consolidationOptions.minClusterSize || 1)
    );

    logger.debug(
      `Identified ${validClusters.length} valid clusters for consolidation`
    );

    // Generate consolidated memories for each cluster
    const results: ConsolidationResult[] = [];

    for (const cluster of validClusters) {
      try {
        // Skip already consolidated clusters
        if (cluster.consolidated) {
          logger.debug(`Skipping already consolidated cluster ${cluster.id}`);
          results.push({
            sourceCluster: cluster,
            success: false,
            error: 'Cluster already consolidated',
          });
          continue;
        }

        // Generate consolidated memory
        logger.debug(
          `Generating consolidated memory for cluster ${cluster.id}`
        );
        const consolidatedMemory =
          await this.summarizationStrategy.summarizeCluster(
            cluster,
            consolidationOptions
          );

        // Add consolidation metadata
        consolidatedMemory.tags = [
          ...(consolidatedMemory.tags || []),
          'consolidated',
          `source:${cluster.entries.length}-entries`,
        ];

        // Store the consolidated memory
        const storedMemory = await this.memoryManager.store(consolidatedMemory);

        // Mark cluster as consolidated
        cluster.consolidated = true;
        cluster.updatedAt = Date.now();

        // Add result
        results.push({
          consolidatedMemory: storedMemory,
          sourceCluster: cluster,
          success: true,
        });

        logger.debug(
          `Successfully consolidated cluster ${cluster.id} into memory ${storedMemory.id}`
        );
      } catch (error) {
        logger.error(`Error consolidating cluster ${cluster.id}:`, error);
        results.push({
          sourceCluster: cluster,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }
}
