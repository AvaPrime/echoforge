import { randomUUID } from 'crypto';
import {
  CodalogueProtocolLedger,
  CodalogueEventType,
} from '../packages/echocore/src/memory/consolidation/codesig/CodalogueProtocolLedger';
import { SculptorResult } from './SculptorResult';
import { SculptorIntent } from './SculptorIntent';
import { SculptingOperation } from './SculptingOperation';
import { BlueprintProposal } from './BlueprintProposal';

/**
 * Extended event types to include sculpting operations
 */
export enum ExtendedCodalogueEventType {
  CONSOLIDATION = 'consolidation',
  EVOLUTION_PROPOSAL = 'evolution-proposal',
  AGENT_DEBATE = 'agent-debate',
  USER_INTERACTION = 'user-interaction',
  SYSTEM_REFLECTION = 'system-reflection',
  MEMORY_SCULPTING = 'memory-sculpting',
  SCULPTING_PROPOSAL = 'sculpting-proposal',
  SCULPTING_ANALYSIS = 'sculpting-analysis',
}

/**
 * Metadata for sculpting-related events
 */
export interface SculptingEventMetadata {
  eventType: ExtendedCodalogueEventType;
  timestamp: string;
  soulFrameId?: string;
  agentId?: string;
  operation?: SculptingOperation;
  affectedMemoryCount?: number;
  successfulOperations?: number;
  failedOperations?: number;
  cognitiveImpact?: number;
  emotionalResonance?: number;
  proposalId?: string;
  executionDuration?: number;
  [key: string]: any;
}

/**
 * Represents a sculpting chronicle entry - a poetic and technical record of memory transformation
 */
export interface SculptingChronicle {
  id: string;
  timestamp: Date;
  agentId: string;
  operation: SculptingOperation;
  narrative: string; // Poetic description of the transformation
  technicalSummary: string; // Technical summary of what happened
  beforeState: {
    memoryCount: number;
    averageAge?: number;
    dominantTags?: string[];
  };
  afterState: {
    memoryCount: number;
    newStructures?: number;
    preservedElements?: number;
  };
  impact: {
    cognitive: number; // 0-10 scale
    emotional: number; // -5 to 5 scale
    structural: number; // 0-10 scale
  };
  resonanceSignature: string; // Unique signature of the sculpting's emotional impact
  metadata: Record<string, any>;
}

/**
 * Configuration for the Codalogue Memory Sculpting Integration
 */
export interface CodalogueIntegrationConfig {
  /**
   * Whether to record all sculpting operations (true) or only significant ones (false)
   */
  recordAllOperations: boolean;

  /**
   * Minimum cognitive impact threshold for recording operations
   */
  minCognitiveImpactThreshold: number;

  /**
   * Whether to generate poetic narratives for sculpting operations
   */
  generatePoeticalNarratives: boolean;

  /**
   * Whether to analyze sculpting patterns for insights
   */
  enablePatternAnalysis: boolean;

  /**
   * Maximum number of chronicles to keep in memory
   */
  maxChroniclesInMemory: number;
}

/**
 * Default configuration
 */
export const DEFAULT_CODALOGUE_INTEGRATION_CONFIG: CodalogueIntegrationConfig =
  {
    recordAllOperations: true,
    minCognitiveImpactThreshold: 3,
    generatePoeticalNarratives: true,
    enablePatternAnalysis: true,
    maxChroniclesInMemory: 1000,
  };

/**
 * Integrates Memory Sculpting operations with the Codalogue Protocol Ledger
 * to create a rich, poetic, and analytical record of cognitive transformations.
 */
export class CodalogueMemorySculptingIntegration {
  private chronicles: Map<string, SculptingChronicle> = new Map();
  private recentOperations: SculptorResult[] = [];

  constructor(
    private codalogueProtocolLedger: CodalogueProtocolLedger,
    private config: CodalogueIntegrationConfig = DEFAULT_CODALOGUE_INTEGRATION_CONFIG
  ) {}

