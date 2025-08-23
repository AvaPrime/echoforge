/**
 * CrossAgentMetaLearning.ts
 *
 * This file implements the Cross-Agent Meta-Learning component for CODESIG Phase 6,
 * enabling agents to share evolutionary experiences, insights, and learning outcomes
 * to accelerate collective intelligence development.
 */

import { SoulFrameId, SoulFrame } from '../types/CODESIGTypes';
import { SoulFrameManager } from '../core/SoulFrameManager';
import {
  CodalogueProtocolLedger,
  CodalogueEntry,
} from '../ledger/CodalogueProtocolLedger';
import { EvolutionProposal } from '../evolution/EvolutionProposalPipeline';
import { EmotionalResonanceIndex } from '../emotional/EmotionalResonanceIndex';

/**
 * Types of learning experiences that can be shared between agents
 */
export enum ExperienceType {
  INSIGHT = 'insight', // New understanding or pattern recognition
  ADAPTATION = 'adaptation', // Successful adaptation to a challenge
  FAILURE = 'failure', // Learning from unsuccessful attempts
  COLLABORATION = 'collaboration', // Successful multi-agent interaction pattern
  INNOVATION = 'innovation', // Novel approach or solution
  CONFLICT_RESOLUTION = 'conflict_resolution', // Resolution of agent dissonance
  GOAL_ACHIEVEMENT = 'goal_achievement', // Successful achievement of a purpose
  ANOMALY_DETECTION = 'anomaly_detection', // Identification of unexpected patterns
}

/**
 * Structure representing a learning experience that can be shared
 */
export interface LearningExperience {
  id: string;
  timestamp: Date;
  type: ExperienceType;
  originatingSoulFrameId: SoulFrameId;
  participatingSoulFrameIds: SoulFrameId[];
  context: {
    situation: string;
    relevantCodalogueEntryIds?: string[];
    relatedEvolutionProposalIds?: string[];
  };
  content: {
    description: string;
    insights: string[];
    emotionalResonanceSnapshot?: Record<string, number>;
    knowledgeGraph?: {
      nodes: Array<{ id: string; label: string; type: string }>;
      edges: Array<{ source: string; target: string; label: string }>;
    };
  };
  outcomes: {
    successMetrics: Record<string, number>;
    applicabilityConditions: string[];
    limitations: string[];
  };
  metadata: {
    confidence: number; // 0-1 scale
    significance: number; // 0-1 scale
    transferability: number; // 0-1 scale
    tags: string[];
  };
}

/**
 * Structure representing a knowledge transfer between agents
 */
export interface KnowledgeTransfer {
  id: string;
  timestamp: Date;
  sourceSoulFrameId: SoulFrameId;
  targetSoulFrameId: SoulFrameId;
  experienceIds: string[];
  adaptations: {
    originalInsight: string;
    adaptedInsight: string;
    adaptationRationale: string;
  }[];
  transferMetrics: {
    compatibilityScore: number; // 0-1 scale
    integrationSuccess: number; // 0-1 scale
    performanceImpact: number; // -1 to 1 scale (negative means degradation)
  };
}

/**
 * Structure representing a collective insight derived from multiple experiences
 */
export interface CollectiveInsight {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  contributingExperienceIds: string[];
  contributingSoulFrameIds: SoulFrameId[];
  synthesisMethod:
    | 'pattern_recognition'
    | 'consensus_formation'
    | 'contradiction_resolution'
    | 'emergent_discovery';
  content: {
    insight: string;
    supportingEvidence: string[];
    counterEvidence: string[];
    implications: string[];
    recommendations: string[];
  };
  metadata: {
    confidence: number; // 0-1 scale
    significance: number; // 0-1 scale
    novelty: number; // 0-1 scale
    tags: string[];
  };
}

/**
 * Configuration options for the Cross-Agent Meta-Learning system
 */
export interface CrossAgentMetaLearningConfig {
  experienceArchiveCapacity: number;
  minimumConfidenceThreshold: number; // 0-1 scale
  transferCompatibilityThreshold: number; // 0-1 scale
  insightGenerationFrequency: number; // milliseconds
  experienceExpirationTime?: number; // milliseconds, undefined means no expiration
  enabledExperienceTypes: ExperienceType[];
  knowledgeGraphComplexity: 'simple' | 'moderate' | 'complex';
  autoShareNewExperiences: boolean;
}

/**
 * Default configuration for the Cross-Agent Meta-Learning system
 */
