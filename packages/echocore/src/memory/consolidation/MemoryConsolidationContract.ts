/**
 * Memory Consolidation Contract
 *
 * Defines the interfaces and types for the memory consolidation system,
 * which is responsible for detecting patterns across memory entries
 * and generating summary insights.
 */

import { MemoryEntry, MemoryQuery } from '../MemoryContract';

/**
 * Represents a group of related memory entries that have been identified
 * for potential consolidation.
 */
export interface MemoryCluster {
  /** Unique identifier for the cluster */
  id: string;

  /** Memory entries that belong to this cluster */
  entries: MemoryEntry[];

  /** Timestamp when this cluster was created */
  createdAt: number;

  /** Timestamp when this cluster was last updated */
  updatedAt: number;

  /** Optional metadata about the cluster */
  metadata?: Record<string, any>;

  /** Score indicating the coherence or importance of this cluster (0-1) */
  coherenceScore?: number;

  /** Whether this cluster has been consolidated into a summary memory */
  consolidated: boolean;
}

/**
 * Configuration options for the memory consolidation process.
 */
export interface ConsolidationOptions {
  /** Minimum similarity threshold for clustering memories (0-1) */
  similarityThreshold?: number;

  /** Maximum number of entries to consider for consolidation */
  maxEntries?: number;

  /** Minimum number of entries required to form a cluster */
  minClusterSize?: number;

  /** Maximum age of memories to consider for consolidation (in milliseconds) */
  maxMemoryAge?: number;

  /** Memory types to include in consolidation */
  memoryTypes?: string[];

  /** Agent IDs to include in consolidation */
  agentIds?: string[];

  /** Whether to include private memories in consolidation */
  includePrivate?: boolean;

  /** Custom metadata to attach to consolidated memories */
  consolidationMetadata?: Record<string, any>;
}

/**
 * Result of a memory consolidation operation.
 */
export interface ConsolidationResult {
  /** The consolidated memory entry that was created */
  consolidatedMemory?: MemoryEntry;

  /** The cluster that was consolidated */
  sourceCluster: MemoryCluster;

  /** Whether the consolidation was successful */
  success: boolean;

  /** Error message if consolidation failed */
  error?: string;
}

/**
 * Interface for memory clustering strategies.
 */
export interface MemoryClusteringStrategy {
  /**
   * Identifies clusters of related memories from a set of memory entries.
   *
   * @param entries Memory entries to cluster
   * @param options Clustering options
   * @returns Array of memory clusters
   */
  identifyClusters(
    entries: MemoryEntry[],
    options?: ConsolidationOptions
  ): Promise<MemoryCluster[]>;
}

/**
 * Interface for memory summarization strategies.
 */
export interface MemorySummarizationStrategy {
  /**
   * Generates a consolidated memory from a cluster of related memories.
   *
   * @param cluster Cluster of related memories
   * @param options Consolidation options
   * @returns Consolidated memory entry
   */
  summarizeCluster(
    cluster: MemoryCluster,
    options?: ConsolidationOptions
  ): Promise<MemoryEntry>;
}

/**
 * Interface for the memory consolidator, which orchestrates the process
 * of identifying clusters and generating consolidated memories.
 */
export interface MemoryConsolidator {
  /**
   * Runs the consolidation process on the specified memories.
   *
   * @param query Query to select memories for consolidation
   * @param options Consolidation options
   * @returns Results of the consolidation process
   */
  consolidate(
    query: MemoryQuery,
    options?: ConsolidationOptions
  ): Promise<ConsolidationResult[]>;

  /**
   * Sets the clustering strategy to use for identifying related memories.
   *
   * @param strategy Clustering strategy implementation
   */
  setClusteringStrategy(strategy: MemoryClusteringStrategy): void;

  /**
   * Sets the summarization strategy to use for generating consolidated memories.
   *
   * @param strategy Summarization strategy implementation
   */
  setSummarizationStrategy(strategy: MemorySummarizationStrategy): void;
}
