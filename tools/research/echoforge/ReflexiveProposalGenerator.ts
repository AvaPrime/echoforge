import { randomUUID } from 'crypto';
import { BlueprintProposal } from './BlueprintProposal';
import { SculptorIntent } from './SculptorIntent';
import { SculptingOperation } from './SculptingOperation';
import { MemoryEntry } from '../packages/echocore/src/memory/MemoryContract';

/**
 * Context for generating sculpting proposals
 */
export interface ProposalContext {
  agentId: string;
  memoryLandscape: {
    totalMemories: number;
    memoryTypes: Record<string, number>;
    averageAge: number;
    tagDistribution: Record<string, number>;
    recentActivity: number; // 0-1 scale
  };
  historicalPatterns: {
    successfulOperations: Record<SculptingOperation, number>;
    failedOperations: Record<SculptingOperation, number>;
    preferredOperations: SculptingOperation[];
    riskTolerance: number; // 0-1 scale
  };
  currentGoals: {
    primaryObjective: string;
    purposeAlignment: number;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    resourceConstraints: number; // 0-1 scale
  };
  emotionalState: {
    currentResonance: number; // -1 to 1
    stability: number; // 0-1 scale
    creativity: number; // 0-1 scale
    confidence: number; // 0-1 scale
  };
}

/**
 * A proposal strategy defines how to generate proposals for specific scenarios
 */
export interface ProposalStrategy {
  id: string;
  name: string;
  description: string;
  applicableOperations: SculptingOperation[];

  /**
   * Check if this strategy applies to the given context
   */
  isApplicable(
    context: ProposalContext,
    targetMemories: MemoryEntry[]
  ): boolean;

  /**
   * Generate a proposal using this strategy
   */
  generateProposal(
    context: ProposalContext,
    targetMemories: MemoryEntry[],
    operation: SculptingOperation
  ): BlueprintProposal;

  /**
   * Calculate confidence in this strategy for the given context
   */
  calculateConfidence(
    context: ProposalContext,
    targetMemories: MemoryEntry[]
  ): number;
}

/**
 * Conservative strategy for low-risk, high-confidence operations
 */
export class ConservativeStrategy implements ProposalStrategy {
  id = 'conservative';
  name = 'Conservative Sculpting';
  description = 'Low-risk operations with high success probability';
  applicableOperations: SculptingOperation[] = [
    'relabel',
    'preserve',
    'extract',
  ];

  isApplicable(
    context: ProposalContext,
    targetMemories: MemoryEntry[]
  ): boolean {
    return (
      context.historicalPatterns.riskTolerance < 0.5 ||
      context.emotionalState.confidence < 0.6 ||
      targetMemories.length <= 5
    );
  }

  generateProposal(
    context: ProposalContext,
    targetMemories: MemoryEntry[],
    operation: SculptingOperation
  ): BlueprintProposal {
    return {
      id: randomUUID(),
      timestamp: new Date(),
      proposedBy: 'ReflexiveProposalGenerator:Conservative',
      targetComponent: 'memory',
      changeType: 'modify',
      specification: {
        path: `memory.sculpting.${operation}`,
        data: {
          targetMemoryIds: targetMemories.map((m) => m.id),
          operation,
          conservativeMode: true,
          backupRequired: true,
        },
        metadata: {
          strategy: 'conservative',
          confidence: this.calculateConfidence(context, targetMemories),
          estimatedImpact: Math.min(5, targetMemories.length * 0.5),
        },
      },
      priority: 0.4, // Lower priority for conservative operations
      riskLevel: 'safe',
      purposeAlignment: Math.min(
        0.9,
        context.currentGoals.purposeAlignment + 0.1
      ),
      emotionalResonance: {
        expectedImpact: 0.1, // Minimal emotional impact
        affectedPairs: [],
      },
      rollbackPlan: {
        strategy: 'revert',
        steps: [
          'Create complete backup before operation',
          'Monitor for unexpected changes',
          'Restore from backup if needed',
        ],
      },
    };
  }