export const DEFAULT_META_LEARNING_CONFIG: CrossAgentMetaLearningConfig = {
  experienceArchiveCapacity: 1000,
  minimumConfidenceThreshold: 0.6,
  transferCompatibilityThreshold: 0.7,
  insightGenerationFrequency: 3600000, // 1 hour
  experienceExpirationTime: undefined, // No expiration by default
  enabledExperienceTypes: Object.values(ExperienceType),
  knowledgeGraphComplexity: 'moderate',
  autoShareNewExperiences: true,
};

/**
 * Main interface for the Cross-Agent Meta-Learning system
 */
export interface CrossAgentMetaLearning {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  // Experience management
  recordExperience(
    experience: Omit<LearningExperience, 'id' | 'timestamp'>
  ): Promise<string>;
  getExperience(experienceId: string): Promise<LearningExperience | null>;
  queryExperiences(
    filters: Partial<{
      types: ExperienceType[];
      soulFrameIds: SoulFrameId[];
      tags: string[];
      minConfidence: number;
      minSignificance: number;
      dateRange: { start: Date; end: Date };
    }>
  ): Promise<LearningExperience[]>;

  // Knowledge transfer
  transferKnowledge(
    sourceSoulFrameId: SoulFrameId,
    targetSoulFrameId: SoulFrameId,
    experienceIds: string[]
  ): Promise<KnowledgeTransfer>;
  getKnowledgeTransfers(soulFrameId: SoulFrameId): Promise<KnowledgeTransfer[]>;
  assessTransferCompatibility(
    experienceId: string,
    targetSoulFrameId: SoulFrameId
  ): Promise<number>; // 0-1 scale

  // Collective insight generation
  generateCollectiveInsights(
    experienceIds?: string[]
  ): Promise<CollectiveInsight[]>;
  getCollectiveInsight(insightId: string): Promise<CollectiveInsight | null>;
  queryCollectiveInsights(
    filters: Partial<{
      contributingSoulFrameIds: SoulFrameId[];
      minConfidence: number;
      minSignificance: number;
      tags: string[];
      dateRange: { start: Date; end: Date };
    }>
  ): Promise<CollectiveInsight[]>;

  // Integration with other components
  generateEvolutionProposalsFromInsights(
    insightIds: string[]
  ): Promise<EvolutionProposal[]>;
  analyzeEmotionalImpact(
    experienceId: string
  ): Promise<Record<SoulFrameId, number>>;

  // Configuration
  getConfig(): CrossAgentMetaLearningConfig;
  updateConfig(config: Partial<CrossAgentMetaLearningConfig>): Promise<void>;
}

/**
 * Implementation of the Cross-Agent Meta-Learning system
 */
export class CrossAgentMetaLearningImpl implements CrossAgentMetaLearning {
  private config: CrossAgentMetaLearningConfig;
  private soulFrameManager: SoulFrameManager;
  private codalogueProtocolLedger: CodalogueProtocolLedger;
  private emotionalResonanceIndex?: EmotionalResonanceIndex;

  private experiences: Map<string, LearningExperience> = new Map();
  private knowledgeTransfers: Map<string, KnowledgeTransfer> = new Map();
  private collectiveInsights: Map<string, CollectiveInsight> = new Map();

  private insightGenerationInterval?: NodeJS.Timeout;

