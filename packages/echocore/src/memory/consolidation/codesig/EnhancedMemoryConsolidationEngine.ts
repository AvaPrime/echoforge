/**
 * Enhanced Memory Consolidation Engine
 *
 * Extends the core Memory Consolidation system with emotion-weighted clustering,
 * intent-driven summarization, and meta-consolidation capabilities.
 */

import { MemoryProvider, MemoryEntry, MemoryQuery } from '../../MemoryContract';
import { MemoryConsolidator } from '../MemoryConsolidator';
import {
  MemoryClusteringStrategy,
  MemorySummarizationStrategy,
  MemoryCluster,
  ConsolidationOptions,
} from '../MemoryConsolidationContract';
import {
  CODESIGConsolidationOptions,
  CODESIGConsolidationResult,
  EmotionalWeight,
  IntentMetadata,
} from './CODESIGTypes';

/**
 * Emotion-weighted clustering strategy that extends semantic clustering
 * with emotional resonance weighting.
 */
export class EmotionWeightedClusteringStrategy
  implements MemoryClusteringStrategy
{
  /**
   * Creates a new EmotionWeightedClusteringStrategy
   *
   * @param baseClusteringStrategy The base clustering strategy to extend
   * @param emotionalWeights Emotional weights to apply during clustering
   */
  constructor(
    private baseClusteringStrategy: MemoryClusteringStrategy,
    private emotionalWeights: EmotionalWeight[] = []
  ) {}

  /**
   * Sets the emotional weights for clustering
   *
   * @param weights The emotional weights to apply
   */
  setEmotionalWeights(weights: EmotionalWeight[]): void {
    this.emotionalWeights = weights;
  }

  /**
   * Identifies clusters in the provided memory entries
   *
   * @param entries Memory entries to cluster
   * @param existingClusters Existing clusters to consider
   * @param options Consolidation options
   * @returns Identified memory clusters
   */
  async identifyClusters(
    entries: MemoryEntry[],
    existingClusters: MemoryCluster[] = [],
    options?: ConsolidationOptions
  ): Promise<MemoryCluster[]> {
    // First, get the base clusters from the underlying strategy
    const baseClusters = await this.baseClusteringStrategy.identifyClusters(
      entries,
      existingClusters,
      options
    );

    // If no emotional weights are defined, return the base clusters
    if (!this.emotionalWeights || this.emotionalWeights.length === 0) {
      return baseClusters;
    }

    // Apply emotional weighting to refine the clusters
    return this.applyEmotionalWeighting(baseClusters, entries);
  }

  /**
   * Applies emotional weighting to refine clusters
   *
   * @param clusters Base clusters to refine
   * @param entries All memory entries
   * @returns Refined clusters with emotional weighting
   */
  private applyEmotionalWeighting(
    clusters: MemoryCluster[],
    entries: MemoryEntry[]
  ): MemoryCluster[] {
    // Create a map of emotional weights for quick lookup
    const weightMap = new Map<string, number>();
    this.emotionalWeights.forEach((weight) => {
      weightMap.set(weight.emotion, weight.weight);
    });

    // Function to calculate emotional resonance score for an entry
    const getEmotionalResonance = (entry: MemoryEntry): number => {
      // Check if the entry has emotional context metadata
      const emotionalContext = entry.metadata?.emotionalContext;
      if (!emotionalContext) return 1.0; // Default weight if no context

      // Get the weight for this emotion, or default to 0.5
      return weightMap.get(emotionalContext) || 0.5;
    };

    // Refine each cluster based on emotional resonance
    return clusters.map((cluster) => {
      // Calculate average emotional resonance for the cluster
      const totalResonance = cluster.entries.reduce((sum, entryId) => {
        const entry = entries.find((e) => e.id === entryId);
        return sum + (entry ? getEmotionalResonance(entry) : 0);
      }, 0);

      const avgResonance = totalResonance / cluster.entries.length || 0;

      // Add emotional resonance metadata to the cluster
      return {
        ...cluster,
        metadata: {
          ...cluster.metadata,
          emotionalResonance: avgResonance,
        },
      };
    });
  }
}

/**
 * Intent-driven summarization strategy that extends base summarization
 * with intent alignment and purpose-driven synthesis.
 */