  calculateConfidence(
    context: ProposalContext,
    targetMemories: MemoryEntry[]
  ): number {
    let confidence = 0.8; // Base high confidence for conservative approach

    // Increase confidence based on historical success
    const operation = 'relabel'; // Most conservative operation
    const successRate = this.getSuccessRate(context, operation);
    confidence *= 0.7 + successRate * 0.3;

    // Adjust for memory count (fewer = more confident)
    confidence *= Math.max(0.7, 1 - targetMemories.length * 0.02);

    return Math.min(0.95, confidence);
  }

  private getSuccessRate(
    context: ProposalContext,
    operation: SculptingOperation
  ): number {
    const successful =
      context.historicalPatterns.successfulOperations[operation] || 0;
    const failed = context.historicalPatterns.failedOperations[operation] || 0;
    const total = successful + failed;

    return total > 0 ? successful / total : 0.8; // Default optimistic rate
  }
}

/**
 * Aggressive strategy for high-impact, transformative operations
 */
export class AggressiveStrategy implements ProposalStrategy {
  id = 'aggressive';
  name = 'Transformative Sculpting';
  description =
    'High-impact operations for significant cognitive restructuring';
  applicableOperations: SculptingOperation[] = ['merge', 'prune', 'relink'];

  isApplicable(
    context: ProposalContext,
    targetMemories: MemoryEntry[]
  ): boolean {
    return (
      context.historicalPatterns.riskTolerance > 0.7 &&
      context.emotionalState.confidence > 0.8 &&
      context.emotionalState.creativity > 0.7 &&
      targetMemories.length >= 10
    );
  }

  generateProposal(
    context: ProposalContext,
    targetMemories: MemoryEntry[],
    operation: SculptingOperation
  ): BlueprintProposal {
    const impactLevel = Math.min(10, targetMemories.length * 0.3 + 5);

    return {
      id: randomUUID(),
      timestamp: new Date(),
      proposedBy: 'ReflexiveProposalGenerator:Aggressive',
      targetComponent: 'memory',
      changeType: operation === 'prune' ? 'delete' : 'modify',
      specification: {
        path: `memory.sculpting.${operation}`,
        data: {
          targetMemoryIds: targetMemories.map((m) => m.id),
          operation,
          aggressiveMode: true,
          deepAnalysis: true,
          crossReferencingEnabled: true,
        },
        metadata: {
          strategy: 'aggressive',
          confidence: this.calculateConfidence(context, targetMemories),
          estimatedImpact: impactLevel,
          transformationLevel: 'high',
        },
      },
      priority: 0.8, // High priority for transformative operations
      riskLevel: targetMemories.length > 30 ? 'experimental' : 'moderate',
      purposeAlignment: context.currentGoals.purposeAlignment,
      emotionalResonance: {
        expectedImpact: operation === 'prune' ? -0.2 : 0.3, // Pruning slightly negative
        affectedPairs: this.estimateAffectedPairs(targetMemories),
      },
      rollbackPlan: {
        strategy: operation === 'prune' ? 'compensate' : 'revert',
        steps: [
          'Create detailed change log',
          'Establish restoration checkpoints',
          operation === 'prune'
            ? 'Identify compensatory knowledge sources'
            : 'Prepare reversal operations',
          'Monitor system stability post-operation',
        ],
      },
    };
  }

  calculateConfidence(
    context: ProposalContext,
    targetMemories: MemoryEntry[]
  ): number {
    let confidence = 0.6; // Base moderate confidence for aggressive approach

    // Increase confidence based on agent's emotional state
    confidence += context.emotionalState.confidence * 0.3;
    confidence += context.emotionalState.creativity * 0.2;

    // Adjust for historical success with aggressive operations
    let avgSuccessRate = 0;
    let operationCount = 0;

    for (const op of this.applicableOperations) {
      const successful =
        context.historicalPatterns.successfulOperations[op] || 0;
      const failed = context.historicalPatterns.failedOperations[op] || 0;
      const total = successful + failed;

      if (total > 0) {
        avgSuccessRate += successful / total;
        operationCount++;
      }
    }

    if (operationCount > 0) {
      confidence *= 0.5 + (avgSuccessRate / operationCount) * 0.5;
    }

    return Math.min(0.85, Math.max(0.3, confidence));
  }