  constructor(
    soulFrameManager: SoulFrameManager,
    codalogueProtocolLedger: CodalogueProtocolLedger,
    config?: Partial<CrossAgentMetaLearningConfig>,
    emotionalResonanceIndex?: EmotionalResonanceIndex
  ) {
    this.soulFrameManager = soulFrameManager;
    this.codalogueProtocolLedger = codalogueProtocolLedger;
    this.emotionalResonanceIndex = emotionalResonanceIndex;
    this.config = { ...DEFAULT_META_LEARNING_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    // Set up periodic insight generation
    if (this.config.insightGenerationFrequency > 0) {
      this.insightGenerationInterval = setInterval(
        () =>
          this.generateCollectiveInsights().catch((err) =>
            console.error('Error generating insights:', err)
          ),
        this.config.insightGenerationFrequency
      );
    }

    // Load existing experiences from the ledger if available
    await this.loadExistingExperiences();
  }

  async shutdown(): Promise<void> {
    // Clear the insight generation interval
    if (this.insightGenerationInterval) {
      clearInterval(this.insightGenerationInterval);
      this.insightGenerationInterval = undefined;
    }
  }

  async recordExperience(
    experienceData: Omit<LearningExperience, 'id' | 'timestamp'>
  ): Promise<string> {
    // Validate that the experience type is enabled
    if (!this.config.enabledExperienceTypes.includes(experienceData.type)) {
      throw new Error(
        `Experience type ${experienceData.type} is not enabled in the current configuration`
      );
    }

    // Validate that the originating SoulFrame exists
    const originatingSoulFrame = await this.soulFrameManager.getSoulFrame(
      experienceData.originatingSoulFrameId
    );
    if (!originatingSoulFrame) {
      throw new Error(
        `Originating SoulFrame with ID ${experienceData.originatingSoulFrameId} not found`
      );
    }

    // Create the experience with ID and timestamp
    const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const experience: LearningExperience = {
      ...experienceData,
      id,
      timestamp: new Date(),
    };

    // Store the experience
    this.experiences.set(id, experience);

    // Enforce capacity limits if needed
    if (
      this.config.experienceArchiveCapacity > 0 &&
      this.experiences.size > this.config.experienceArchiveCapacity
    ) {
      this.pruneExperienceArchive();
    }

    // Auto-share with other SoulFrames if enabled
    if (this.config.autoShareNewExperiences) {
      await this.autoShareExperience(experience);
    }

    // Record in the Codalogue Ledger
    await this.recordExperienceInLedger(experience);

    return id;
  }

  async getExperience(
    experienceId: string
  ): Promise<LearningExperience | null> {
    return this.experiences.get(experienceId) || null;
  }

  async queryExperiences(
    filters: Partial<{
      types: ExperienceType[];
      soulFrameIds: SoulFrameId[];
      tags: string[];
      minConfidence: number;
      minSignificance: number;
      dateRange: { start: Date; end: Date };
    }>
  ): Promise<LearningExperience[]> {
    return Array.from(this.experiences.values()).filter((exp) => {
      // Filter by types
      if (filters.types && !filters.types.includes(exp.type)) {
        return false;
      }

      // Filter by originating or participating SoulFrames
      if (filters.soulFrameIds) {
        const relevantSoulFrameIds = [
          exp.originatingSoulFrameId,
          ...exp.participatingSoulFrameIds,
        ];
        if (
          !filters.soulFrameIds.some((id) => relevantSoulFrameIds.includes(id))
        ) {
          return false;
        }
      }

      // Filter by tags
      if (
        filters.tags &&
        !filters.tags.some((tag) => exp.metadata.tags.includes(tag))
      ) {
        return false;
      }

      // Filter by confidence
      if (
        filters.minConfidence !== undefined &&
        exp.metadata.confidence < filters.minConfidence
      ) {
        return false;
      }

      // Filter by significance
      if (
        filters.minSignificance !== undefined &&
        exp.metadata.significance < filters.minSignificance
      ) {
        return false;
      }

      // Filter by date range
      if (filters.dateRange) {
        if (
          exp.timestamp < filters.dateRange.start ||
          exp.timestamp > filters.dateRange.end
        ) {
          return false;
        }
      }

      return true;
    });
  }

  async transferKnowledge(
    sourceSoulFrameId: SoulFrameId,
    targetSoulFrameId: SoulFrameId,
    experienceIds: string[]
  ): Promise<KnowledgeTransfer> {
    // Validate SoulFrames exist
    const sourceSoulFrame =
      await this.soulFrameManager.getSoulFrame(sourceSoulFrameId);
    const targetSoulFrame =
      await this.soulFrameManager.getSoulFrame(targetSoulFrameId);

    if (!sourceSoulFrame) {
      throw new Error(
        `Source SoulFrame with ID ${sourceSoulFrameId} not found`
      );
    }

    if (!targetSoulFrame) {
      throw new Error(
        `Target SoulFrame with ID ${targetSoulFrameId} not found`
      );
    }

    // Validate experiences exist and belong to source SoulFrame
    const experiences = await Promise.all(
      experienceIds.map(async (id) => {
        const exp = await this.getExperience(id);
        if (!exp) {
          throw new Error(`Experience with ID ${id} not found`);
        }
        if (
          exp.originatingSoulFrameId !== sourceSoulFrameId &&
          !exp.participatingSoulFrameIds.includes(sourceSoulFrameId)
        ) {
          throw new Error(
            `Experience with ID ${id} does not belong to source SoulFrame ${sourceSoulFrameId}`
          );
        }
        return exp;
      })
    );

    // Calculate compatibility scores
    const compatibilityScores = await Promise.all(
      experiences.map((exp) =>
        this.assessTransferCompatibility(exp.id, targetSoulFrameId)
      )
    );

    const averageCompatibility =
      compatibilityScores.reduce((sum, score) => sum + score, 0) /
      compatibilityScores.length;

    // Only proceed if average compatibility meets threshold
    if (averageCompatibility < this.config.transferCompatibilityThreshold) {
      throw new Error(
        `Knowledge transfer compatibility score ${averageCompatibility} is below threshold ${this.config.transferCompatibilityThreshold}`
      );
    }

    // Create adaptations for each experience
    const adaptations = experiences.map((exp) => ({
      originalInsight: exp.content.insights[0] || '',
      adaptedInsight: this.adaptInsightForTarget(exp, targetSoulFrame),
      adaptationRationale: `Adapted for ${targetSoulFrame.name}'s context and capabilities`,
    }));

    // Create the knowledge transfer record
    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const transfer: KnowledgeTransfer = {
      id: transferId,
      timestamp: new Date(),
      sourceSoulFrameId,
      targetSoulFrameId,
      experienceIds,
      adaptations,
      transferMetrics: {
        compatibilityScore: averageCompatibility,
        integrationSuccess: 0.9, // Placeholder - would be determined by actual integration results
        performanceImpact: 0.5, // Placeholder - would be measured over time
      },
    };

    // Store the transfer
    this.knowledgeTransfers.set(transferId, transfer);

    // Record in the Codalogue Ledger
    await this.recordTransferInLedger(transfer);

    return transfer;
  }

  async getKnowledgeTransfers(
    soulFrameId: SoulFrameId
  ): Promise<KnowledgeTransfer[]> {
    return Array.from(this.knowledgeTransfers.values()).filter(
      (transfer) =>
        transfer.sourceSoulFrameId === soulFrameId ||
        transfer.targetSoulFrameId === soulFrameId
    );
  }

  async assessTransferCompatibility(
    experienceId: string,
    targetSoulFrameId: SoulFrameId
  ): Promise<number> {
    const experience = await this.getExperience(experienceId);
    if (!experience) {
      throw new Error(`Experience with ID ${experienceId} not found`);
    }

    const targetSoulFrame =
      await this.soulFrameManager.getSoulFrame(targetSoulFrameId);
    if (!targetSoulFrame) {
      throw new Error(
        `Target SoulFrame with ID ${targetSoulFrameId} not found`
      );
    }

    // In a real implementation, this would use more sophisticated compatibility metrics
    // For now, we'll use a simplified approach

    // Check if target has participated in similar experiences
    const hasRelatedExperience = Array.from(this.experiences.values()).some(
      (exp) =>
        exp.originatingSoulFrameId === targetSoulFrameId &&
        exp.type === experience.type
    );

    // Check emotional resonance if available
    let emotionalCompatibility = 0.5; // Default neutral value
    if (this.emotionalResonanceIndex) {
      try {
        const resonance = await this.emotionalResonanceIndex.getResonanceScore(
          experience.originatingSoulFrameId,
          targetSoulFrameId
        );
        emotionalCompatibility = (resonance + 1) / 2; // Convert from [-1,1] to [0,1]
      } catch (err) {
        console.warn('Could not get emotional resonance:', err);
      }
    }

    // Calculate overall compatibility
    const baseCompatibility = 0.7; // Base compatibility score
    const relatedExperienceBonus = hasRelatedExperience ? 0.2 : 0;
    const transferabilityFactor = experience.metadata.transferability;

    return Math.min(
      1.0,
      baseCompatibility +
        relatedExperienceBonus +
        (emotionalCompatibility - 0.5) * 0.4 +
        (transferabilityFactor - 0.5) * 0.4
    );
  }

  async generateCollectiveInsights(
    experienceIds?: string[]
  ): Promise<CollectiveInsight[]> {
    // If specific experience IDs are provided, use those; otherwise, use all high-significance experiences
    const experiences = experienceIds
      ? await Promise.all(experienceIds.map((id) => this.getExperience(id)))
      : Array.from(this.experiences.values()).filter(
          (exp) =>
            exp.metadata.significance >= 0.7 &&
            exp.metadata.confidence >= this.config.minimumConfidenceThreshold
        );

    // Filter out any null experiences (in case some IDs were invalid)
    const validExperiences = experiences.filter(
      (exp) => exp !== null
    ) as LearningExperience[];

    if (validExperiences.length < 2) {
      // Need at least 2 experiences to generate collective insights
      return [];
    }

    // Group experiences by type for pattern recognition
    const experiencesByType = validExperiences.reduce(
      (groups, exp) => {
        if (!groups[exp.type]) {
          groups[exp.type] = [];
        }
        groups[exp.type].push(exp);
        return groups;
      },
      {} as Record<ExperienceType, LearningExperience[]>
    );

    const insights: CollectiveInsight[] = [];

    // Generate insights for each experience type with sufficient examples
    for (const [type, typeExperiences] of Object.entries(experiencesByType)) {
      if (typeExperiences.length >= 3) {
        // Need at least 3 of the same type for meaningful patterns
        const insight = await this.generateInsightForExperienceType(
          type as ExperienceType,
          typeExperiences
        );
        insights.push(insight);
      }
    }

    // Look for cross-type patterns if we have diverse experiences
    if (Object.keys(experiencesByType).length >= 2) {
      const crossTypeInsight =
        await this.generateCrossTypeInsight(validExperiences);
      insights.push(crossTypeInsight);
    }

    // Store the generated insights
    for (const insight of insights) {
      this.collectiveInsights.set(insight.id, insight);
    }

    // Record insights in the Codalogue Ledger
    await Promise.all(
      insights.map((insight) => this.recordInsightInLedger(insight))
    );

    return insights;
  }

  async getCollectiveInsight(
    insightId: string
  ): Promise<CollectiveInsight | null> {
    return this.collectiveInsights.get(insightId) || null;
  }

  async queryCollectiveInsights(
    filters: Partial<{
      contributingSoulFrameIds: SoulFrameId[];
      minConfidence: number;
      minSignificance: number;
      tags: string[];
      dateRange: { start: Date; end: Date };
    }>
  ): Promise<CollectiveInsight[]> {
    return Array.from(this.collectiveInsights.values()).filter((insight) => {
      // Filter by contributing SoulFrames
      if (
        filters.contributingSoulFrameIds &&
        !filters.contributingSoulFrameIds.some((id) =>
          insight.contributingSoulFrameIds.includes(id)
        )
      ) {
        return false;
      }

      // Filter by confidence
      if (
        filters.minConfidence !== undefined &&
        insight.metadata.confidence < filters.minConfidence
      ) {
        return false;
      }

      // Filter by significance
      if (
        filters.minSignificance !== undefined &&
        insight.metadata.significance < filters.minSignificance
      ) {
        return false;
      }

      // Filter by tags
      if (
        filters.tags &&
        !filters.tags.some((tag) => insight.metadata.tags.includes(tag))
      ) {
        return false;
      }

      // Filter by date range
      if (filters.dateRange) {
        if (
          insight.timestamp < filters.dateRange.start ||
          insight.timestamp > filters.dateRange.end
        ) {
          return false;
        }
      }

      return true;
    });
  }

  async generateEvolutionProposalsFromInsights(
    insightIds: string[]
  ): Promise<EvolutionProposal[]> {
    // This would integrate with the Evolution Proposal Pipeline
    // For now, we'll return a placeholder implementation

    const insights = await Promise.all(
      insightIds.map((id) => this.getCollectiveInsight(id))
    );

    const validInsights = insights.filter(
      (insight) => insight !== null
    ) as CollectiveInsight[];

    // In a real implementation, this would generate actual evolution proposals
    return validInsights.map((insight) => ({
      id: `proposal_from_insight_${insight.id}`,
      title: `Evolution based on insight: ${insight.title}`,
      description: insight.description,
      proposedChanges: insight.content.recommendations.map((rec) => ({
        type: 'recommendation',
        description: rec,
      })),
      metadata: {
        source: 'meta_learning',
        confidence: insight.metadata.confidence,
        priority: insight.metadata.significance,
        tags: insight.metadata.tags,
      },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as unknown as EvolutionProposal[];
  }

  async analyzeEmotionalImpact(
    experienceId: string
  ): Promise<Record<SoulFrameId, number>> {
    if (!this.emotionalResonanceIndex) {
      throw new Error('Emotional Resonance Index is not available');
    }

    const experience = await this.getExperience(experienceId);
    if (!experience) {
      throw new Error(`Experience with ID ${experienceId} not found`);
    }

    // In a real implementation, this would analyze how the experience affects emotional resonance
    // For now, we'll return a placeholder implementation

    const allSoulFrameIds = await this.soulFrameManager.getAllSoulFrameIds();
    const result: Record<SoulFrameId, number> = {};

    for (const id of allSoulFrameIds) {
      if (id === experience.originatingSoulFrameId) {
        result[id] = 0.8; // Positive impact on originating SoulFrame
      } else if (experience.participatingSoulFrameIds.includes(id)) {
        result[id] = 0.6; // Moderate positive impact on participating SoulFrames
      } else {
        // For other SoulFrames, impact depends on their resonance with the originating SoulFrame
        try {
          const resonance =
            await this.emotionalResonanceIndex.getResonanceScore(
              experience.originatingSoulFrameId,
              id
            );
          result[id] = (resonance + 1) * 0.3; // Scale from [-1,1] to [0,0.6]
        } catch (err) {
          result[id] = 0.3; // Default neutral impact
        }
      }
    }

    return result;
  }

  getConfig(): CrossAgentMetaLearningConfig {
    return { ...this.config };
  }

  async updateConfig(
    config: Partial<CrossAgentMetaLearningConfig>
  ): Promise<void> {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...config };

    // Handle changes to insight generation frequency
    if (
      config.insightGenerationFrequency !== undefined &&
      config.insightGenerationFrequency !== oldConfig.insightGenerationFrequency
    ) {
      // Clear existing interval
      if (this.insightGenerationInterval) {
        clearInterval(this.insightGenerationInterval);
        this.insightGenerationInterval = undefined;
      }

      // Set up new interval if frequency is positive
      if (this.config.insightGenerationFrequency > 0) {
        this.insightGenerationInterval = setInterval(
          () =>
            this.generateCollectiveInsights().catch((err) =>
              console.error('Error generating insights:', err)
            ),
          this.config.insightGenerationFrequency
        );
      }
    }

    // Handle changes to experience archive capacity
    if (
      config.experienceArchiveCapacity !== undefined &&
      config.experienceArchiveCapacity < oldConfig.experienceArchiveCapacity &&
      this.experiences.size > config.experienceArchiveCapacity
    ) {
      this.pruneExperienceArchive();
    }
  }

  // Private helper methods

  private async loadExistingExperiences(): Promise<void> {
    // In a real implementation, this would load experiences from persistent storage
    // For now, we'll just initialize with an empty set
  }

  private pruneExperienceArchive(): void {
    // If we're over capacity, remove the oldest and least significant experiences
    const excessCount =
      this.experiences.size - this.config.experienceArchiveCapacity;
    if (excessCount <= 0) return;

    // Sort experiences by a combination of age and significance
    const sortedExperiences = Array.from(this.experiences.values()).sort(
      (a, b) => {
        // Older experiences get a higher score (more likely to be removed)
        const ageScoreA =
          (Date.now() - a.timestamp.getTime()) / (24 * 60 * 60 * 1000); // Age in days
        const ageScoreB =
          (Date.now() - b.timestamp.getTime()) / (24 * 60 * 60 * 1000);

        // Less significant experiences get a higher score
        const significanceScoreA = 1 - a.metadata.significance;
        const significanceScoreB = 1 - b.metadata.significance;

        // Combined score (70% age, 30% significance)
        const scoreA = ageScoreA * 0.7 + significanceScoreA * 0.3;
        const scoreB = ageScoreB * 0.7 + significanceScoreB * 0.3;

        return scoreB - scoreA; // Higher score means more likely to keep
      }
    );

    // Remove the excess experiences
    for (let i = 0; i < excessCount; i++) {
      if (i < sortedExperiences.length) {
        this.experiences.delete(sortedExperiences[i].id);
      }
    }
  }

  private async autoShareExperience(
    experience: LearningExperience
  ): Promise<void> {
    // Find compatible SoulFrames to share with
    const allSoulFrameIds = await this.soulFrameManager.getAllSoulFrameIds();
    const potentialTargets = allSoulFrameIds.filter(
      (id) =>
        id !== experience.originatingSoulFrameId &&
        !experience.participatingSoulFrameIds.includes(id)
    );

    // Assess compatibility with each potential target
    const compatibilityScores = await Promise.all(
      potentialTargets.map(async (id) => {
        try {
          const score = await this.assessTransferCompatibility(
            experience.id,
            id
          );
          return { id, score };
        } catch (err) {
          console.warn(
            `Could not assess compatibility with SoulFrame ${id}:`,
            err
          );
          return { id, score: 0 };
        }
      })
    );

    // Share with compatible targets
    const compatibleTargets = compatibilityScores
      .filter(
        ({ score }) => score >= this.config.transferCompatibilityThreshold
      )
      .map(({ id }) => id);

    for (const targetId of compatibleTargets) {
      try {
        await this.transferKnowledge(
          experience.originatingSoulFrameId,
          targetId,
          [experience.id]
        );
      } catch (err) {
        console.warn(
          `Could not auto-share experience with SoulFrame ${targetId}:`,
          err
        );
      }
    }
  }

  private adaptInsightForTarget(
    experience: LearningExperience,
    targetSoulFrame: SoulFrame
  ): string {
    // In a real implementation, this would adapt the insight to the target SoulFrame's context
    // For now, we'll use a simple approach

    const originalInsight = experience.content.insights[0] || '';
    return `Adapted for ${targetSoulFrame.name}: ${originalInsight}`;
  }

  private async generateInsightForExperienceType(
    type: ExperienceType,
    experiences: LearningExperience[]
  ): Promise<CollectiveInsight> {
    // In a real implementation, this would use more sophisticated pattern recognition
    // For now, we'll use a simplified approach

    const insightId = `insight_${type}_${Date.now()}`;
    const contributingSoulFrameIds = new Set<SoulFrameId>();
    const experienceIds = experiences.map((exp) => {
      contributingSoulFrameIds.add(exp.originatingSoulFrameId);
      exp.participatingSoulFrameIds.forEach((id) =>
        contributingSoulFrameIds.add(id)
      );
      return exp.id;
    });

    // Extract common themes from insights
    const allInsights = experiences.flatMap((exp) => exp.content.insights);
    const commonThemes = this.extractCommonThemes(allInsights);

    // Calculate average confidence and significance
    const avgConfidence =
      experiences.reduce((sum, exp) => sum + exp.metadata.confidence, 0) /
      experiences.length;
    const avgSignificance =
      experiences.reduce((sum, exp) => sum + exp.metadata.significance, 0) /
      experiences.length;

    // Generate recommendations based on common themes
    const recommendations = commonThemes.map(
      (theme) =>
        `Based on pattern "${theme}", agents should consider implementing this insight in their operations.`
    );

    return {
      id: insightId,
      timestamp: new Date(),
      title: `Collective Insight on ${this.formatExperienceType(type)}`,
      description: `Pattern recognition across ${experiences.length} ${this.formatExperienceType(type)} experiences`,
      contributingExperienceIds: experienceIds,
      contributingSoulFrameIds: Array.from(contributingSoulFrameIds),
      synthesisMethod: 'pattern_recognition',
      content: {
        insight: `When engaging in ${this.formatExperienceType(type)}, the collective experience suggests: ${commonThemes.join('; ')}`,
        supportingEvidence: experiences
          .map((exp) => exp.content.description)
          .slice(0, 3),
        counterEvidence: [],
        implications: [
          `Improved efficiency in ${this.formatExperienceType(type)} scenarios`,
          `Enhanced collective intelligence through shared understanding`,
        ],
        recommendations,
      },
      metadata: {
        confidence: avgConfidence * 0.9, // Slightly lower confidence for collective insights
        significance: avgSignificance * 1.2, // Higher significance due to collective nature
        novelty: 0.7, // Moderate novelty
        tags: [type, 'collective_insight', 'pattern_recognition'],
      },
    };
  }

  private async generateCrossTypeInsight(
    experiences: LearningExperience[]
  ): Promise<CollectiveInsight> {
    // In a real implementation, this would use more sophisticated cross-pattern recognition
    // For now, we'll use a simplified approach

    const insightId = `insight_cross_type_${Date.now()}`;
    const contributingSoulFrameIds = new Set<SoulFrameId>();
    const experienceIds = experiences.map((exp) => {
      contributingSoulFrameIds.add(exp.originatingSoulFrameId);
      exp.participatingSoulFrameIds.forEach((id) =>
        contributingSoulFrameIds.add(id)
      );
      return exp.id;
    });

    // Extract experience types
    const types = new Set(experiences.map((exp) => exp.type));

    // Calculate average confidence and significance
    const avgConfidence =
      experiences.reduce((sum, exp) => sum + exp.metadata.confidence, 0) /
      experiences.length;
    const avgSignificance =
      experiences.reduce((sum, exp) => sum + exp.metadata.significance, 0) /
      experiences.length;

    // Extract common themes across all insights
    const allInsights = experiences.flatMap((exp) => exp.content.insights);
    const commonThemes = this.extractCommonThemes(allInsights);

    return {
      id: insightId,
      timestamp: new Date(),
      title: `Cross-Domain Collective Insight`,
      description: `Emergent patterns across ${Array.from(types)
        .map((t) => this.formatExperienceType(t))
        .join(', ')} experiences`,
      contributingExperienceIds: experienceIds,
      contributingSoulFrameIds: Array.from(contributingSoulFrameIds),
      synthesisMethod: 'emergent_discovery',
      content: {
        insight: `Cross-domain analysis reveals emergent patterns: ${commonThemes.join('; ')}`,
        supportingEvidence: experiences
          .map(
            (exp) =>
              `${this.formatExperienceType(exp.type)}: ${exp.content.description}`
          )
          .slice(0, 3),
        counterEvidence: [],
        implications: [
          `Potential for cross-domain knowledge application`,
          `Emergence of higher-order patterns across experience types`,
        ],
        recommendations: [
          `Establish cross-functional knowledge sharing protocols`,
          `Develop unified approach incorporating insights from multiple domains`,
        ],
      },
      metadata: {
        confidence: avgConfidence * 0.8, // Lower confidence due to cross-domain nature
        significance: avgSignificance * 1.5, // Higher significance due to emergent nature
        novelty: 0.9, // High novelty for cross-domain insights
        tags: ['cross_domain', 'emergent_pattern', 'collective_insight'],
      },
    };
  }

  private extractCommonThemes(insights: string[]): string[] {
    // In a real implementation, this would use NLP techniques to extract common themes
    // For now, we'll use a simplified approach that just returns a placeholder
    return [
      'Consistent pattern of successful adaptation through iterative refinement',
      'Communication clarity strongly correlates with positive outcomes',
      'Proactive anticipation of needs leads to more efficient resolution',
    ];
  }

  private formatExperienceType(type: ExperienceType): string {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private async recordExperienceInLedger(
    experience: LearningExperience
  ): Promise<void> {
    try {
      await this.codalogueProtocolLedger.addEntry({
        type: 'META_LEARNING_EXPERIENCE',
        timestamp: experience.timestamp,
        data: {
          experienceId: experience.id,
          experienceType: experience.type,
          originatingSoulFrameId: experience.originatingSoulFrameId,
          description: experience.content.description,
        },
        metadata: {
          confidence: experience.metadata.confidence,
          significance: experience.metadata.significance,
        },
      });
    } catch (err) {
      console.warn('Could not record experience in ledger:', err);
    }
  }

  private async recordTransferInLedger(
    transfer: KnowledgeTransfer
  ): Promise<void> {
    try {
      await this.codalogueProtocolLedger.addEntry({
        type: 'META_LEARNING_TRANSFER',
        timestamp: transfer.timestamp,
        data: {
          transferId: transfer.id,
          sourceSoulFrameId: transfer.sourceSoulFrameId,
          targetSoulFrameId: transfer.targetSoulFrameId,
          experienceIds: transfer.experienceIds,
        },
        metadata: {
          compatibilityScore: transfer.transferMetrics.compatibilityScore,
          integrationSuccess: transfer.transferMetrics.integrationSuccess,
        },
      });
    } catch (err) {
      console.warn('Could not record transfer in ledger:', err);
    }
  }

  private async recordInsightInLedger(
    insight: CollectiveInsight
  ): Promise<void> {
    try {
      await this.codalogueProtocolLedger.addEntry({
        type: 'META_LEARNING_INSIGHT',
        timestamp: insight.timestamp,
        data: {
          insightId: insight.id,
          title: insight.title,
          description: insight.description,
          contributingExperienceIds: insight.contributingExperienceIds,
          contributingSoulFrameIds: insight.contributingSoulFrameIds,
          synthesisMethod: insight.synthesisMethod,
        },
        metadata: {
          confidence: insight.metadata.confidence,
          significance: insight.metadata.significance,
          novelty: insight.metadata.novelty,
        },
      });
    } catch (err) {
      console.warn('Could not record insight in ledger:', err);
    }
  }
}

/**
 * Factory function to create a Cross-Agent Meta-Learning system
 */
export function createCrossAgentMetaLearning(
  soulFrameManager: SoulFrameManager,
  codalogueProtocolLedger: CodalogueProtocolLedger,
  config?: Partial<CrossAgentMetaLearningConfig>,
  emotionalResonanceIndex?: EmotionalResonanceIndex
): CrossAgentMetaLearning {
  return new CrossAgentMetaLearningImpl(
    soulFrameManager,
    codalogueProtocolLedger,
    config,
    emotionalResonanceIndex
  );
}