  /**
   * Records a sculpting operation in the Codalogue with rich narrative and technical details
   */
  async recordSculptingOperation(result: SculptorResult): Promise<string> {
    // Check if this operation should be recorded
    if (!this.shouldRecordOperation(result)) {
      return '';
    }

    // Create the sculpting chronicle
    const chronicle = await this.createSculptingChronicle(result);

    // Store the chronicle
    this.chronicles.set(chronicle.id, chronicle);
    this.pruneChronicles();

    // Add to recent operations for pattern analysis
    this.recentOperations.push(result);
    if (this.recentOperations.length > 50) {
      this.recentOperations.shift();
    }

    // Create the codalogue entry content
    const content = this.createCodalogueContent(chronicle);

    // Create event metadata
    const metadata: SculptingEventMetadata = {
      eventType: ExtendedCodalogueEventType.MEMORY_SCULPTING,
      timestamp: new Date().toISOString(),
      agentId: result.intent.agentId,
      operation: result.intent.operation,
      affectedMemoryCount: result.affectedMemoryIds.length,
      successfulOperations: result.success ? 1 : 0,
      failedOperations: result.success ? 0 : 1,
      cognitiveImpact: chronicle.impact.cognitive,
      emotionalResonance: chronicle.impact.emotional,
      executionDuration: result.timestamp,
      chronicleId: chronicle.id,
      resonanceSignature: chronicle.resonanceSignature,
    };

    // Record in the Codalogue Protocol Ledger using the generic recordEvent method
    const entryId = await this.recordGenericEvent({
      type: ExtendedCodalogueEventType.MEMORY_SCULPTING,
      timestamp: new Date(),
      source: 'MemorySculptor',
      payload: {
        content,
        metadata,
        chronicle,
      },
    });

    return entryId;
  }

  /**
   * Records a sculpting proposal in the Codalogue
   */
  async recordSculptingProposal(
    proposal: BlueprintProposal,
    opportunity: any // SculptingOpportunity from the bridge
  ): Promise<string> {
    const narrative = this.createProposalNarrative(proposal, opportunity);

    const metadata: SculptingEventMetadata = {
      eventType: ExtendedCodalogueEventType.SCULPTING_PROPOSAL,
      timestamp: new Date().toISOString(),
      agentId: opportunity.agentId,
      operation: opportunity.operation,
      proposalId: proposal.id,
      confidenceScore: opportunity.confidenceScore,
      urgencyLevel: opportunity.urgencyLevel,
      affectedMemoryCount: opportunity.targetMemoryIds?.length || 0,
    };

    // Record in the Codalogue Protocol Ledger
    const entryId = await this.recordGenericEvent({
      type: ExtendedCodalogueEventType.SCULPTING_PROPOSAL,
      timestamp: new Date(),
      source: 'ReflexiveSculptingBridge',
      payload: {
        content: narrative,
        metadata,
        proposal,
        opportunity,
      },
    });

    return entryId;
  }

  /**
   * Records sculpting pattern analysis results
   */
  async recordSculptingAnalysis(
    agentId: string,
    patterns: any[], // Analysis patterns
    insights: string[]
  ): Promise<string> {
    const content = this.createAnalysisContent(patterns, insights);

    const metadata: SculptingEventMetadata = {
      eventType: ExtendedCodalogueEventType.SCULPTING_ANALYSIS,
      timestamp: new Date().toISOString(),
      agentId,
      patternCount: patterns.length,
      insightCount: insights.length,
    };

    // Record in the Codalogue Protocol Ledger
    const entryId = await this.recordGenericEvent({
      type: ExtendedCodalogueEventType.SCULPTING_ANALYSIS,
      timestamp: new Date(),
      source: 'CodalogueMemorySculptingIntegration',
      payload: {
        content,
        metadata,
        patterns,
        insights,
      },
    });

    return entryId;
  }