  private estimateAffectedPairs(targetMemories: MemoryEntry[]): Array<{
    sourceId: string;
    targetId: string;
    expectedChange: number;
  }> {
    const pairs: Array<{
      sourceId: string;
      targetId: string;
      expectedChange: number;
    }> = [];

    // Create sample pairs for demonstration
    for (let i = 0; i < Math.min(3, targetMemories.length - 1); i++) {
      pairs.push({
        sourceId: targetMemories[i].id,
        targetId: targetMemories[i + 1].id,
        expectedChange: 0.1 + Math.random() * 0.2,
      });
    }

    return pairs;
  }
}

/**
 * Adaptive strategy that adjusts based on context and learning
 */
export class AdaptiveStrategy implements ProposalStrategy {
  id = 'adaptive';
  name = 'Adaptive Sculpting';
  description =
    'Context-aware operations that adapt based on current conditions';
  applicableOperations: SculptingOperation[] = [
    'relabel',
    'merge',
    'relink',
    'extract',
  ];

  isApplicable(
    context: ProposalContext,
    targetMemories: MemoryEntry[]
  ): boolean {
    // Always applicable, but with varying confidence
    return true;
  }

  generateProposal(
    context: ProposalContext,
    targetMemories: MemoryEntry[],
    operation: SculptingOperation
  ): BlueprintProposal {
    const adaptationLevel = this.calculateAdaptationLevel(
      context,
      targetMemories
    );
    const riskLevel = this.determineAdaptiveRiskLevel(
      context,
      targetMemories,
      operation
    );

    return {
      id: randomUUID(),
      timestamp: new Date(),
      proposedBy: 'ReflexiveProposalGenerator:Adaptive',
      targetComponent: 'memory',
      changeType: 'modify',
      specification: {
        path: `memory.sculpting.${operation}`,
        data: {
          targetMemoryIds: targetMemories.map((m) => m.id),
          operation,
          adaptiveMode: true,
          adaptationLevel,
          contextAwareness: true,
          learningEnabled: true,
        },
        metadata: {
          strategy: 'adaptive',
          confidence: this.calculateConfidence(context, targetMemories),
          estimatedImpact: this.calculateAdaptiveImpact(
            context,
            targetMemories,
            operation
          ),
          adaptationFactors: this.getAdaptationFactors(context),
        },
      },
      priority: this.calculateAdaptivePriority(context, operation),
      riskLevel,
      purposeAlignment: this.calculateAdaptivePurposeAlignment(
        context,
        operation
      ),
      emotionalResonance: {
        expectedImpact: this.calculateEmotionalImpact(context, operation),
        affectedPairs: [],
      },
      rollbackPlan: {
        strategy: 'adapt',
        steps: [
          'Monitor adaptation metrics during operation',
          'Adjust operation parameters in real-time',
          'Create incremental checkpoints',
          'Implement gradual rollback if needed',
        ],
      },
    };
  }

  calculateConfidence(
    context: ProposalContext,
    targetMemories: MemoryEntry[]
  ): number {
    let confidence = 0.7; // Base confidence

    // Adjust based on historical patterns
    const preferredOps = context.historicalPatterns.preferredOperations;
    const operation = this.selectBestOperation(context, targetMemories);

    if (preferredOps.includes(operation)) {
      confidence += 0.1;
    }

    // Adjust based on emotional state stability
    confidence += context.emotionalState.stability * 0.2;

    // Adjust based on resource constraints
    confidence -= context.currentGoals.resourceConstraints * 0.1;

    return Math.min(0.9, Math.max(0.4, confidence));
  }