export class IntentDrivenSummarizationStrategy
  implements MemorySummarizationStrategy
{
  /**
   * Creates a new IntentDrivenSummarizationStrategy
   *
   * @param baseSummarizationStrategy The base summarization strategy to extend
   * @param intentMetadata Intent metadata to guide summarization
   */
  constructor(
    private baseSummarizationStrategy: MemorySummarizationStrategy,
    private intentMetadata?: IntentMetadata
  ) {}

  /**
   * Sets the intent metadata for summarization
   *
   * @param metadata The intent metadata to apply
   */
  setIntentMetadata(metadata: IntentMetadata): void {
    this.intentMetadata = metadata;
  }

  /**
   * Generates a consolidated memory from a cluster
   *
   * @param cluster The memory cluster to consolidate
   * @param entries All memory entries
   * @param options Consolidation options
   * @returns The consolidated memory entry
   */
  async generateConsolidatedMemory(
    cluster: MemoryCluster,
    entries: MemoryEntry[],
    options?: ConsolidationOptions
  ): Promise<MemoryEntry> {
    // Get the base consolidated memory from the underlying strategy
    const baseMemory =
      await this.baseSummarizationStrategy.generateConsolidatedMemory(
        cluster,
        entries,
        options
      );

    // If no intent metadata is defined, return the base memory
    if (!this.intentMetadata) {
      return baseMemory;
    }

    // Enhance the consolidated memory with intent metadata
    return this.enhanceWithIntentMetadata(baseMemory, cluster, entries);
  }

  /**
   * Enhances a consolidated memory with intent metadata
   *
   * @param memory The base consolidated memory
   * @param cluster The source memory cluster
   * @param entries All memory entries
   * @returns Enhanced memory entry with intent metadata
   */
  private enhanceWithIntentMetadata(
    memory: MemoryEntry,
    cluster: MemoryCluster,
    entries: MemoryEntry[]
  ): MemoryEntry {
    // Add intent metadata to the consolidated memory
    return {
      ...memory,
      metadata: {
        ...memory.metadata,
        intentMetadata: this.intentMetadata,
        sourceClusterId: cluster.id,
      },
    };
  }
}

/**
 * Enhanced Memory Consolidation Engine that extends the core Memory Consolidator
 * with CODESIG-specific features.
 */
export class EnhancedMemoryConsolidationEngine {
  /**
   * Creates a new EnhancedMemoryConsolidationEngine
   *
   * @param memoryProvider The memory provider to use
   * @param baseConsolidator The base memory consolidator to extend
   */
  constructor(
    private memoryProvider: MemoryProvider,
    private baseConsolidator: MemoryConsolidator
  ) {}

  /**
   * Runs the enhanced consolidation process
   *
   * @param query Query to select memories for consolidation
   * @param options CODESIG-specific consolidation options
   * @returns Results of the consolidation process
   */
  async consolidate(
    query: MemoryQuery,
    options?: CODESIGConsolidationOptions
  ): Promise<CODESIGConsolidationResult[]> {
    // Create emotion-weighted clustering strategy if emotional weights are provided
    if (options?.emotionalWeights && options.emotionalWeights.length > 0) {
      const baseStrategy = this.baseConsolidator.getClusteringStrategy();
      const emotionWeightedStrategy = new EmotionWeightedClusteringStrategy(
        baseStrategy,
        options.emotionalWeights
      );

      this.baseConsolidator.setClusteringStrategy(emotionWeightedStrategy);
    }

    // Create intent-driven summarization strategy if intent metadata is provided
    if (options?.intentMetadata) {
      const baseStrategy = this.baseConsolidator.getSummarizationStrategy();
      const intentDrivenStrategy = new IntentDrivenSummarizationStrategy(
        baseStrategy,
        options.intentMetadata
      );

      this.baseConsolidator.setSummarizationStrategy(intentDrivenStrategy);
    }

    // Run the base consolidation process
    const results = await this.baseConsolidator.runConsolidation(
      query,
      options
    );

    // Enhance the results with CODESIG-specific metadata
    return results.map((result) => ({
      ...result,
      emotionalResonance: this.calculateEmotionalResonance(result, options),
      intentAlignment: this.calculateIntentAlignment(result, options),
    }));
  }

  /**
   * Performs meta-consolidation across multiple SoulFrames
   *
   * @param soulFrameIds IDs of SoulFrames to include in meta-consolidation
   * @param options CODESIG-specific consolidation options
   * @returns Results of the meta-consolidation process
   */
  async metaConsolidate(
    soulFrameIds: string[],
    options?: CODESIGConsolidationOptions
  ): Promise<CODESIGConsolidationResult[]> {
    // Create a query that includes memories from all specified SoulFrames
    const query: MemoryQuery = {
      agentId: soulFrameIds,
      timeRange: options?.timeRange,
    };

    // Run the consolidation with the multi-SoulFrame query
    return this.consolidate(query, options);
  }

  /**
   * Calculates the emotional resonance score for a consolidation result
   *
   * @param result The consolidation result
   * @param options The consolidation options
   * @returns The emotional resonance score (0-1)
   */
  private calculateEmotionalResonance(
    result: any,
    options?: CODESIGConsolidationOptions
  ): number {
    // If the cluster has an emotional resonance score, use it
    if (result.clusters && result.clusters.length > 0) {
      const avgResonance =
        result.clusters.reduce(
          (sum: number, cluster: any) =>
            sum + (cluster.metadata?.emotionalResonance || 0),
          0
        ) / result.clusters.length;

      return avgResonance;
    }

    // Default resonance score
    return 0.5;
  }

  /**
   * Calculates the intent alignment score for a consolidation result
   *
   * @param result The consolidation result
   * @param options The consolidation options
   * @returns The intent alignment score (0-1)
   */
  private calculateIntentAlignment(
    result: any,
    options?: CODESIGConsolidationOptions
  ): number {
    // If intent metadata is provided with a purpose alignment score, use it
    if (options?.intentMetadata?.purposeAlignment !== undefined) {
      return options.intentMetadata.purposeAlignment;
    }

    // Default alignment score
    return 0.5;
  }
}