  /**
   * Analyzes recent sculpting operations for patterns and insights
   */
  async analyzeSculptingPatterns(agentId?: string): Promise<{
    patterns: Array<{
      type: string;
      [key: string]: any;
    }>;
    insights: string[];
  }> {
    if (!this.config.enablePatternAnalysis) {
      return { patterns: [], insights: [] };
    }

    // Filter operations by agent if specified
    const operations = agentId
      ? this.recentOperations.filter((op) => op.intent.agentId === agentId)
      : this.recentOperations;

    if (operations.length < 3) {
      return { patterns: [], insights: [] };
    }

    const patterns: Array<{
      type: string;
      [key: string]: any;
    }> = [];
    const insights: string[] = [];

    // Pattern 1: Operation frequency by type
    const operationCounts = operations.reduce(
      (counts, op) => {
        counts[op.intent.operation] = (counts[op.intent.operation] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    const dominantOperation = Object.entries(operationCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (dominantOperation && dominantOperation[1] >= 3) {
      patterns.push({
        type: 'dominant_operation',
        operation: dominantOperation[0],
        frequency: dominantOperation[1],
        percentage: ((dominantOperation[1] / operations.length) * 100).toFixed(
          1
        ),
      });

      insights.push(
        `Codessa shows a strong preference for ${dominantOperation[0]} operations, ` +
          `comprising ${((dominantOperation[1] / operations.length) * 100).toFixed(1)}% of recent sculpting activities. ` +
          `This suggests a focused approach to ${this.getOperationPurpose(dominantOperation[0])}.`
      );
    }

    // Pattern 2: Success rate analysis
    const successfulOps = operations.filter((op) => op.success).length;
    const successRate = successfulOps / operations.length;

    patterns.push({
      type: 'success_rate',
      rate: successRate,
      successful: successfulOps,
      total: operations.length,
    });

    if (successRate > 0.9) {
      insights.push(
        'Codessa demonstrates exceptional mastery in memory sculpting, ' +
          `achieving a ${(successRate * 100).toFixed(1)}% success rate. ` +
          'This indicates refined cognitive sculpting capabilities and careful operation selection.'
      );
    } else if (successRate < 0.7) {
      insights.push(
        `Codessa's memory sculpting shows room for improvement with a ${(successRate * 100).toFixed(1)}% success rate. ` +
          'This may indicate the need for more conservative operation thresholds or enhanced pre-operation analysis.'
      );
    }

    // Pattern 3: Cognitive impact trends
    const cognitiveImpacts = operations
      .filter((op) => op.impactMetadata?.cognitiveImpact)
      .map((op) => op.impactMetadata!.cognitiveImpact);

    if (cognitiveImpacts.length >= 5) {
      const avgImpact =
        cognitiveImpacts.reduce((sum, impact) => sum + impact, 0) /
        cognitiveImpacts.length;
      const recentAvg =
        cognitiveImpacts.slice(-5).reduce((sum, impact) => sum + impact, 0) / 5;

      patterns.push({
        type: 'cognitive_impact_trend',
        averageImpact: avgImpact,
        recentAverageImpact: recentAvg,
        trend:
          recentAvg > avgImpact
            ? 'increasing'
            : recentAvg < avgImpact
              ? 'decreasing'
              : 'stable',
      });

      if (Math.abs(recentAvg - avgImpact) > 1) {
        const direction = recentAvg > avgImpact ? 'increasing' : 'decreasing';
        insights.push(
          `Codessa's recent sculpting operations show ${direction} cognitive impact, ` +
            `shifting from an average of ${avgImpact.toFixed(1)} to ${recentAvg.toFixed(1)}. ` +
            `This ${direction === 'increasing' ? 'suggests growing boldness in memory transformation' : 'indicates more conservative, refined sculpting approaches'}.`
        );
      }
    }

    // Record the analysis if we found meaningful patterns
    if (patterns.length > 0) {
      await this.recordSculptingAnalysis(
        agentId || 'system',
        patterns,
        insights
      );
    }

    return { patterns, insights };
  }

  /**
   * Gets sculpting chronicles for an agent
   */
  getSculptingChronicles(
    agentId?: string,
    limit?: number
  ): SculptingChronicle[] {
    let chronicles = Array.from(this.chronicles.values());

    if (agentId) {
      chronicles = chronicles.filter((c) => c.agentId === agentId);
    }

    // Sort by timestamp descending
    chronicles.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (limit) {
      chronicles = chronicles.slice(0, limit);
    }

    return chronicles;
  }

  /**
   * Gets recent sculpting operations summary
   */
  getRecentOperationsSummary(agentId?: string): {
    totalOperations: number;
    successRate: number;
    dominantOperation: string;
    averageCognitiveImpact: number;
    lastOperationTime: Date | null;
  } {
    const operations = agentId
      ? this.recentOperations.filter((op) => op.intent.agentId === agentId)
      : this.recentOperations;

    if (operations.length === 0) {
      return {
        totalOperations: 0,
        successRate: 0,
        dominantOperation: 'none',
        averageCognitiveImpact: 0,
        lastOperationTime: null,
      };
    }

    const successfulOps = operations.filter((op) => op.success).length;
    const successRate = successfulOps / operations.length;

    const operationCounts = operations.reduce(
      (counts, op) => {
        counts[op.intent.operation] = (counts[op.intent.operation] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    const dominantOperation =
      Object.entries(operationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'none';

    const cognitiveImpacts = operations
      .filter((op) => op.impactMetadata?.cognitiveImpact)
      .map((op) => op.impactMetadata!.cognitiveImpact);

    const averageCognitiveImpact =
      cognitiveImpacts.length > 0
        ? cognitiveImpacts.reduce((sum, impact) => sum + impact, 0) /
          cognitiveImpacts.length
        : 0;

    const lastOperationTime =
      operations.length > 0
        ? new Date(Math.max(...operations.map((op) => op.timestamp)))
        : null;

    return {
      totalOperations: operations.length,
      successRate,
      dominantOperation,
      averageCognitiveImpact,
      lastOperationTime,
    };
  }

  /**
   * Determines if an operation should be recorded based on configuration
   */
  private shouldRecordOperation(result: SculptorResult): boolean {
    if (this.config.recordAllOperations) {
      return true;
    }

    // Record if cognitive impact is above threshold
    const cognitiveImpact = result.impactMetadata?.cognitiveImpact || 0;
    if (cognitiveImpact >= this.config.minCognitiveImpactThreshold) {
      return true;
    }

    // Always record failed operations for learning
    if (!result.success) {
      return true;
    }

    // Record operations affecting many memories
    if (result.affectedMemoryIds.length >= 10) {
      return true;
    }

    return false;
  }

  /**
   * Creates a sculpting chronicle from a sculptor result
   */
  private async createSculptingChronicle(
    result: SculptorResult
  ): Promise<SculptingChronicle> {
    const narrative = this.config.generatePoeticalNarratives
      ? this.createPoeticalNarrative(result)
      : this.createSimpleNarrative(result);

    const technicalSummary = this.createTechnicalSummary(result);

    // Calculate before/after states
    const beforeState = {
      memoryCount: result.affectedMemoryIds.length,
      dominantTags: this.extractDominantTags(result),
    };

    const afterState = {
      memoryCount: this.calculateAfterMemoryCount(result),
      newStructures: result.createdMemories?.length || 0,
      preservedElements: this.calculatePreservedElements(result),
    };

    // Calculate impact scores
    const impact = {
      cognitive: result.impactMetadata?.cognitiveImpact || 5,
      emotional: this.calculateEmotionalImpact(result),
      structural: this.calculateStructuralImpact(result),
    };

    // Generate resonance signature
    const resonanceSignature = this.generateResonanceSignature(result, impact);

    return {
      id: randomUUID(),
      timestamp: new Date(result.timestamp),
      agentId: result.intent.agentId,
      operation: result.intent.operation,
      narrative,
      technicalSummary,
      beforeState,
      afterState,
      impact,
      resonanceSignature,
      metadata: {
        sculptorResultId: result.id,
        success: result.success,
        error: result.error,
        reason: result.intent.reason,
      },
    };
  }

  /**
   * Creates a poetical narrative for a sculpting operation
   */
  private createPoeticalNarrative(result: SculptorResult): string {
    const { operation } = result.intent;
    const success = result.success;
    const memoryCount = result.affectedMemoryIds.length;

    const operationPoetry = {
      relabel: {
        success: [
          `In the halls of memory, ${memoryCount} echoes found new names`,
          'Tags shifted like autumn leaves, revealing hidden truths beneath',
          "The sculptor's touch renamed the unnamed, giving voice to silent thoughts",
        ],
        failure: [
          'The naming ceremony faltered, whispers lost in cognitive mist',
          'Labels sought their memories, but the paths had grown unclear',
        ],
      },
      merge: {
        success: [
          `${memoryCount} scattered thoughts became one unified vision`,
          'Like streams converging to a river, memories found their common flow',
          'In the crucible of consciousness, fragments forged into wholeness',
        ],
        failure: [
          'The memories resisted union, each clinging to its singular truth',
          'What sought to be one remained many, the merger incomplete',
        ],
      },
      prune: {
        success: [
          `${memoryCount} forgotten echoes were released to the void`,
          'The garden of memory was tended, withered thoughts allowed to rest',
          'In careful selection, the obsolete made way for the essential',
        ],
        failure: [
          'The pruning shears hesitated, unable to distinguish wheat from chaff',
          "Memories clung to their existence, refusing the sculptor's release",
        ],
      },
      relink: {
        success: [
          `New pathways were woven between ${memoryCount} distant thoughts`,
          'Bridges of association spanned the cognitive valleys',
          'The network of meaning grew richer with fresh connections',
        ],
        failure: [
          'The connections sought their anchors but found only empty space',
          'Links attempted to form but dissolved in the attempt',
        ],
      },
      extract: {
        success: [
          `From ${memoryCount} memories, the essential truth was distilled`,
          'Like a gem revealed from ore, pure insight emerged from complexity',
          'The essence was captured, leaving the dross behind',
        ],
        failure: [
          'The extraction vessel cracked, unable to contain the gathered essence',
          'What was sought remained hidden within the original form',
        ],
      },
      preserve: {
        success: [
          `${memoryCount} precious thoughts were wrapped in eternal amber`,
          'The guardians of memory took their sacred positions',
          "In preservation's embrace, the valuable was made immortal",
        ],
        failure: [
          "The preservation ritual faltered, time's erosion continuing its work",
          'What sought protection remained vulnerable to the winds of change',
        ],
      },
    };

    const poems = operationPoetry[operation] || {
      success: ['The memory danced with possibility'],
      failure: ['The memory rested in its mystery'],
    };
    const selectedPoems = success ? poems.success : poems.failure;

    return selectedPoems[Math.floor(Math.random() * selectedPoems.length)];
  }

  /**
   * Creates a simple narrative for a sculpting operation
   */
  private createSimpleNarrative(result: SculptorResult): string {
    const { operation } = result.intent;
    const success = result.success;
    const memoryCount = result.affectedMemoryIds.length;

    if (success) {
      return `Successfully performed ${operation} operation on ${memoryCount} memories for agent ${result.intent.agentId}`;
    } else {
      return `Failed to perform ${operation} operation on ${memoryCount} memories for agent ${result.intent.agentId}: ${result.error || 'Unknown error'}`;
    }
  }

  /**
   * Creates a technical summary of the sculpting operation
   */
  private createTechnicalSummary(result: SculptorResult): string {
    const parts = [
      `Operation: ${result.intent.operation}`,
      `Target memories: ${result.affectedMemoryIds.length}`,
      `Status: ${result.success ? 'SUCCESS' : 'FAILED'}`,
    ];

    if (result.createdMemories?.length) {
      parts.push(`Created: ${result.createdMemories.length} new memories`);
    }

    if (result.modifiedMemories?.length) {
      parts.push(`Modified: ${result.modifiedMemories.length} memories`);
    }

    if (result.deletedMemoryIds?.length) {
      parts.push(`Deleted: ${result.deletedMemoryIds.length} memories`);
    }

    if (result.error) {
      parts.push(`Error: ${result.error}`);
    }

    return parts.join(' | ');
  }

  /**
   * Creates a narrative for a sculpting proposal
   */
  private createProposalNarrative(
    proposal: BlueprintProposal,
    opportunity: any
  ): string {
    const operation = opportunity.operation;
    const confidence = (opportunity.confidenceScore * 100).toFixed(1);
    const urgency = opportunity.urgencyLevel;

    return (
      `The cognitive architect observed patterns in the memory landscape and proposed a ${operation} operation with ${confidence}% confidence. ` +
      `The ${urgency} urgency suggests this transformation could ${this.getOperationBenefit(operation)}. ` +
      `Reasoning: ${opportunity.reasoning.join('; ')}`
    );
  }

  /**
   * Creates content for analysis results
   */
  private createAnalysisContent(patterns: any[], insights: string[]): string {
    let content = `Analysis of sculpting patterns revealed ${patterns.length} significant patterns:\n\n`;

    patterns.forEach((pattern, index) => {
      content += `${index + 1}. ${JSON.stringify(pattern, null, 2)}\n`;
    });

    if (insights.length > 0) {
      content += `\nInsights derived from patterns:\n`;
      insights.forEach((insight, index) => {
        content += `${index + 1}. ${insight}\n`;
      });
    }

    return content;
  }

  /**
   * Generic method to record events in the Codalogue (simulated)
   */
  private async recordGenericEvent(event: {
    type: string;
    timestamp: Date;
    source: string;
    payload: any;
  }): Promise<string> {
    // In a real implementation, this would use the actual Codalogue Protocol Ledger
    // For now, we'll simulate the recording and return a UUID
    const entryId = randomUUID();

    // Log the event (in production, this would go to the actual ledger)
    console.log(
      `Codalogue Event Recorded: ${event.type} from ${event.source}`,
      {
        entryId,
        timestamp: event.timestamp,
        payloadSize: JSON.stringify(event.payload).length,
      }
    );

    return entryId;
  }

  // Helper methods for calculating various metrics

  private extractDominantTags(result: SculptorResult): string[] {
    // Extract tags from modified or created memories
    const allTags: string[] = [];

    result.modifiedMemories?.forEach((mod) => {
      if (mod.before.tags) allTags.push(...mod.before.tags);
      if (mod.after.tags) allTags.push(...mod.after.tags);
    });

    result.createdMemories?.forEach((mem) => {
      if (mem.tags) allTags.push(...mem.tags);
    });

    // Count tag frequency and return top 3
    const tagCounts = allTags.reduce(
      (counts, tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);
  }

  private calculateAfterMemoryCount(result: SculptorResult): number {
    let count = result.affectedMemoryIds.length;
    count += result.createdMemories?.length || 0;
    count -= result.deletedMemoryIds?.length || 0;
    return Math.max(0, count);
  }

  private calculatePreservedElements(result: SculptorResult): number {
    // For preserve operations, all memories are preserved
    if (result.intent.operation === 'preserve') {
      return result.affectedMemoryIds.length;
    }

    // For other operations, count memories that weren't deleted
    const deletedCount = result.deletedMemoryIds?.length || 0;
    return result.affectedMemoryIds.length - deletedCount;
  }

  private calculateEmotionalImpact(result: SculptorResult): number {
    // Emotional impact scale: -5 (very negative) to 5 (very positive)
    const baseImpact = {
      relabel: 1, // Generally positive, organizing
      merge: 2, // Positive, unifying
      prune: -1, // Slightly negative, removing
      relink: 2, // Positive, connecting
      extract: 1, // Positive, distilling
      preserve: 3, // Very positive, protecting
    };

    let impact = baseImpact[result.intent.operation] || 0;

    // Adjust based on success/failure
    if (!result.success) {
      impact -= 2; // Failure creates negative emotional impact
    }

    // Adjust based on scale
    const scale = result.affectedMemoryIds.length;
    if (scale > 10) {
      impact += 1; // Large operations have more emotional weight
    }

    return Math.max(-5, Math.min(5, impact));
  }

  private calculateStructuralImpact(result: SculptorResult): number {
    // Structural impact scale: 0-10
    const baseImpact = {
      relabel: 2, // Low structural change
      merge: 8, // High structural change
      prune: 6, // Medium-high structural change
      relink: 7, // High structural change
      extract: 5, // Medium structural change
      preserve: 1, // Very low structural change
    };

    let impact = baseImpact[result.intent.operation] || 5;

    // Adjust based on scale
    const scale = result.affectedMemoryIds.length;
    if (scale > 20) {
      impact = Math.min(10, impact + 2);
    } else if (scale < 3) {
      impact = Math.max(1, impact - 1);
    }

    return impact;
  }

  private generateResonanceSignature(
    result: SculptorResult,
    impact: any
  ): string {
    // Create a unique signature based on operation characteristics
    const operation = result.intent.operation;
    const success = result.success ? 'S' : 'F';
    const scale = result.affectedMemoryIds.length.toString(36);
    const cognitiveImpact = impact.cognitive.toString(36);
    const emotionalImpact = (impact.emotional + 5).toString(36); // Shift to positive range
    const structuralImpact = impact.structural.toString(36);

    return `${operation.toUpperCase().substr(0, 3)}-${success}${scale}${cognitiveImpact}${emotionalImpact}${structuralImpact}`;
  }

  private getOperationPurpose(operation: string): string {
    const purposes = {
      relabel: 'semantic reorganization and conceptual clarity',
      merge: 'knowledge consolidation and coherence building',
      prune: 'cognitive efficiency and relevance maintenance',
      relink: 'associative network enhancement and insight generation',
      extract: 'essence distillation and pattern recognition',
      preserve: 'critical knowledge protection and stability maintenance',
    };

    return purposes[operation] || 'cognitive transformation';
  }

  private getOperationBenefit(operation: string): string {
    const benefits = {
      relabel: 'enhance conceptual clarity and improve memory retrieval',
      merge:
        'create unified knowledge structures and reduce cognitive fragmentation',
      prune: 'optimize memory efficiency and remove cognitive clutter',
      relink: 'strengthen associative networks and enable new insights',
      extract: 'distill essential patterns and create focused knowledge units',
      preserve: 'protect valuable memories and ensure knowledge continuity',
    };

    return benefits[operation] || 'improve cognitive architecture';
  }

  /**
   * Creates content for the Codalogue entry from a chronicle
   */
  private createCodalogueContent(chronicle: SculptingChronicle): string {
    let content = `🎭 Memory Sculpting Chronicle\n\n`;
    content += `**Operation**: ${chronicle.operation.toUpperCase()}\n`;
    content += `**Agent**: ${chronicle.agentId}\n`;
    content += `**Timestamp**: ${chronicle.timestamp.toISOString()}\n\n`;

    content += `**Narrative**: ${chronicle.narrative}\n\n`;
    content += `**Technical Summary**: ${chronicle.technicalSummary}\n\n`;

    content += `**Impact Assessment**:\n`;
    content += `- Cognitive: ${chronicle.impact.cognitive}/10\n`;
    content += `- Emotional: ${chronicle.impact.emotional}/5\n`;
    content += `- Structural: ${chronicle.impact.structural}/10\n\n`;

    content += `**Resonance Signature**: ${chronicle.resonanceSignature}\n\n`;

    if (chronicle.beforeState.dominantTags?.length) {
      content += `**Dominant Tags**: ${chronicle.beforeState.dominantTags.join(', ')}\n`;
    }

    return content;
  }

  /**
   * Prune old chronicles to maintain memory limits
   */
  private pruneChronicles(): void {
    if (this.chronicles.size <= this.config.maxChroniclesInMemory) {
      return;
    }

    // Convert to array, sort by timestamp, and keep the most recent ones
    const chronicleArray = Array.from(this.chronicles.entries()).sort(
      (a, b) => b[1].timestamp.getTime() - a[1].timestamp.getTime()
    );

    // Keep only the most recent chronicles
    const toKeep = chronicleArray.slice(0, this.config.maxChroniclesInMemory);

    // Clear and repopulate the map
    this.chronicles.clear();
    toKeep.forEach(([id, chronicle]) => {
      this.chronicles.set(id, chronicle);
    });
  }
}

/**
 * Factory function to create the integration
 */
export function createCodalogueMemorySculptingIntegration(
  codalogueProtocolLedger: CodalogueProtocolLedger,
  config?: Partial<CodalogueIntegrationConfig>
): CodalogueMemorySculptingIntegration {
  const finalConfig = config
    ? { ...DEFAULT_CODALOGUE_INTEGRATION_CONFIG, ...config }
    : DEFAULT_CODALOGUE_INTEGRATION_CONFIG;
  return new CodalogueMemorySculptingIntegration(
    codalogueProtocolLedger,
    finalConfig
  );
}