  private calculateAdaptationLevel(
    context: ProposalContext,
    targetMemories: MemoryEntry[]
  ): number {
    let level = 0.5; // Base adaptation level

    // Increase adaptation based on complexity
    level += Math.min(0.3, targetMemories.length * 0.01);

    // Adjust based on emotional creativity
    level += context.emotionalState.creativity * 0.2;

    // Adjust based on recent activity
    level += context.memoryLandscape.recentActivity * 0.1;

    return Math.min(1.0, level);
  }

  private determineAdaptiveRiskLevel(
    context: ProposalContext,
    targetMemories: MemoryEntry[],
    operation: SculptingOperation
  ): 'safe' | 'moderate' | 'experimental' {
    const riskFactors = [
      targetMemories.length > 20 ? 1 : 0,
      context.historicalPatterns.riskTolerance < 0.5 ? 0 : 1,
      operation === 'prune' || operation === 'merge' ? 1 : 0,
      context.emotionalState.confidence < 0.6 ? 0 : 1,
    ];

    const riskScore = riskFactors.reduce((sum, factor) => sum + factor, 0);

    if (riskScore <= 1) return 'safe';
    if (riskScore <= 2) return 'moderate';
    return 'experimental';
  }

  private calculateAdaptiveImpact(
    context: ProposalContext,
    targetMemories: MemoryEntry[],
    operation: SculptingOperation
  ): number {
    const baseImpacts = {
      relabel: 2,
      merge: 7,
      prune: 8,
      relink: 5,
      extract: 4,
      preserve: 2,
    };

    let impact = baseImpacts[operation] || 5;

    // Scale with memory count
    impact += Math.min(3, targetMemories.length * 0.1);

    // Adjust for agent's current state
    if (context.emotionalState.stability < 0.5) {
      impact += 1; // Higher impact when agent is unstable
    }

    return Math.min(10, impact);
  }

  private calculateAdaptivePriority(
    context: ProposalContext,
    operation: SculptingOperation
  ): number {
    let priority = 0.5; // Base priority

    // Increase priority based on urgency
    const urgencyBonus = {
      low: 0,
      medium: 0.1,
      high: 0.2,
      critical: 0.4,
    };

    priority += urgencyBonus[context.currentGoals.urgencyLevel];

    // Adjust based on preferred operations
    if (context.historicalPatterns.preferredOperations.includes(operation)) {
      priority += 0.1;
    }

    // Adjust based on resource constraints
    priority -= context.currentGoals.resourceConstraints * 0.2;

    return Math.min(1.0, Math.max(0.1, priority));
  }

  private calculateAdaptivePurposeAlignment(
    context: ProposalContext,
    operation: SculptingOperation
  ): number {
    let alignment = context.currentGoals.purposeAlignment;

    // Adjust based on operation type and primary objective
    if (
      context.currentGoals.primaryObjective.includes('efficiency') &&
      (operation === 'prune' || operation === 'merge')
    ) {
      alignment += 0.1;
    }

    if (
      context.currentGoals.primaryObjective.includes('preservation') &&
      operation === 'preserve'
    ) {
      alignment += 0.1;
    }

    if (
      context.currentGoals.primaryObjective.includes('organization') &&
      (operation === 'relabel' || operation === 'relink')
    ) {
      alignment += 0.1;
    }

    return Math.min(1.0, alignment);
  }

  private calculateEmotionalImpact(
    context: ProposalContext,
    operation: SculptingOperation
  ): number {
    const baseImpacts = {
      relabel: 0.1,
      merge: 0.2,
      prune: -0.1,
      relink: 0.2,
      extract: 0.1,
      preserve: 0.3,
    };

    let impact = baseImpacts[operation] || 0;

    // Adjust based on current emotional state
    if (context.emotionalState.currentResonance < 0) {
      impact += 0.1; // Positive operations more impactful when resonance is low
    }

    return impact;
  }

  private selectBestOperation(
    context: ProposalContext,
    targetMemories: MemoryEntry[]
  ): SculptingOperation {
    // Simple heuristic to select the most appropriate operation
    if (targetMemories.length > 15 && context.emotionalState.confidence > 0.7) {
      return 'merge';
    }

    if (context.memoryLandscape.recentActivity < 0.3) {
      return 'prune';
    }

    if (context.currentGoals.primaryObjective.includes('organization')) {
      return 'relabel';
    }

    return 'relink'; // Default
  }

  private getAdaptationFactors(
    context: ProposalContext
  ): Record<string, number> {
    return {
      emotionalStability: context.emotionalState.stability,
      confidence: context.emotionalState.confidence,
      creativity: context.emotionalState.creativity,
      riskTolerance: context.historicalPatterns.riskTolerance,
      recentActivity: context.memoryLandscape.recentActivity,
      resourceConstraints: context.currentGoals.resourceConstraints,
    };
  }
}

/**
 * The Reflexive Proposal Generator creates intelligent, context-aware
 * Blueprint Proposals for memory sculpting operations. It uses multiple
 * strategies and adapts based on agent context, historical patterns,
 * and current cognitive state.
 */
export class ReflexiveProposalGenerator {
  private strategies: Map<string, ProposalStrategy> = new Map();

  constructor() {
    // Register default strategies
    this.registerStrategy(new ConservativeStrategy());
    this.registerStrategy(new AggressiveStrategy());
    this.registerStrategy(new AdaptiveStrategy());
  }

  /**
   * Register a new proposal strategy
   */
  registerStrategy(strategy: ProposalStrategy): void {
    this.strategies.set(strategy.id, strategy);
  }

  /**
   * Unregister a proposal strategy
   */
  unregisterStrategy(strategyId: string): boolean {
    return this.strategies.delete(strategyId);
  }

  /**
   * Get all registered strategies
   */
  getStrategies(): ProposalStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Generate an enhanced blueprint proposal using the most appropriate strategy
   */
  generateEnhancedProposal(
    context: ProposalContext,
    targetMemories: MemoryEntry[],
    operation: SculptingOperation,
    preferredStrategy?: string
  ): BlueprintProposal {
    // Select the best strategy
    const strategy = preferredStrategy
      ? this.strategies.get(preferredStrategy)
      : this.selectBestStrategy(context, targetMemories, operation);

    if (!strategy) {
      throw new Error(`No suitable strategy found for operation: ${operation}`);
    }

    // Generate the proposal using the selected strategy
    const proposal = strategy.generateProposal(
      context,
      targetMemories,
      operation
    );

    // Enhance the proposal with additional context
    this.enhanceProposal(proposal, context, strategy);

    return proposal;
  }

  /**
   * Generate multiple proposals using different strategies for comparison
   */
  generateProposalVariants(
    context: ProposalContext,
    targetMemories: MemoryEntry[],
    operation: SculptingOperation
  ): Array<{
    proposal: BlueprintProposal;
    strategy: ProposalStrategy;
    confidence: number;
  }> {
    const variants: Array<{
      proposal: BlueprintProposal;
      strategy: ProposalStrategy;
      confidence: number;
    }> = [];

    for (const strategy of this.strategies.values()) {
      if (!strategy.applicableOperations.includes(operation)) {
        continue;
      }

      if (!strategy.isApplicable(context, targetMemories)) {
        continue;
      }

      const proposal = strategy.generateProposal(
        context,
        targetMemories,
        operation
      );
      const confidence = strategy.calculateConfidence(context, targetMemories);

      this.enhanceProposal(proposal, context, strategy);

      variants.push({
        proposal,
        strategy,
        confidence,
      });
    }

    // Sort by confidence descending
    variants.sort((a, b) => b.confidence - a.confidence);

    return variants;
  }

  /**
   * Analyze the proposal context to provide insights
   */
  analyzeContext(context: ProposalContext): {
    recommendedOperations: SculptingOperation[];
    riskAssessment: string;
    optimizationOpportunities: string[];
    warnings: string[];
  } {
    const analysis = {
      recommendedOperations: [] as SculptingOperation[],
      riskAssessment: '',
      optimizationOpportunities: [] as string[],
      warnings: [] as string[],
    };

    // Analyze memory landscape for recommendations
    if (context.memoryLandscape.recentActivity < 0.3) {
      analysis.recommendedOperations.push('prune');
      analysis.optimizationOpportunities.push(
        'Low recent activity suggests pruning opportunities'
      );
    }

    if (Object.keys(context.memoryLandscape.tagDistribution).length > 50) {
      analysis.recommendedOperations.push('relabel');
      analysis.optimizationOpportunities.push(
        'High tag diversity suggests relabeling opportunities'
      );
    }

    if (context.memoryLandscape.totalMemories > 1000) {
      analysis.recommendedOperations.push('merge', 'extract');
      analysis.optimizationOpportunities.push(
        'Large memory count suggests consolidation opportunities'
      );
    }

    // Risk assessment
    if (context.historicalPatterns.riskTolerance > 0.8) {
      analysis.riskAssessment =
        'High risk tolerance - aggressive operations recommended';
    } else if (context.historicalPatterns.riskTolerance < 0.3) {
      analysis.riskAssessment =
        'Low risk tolerance - conservative operations recommended';
    } else {
      analysis.riskAssessment =
        'Moderate risk tolerance - balanced approach recommended';
    }

    // Warnings
    if (context.emotionalState.stability < 0.4) {
      analysis.warnings.push(
        'Low emotional stability - consider postponing high-impact operations'
      );
    }

    if (context.currentGoals.resourceConstraints > 0.8) {
      analysis.warnings.push(
        'High resource constraints - limit operation scope'
      );
    }

    if (context.emotionalState.confidence < 0.3) {
      analysis.warnings.push(
        'Low confidence state - prefer conservative operations'
      );
    }

    return analysis;
  }

  /**
   * Select the best strategy for the given context
   */
  private selectBestStrategy(
    context: ProposalContext,
    targetMemories: MemoryEntry[],
    operation: SculptingOperation
  ): ProposalStrategy | null {
    let bestStrategy: ProposalStrategy | null = null;
    let bestConfidence = 0;

    for (const strategy of this.strategies.values()) {
      if (!strategy.applicableOperations.includes(operation)) {
        continue;
      }

      if (!strategy.isApplicable(context, targetMemories)) {
        continue;
      }

      const confidence = strategy.calculateConfidence(context, targetMemories);

      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestStrategy = strategy;
      }
    }

    return bestStrategy;
  }

  /**
   * Enhance a proposal with additional context and metadata
   */
  private enhanceProposal(
    proposal: BlueprintProposal,
    context: ProposalContext,
    strategy: ProposalStrategy
  ): void {
    // Add generation metadata
    proposal.specification.metadata = {
      ...proposal.specification.metadata,
      generatedAt: new Date().toISOString(),
      strategyUsed: strategy.id,
      contextFactors: {
        memoryCount: context.memoryLandscape.totalMemories,
        emotionalState: context.emotionalState.currentResonance,
        urgencyLevel: context.currentGoals.urgencyLevel,
        riskTolerance: context.historicalPatterns.riskTolerance,
      },
    };

    // Add dependencies if this is a complex operation
    if (proposal.specification.data.targetMemoryIds.length > 20) {
      proposal.dependencies = [
        'memory_backup_completed',
        'system_stability_verified',
      ];
    }

    // Add constraints based on context
    proposal.constraints = [];

    if (context.currentGoals.resourceConstraints > 0.7) {
      proposal.constraints.push('Minimize resource usage during execution');
    }

    if (context.emotionalState.stability < 0.5) {
      proposal.constraints.push('Monitor emotional stability during operation');
    }

    if (context.currentGoals.urgencyLevel === 'critical') {
      proposal.constraints.push('Prioritize speed over thoroughness');
    }
  }
}

/**
 * Factory function to create a Reflexive Proposal Generator
 */
export function createReflexiveProposalGenerator(): ReflexiveProposalGenerator {
  return new ReflexiveProposalGenerator();
}
