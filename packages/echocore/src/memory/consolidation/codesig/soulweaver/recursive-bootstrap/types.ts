/**
 * Type definitions for the Recursive SoulWeaving Bootstrap system
 */

/**
 * Self-reflection analysis of system's own evolution mechanisms
 */
export interface SelfReflectionAnalysis {
  /** Timestamp of the analysis */
  timestamp: number;

  /** Current evolution mechanism effectiveness (0-1) */
  mechanismEffectiveness: number;

  /** Identified bottlenecks in evolution process */
  bottlenecks: Array<{
    component: string;
    severity: number; // 0-1
    description: string;
    suggestedImprovement: string;
  }>;

  /** Success patterns detected in recent evolutions */
  successPatterns: Array<{
    pattern: string;
    frequency: number;
    effectiveness: number;
    context: string;
  }>;

  /** Proposed meta-improvements to evolution process */
  metaImprovements: Array<{
    id: string;
    targetMechanism: string;
    improvementType: 'efficiency' | 'effectiveness' | 'scope' | 'safety';
    description: string;
    expectedImpact: number; // 0-1
    riskLevel: number; // 0-1
    implementationComplexity: number; // 0-1
  }>;

  /** Overall confidence in this self-analysis */
  confidence: number;
}

/**
 * Evolution strategy that can be recursively improved
 */
export interface EvolutionStrategy {
  id: string;
  name: string;
  description: string;

  /** Parameters that control the strategy */
  parameters: {
    explorationRate: number; // 0-1, how much to explore vs exploit
    riskTolerance: number; // 0-1, willingness to try risky improvements
    collaborationIntensity: number; // 0-1, how much to involve other agents
    reflectionDepth: number; // 1-10, how deeply to analyze before acting
    improvementScope: 'local' | 'component' | 'system' | 'meta';
  };

  /** Success metrics for this strategy */
  successMetrics: {
    totalEvolutions: number;
    successfulEvolutions: number;
    averageImprovementScore: number;
    averageRiskRealized: number;
  };

  /** When this strategy was created/last modified */
  lastModified: number;

  /** Version for tracking strategy evolution */
  version: string;
}

/**
 * Meta-evolution proposal - a proposal to improve the evolution mechanism itself
 */
export interface MetaEvolutionProposal {
  id: string;
  timestamp: number;
  proposedBy: 'self-reflection' | 'pattern-analysis' | 'failure-analysis';

  /** What aspect of evolution this proposes to improve */
  target: {
    mechanism:
      | 'proposal-generation'
      | 'evaluation'
      | 'execution'
      | 'feedback'
      | 'strategy';
    component: string;
    currentVersion: string;
  };

  /** The proposed improvement */
  improvement: {
    description: string;
    expectedBenefits: string[];
    potentialRisks: string[];
    implementationComplexity: number; // 0-1
    estimatedImpact: number; // 0-1
  };

  /** Current status of this proposal */
  status:
    | 'draft'
    | 'evaluating'
    | 'approved'
    | 'rejected'
    | 'implemented'
    | 'failed';

  /** Evaluation results if available */
  evaluation?: {
    score: number; // 0-1
    confidence: number; // 0-1
    rationale: string;
    approvedBy: string[];
  };

  /** Implementation details if approved */
  implementation?: {
    startedAt?: number;
    completedAt?: number;
    executedBy: string;
    resultDescription: string;
    actualImpact: number; // -1 to 1, negative means harmful
  };
}

/**
 * Result of a bootstrap cycle
 */
export interface BootstrapCycleResult {
  cycleId: string;
  startTime: number;
  endTime: number;
  recursionDepth: number;

  /** Self-reflection analysis that initiated this cycle */
  selfReflection: SelfReflectionAnalysis;

  /** Meta-proposals generated during this cycle */
  metaProposals: MetaEvolutionProposal[];

  /** Strategies that were updated */
  updatedStrategies: EvolutionStrategy[];

  /** Consciousness metrics before and after */
  consciousnessImpact: {
    before: {
      integration: number;
      selfAwareness: number;
      intentionality: number;
    };
    after: {
      integration: number;
      selfAwareness: number;
      intentionality: number;
    };
    delta: {
      integration: number;
      selfAwareness: number;
      intentionality: number;
    };
  };

  /** Overall success assessment */
  success: boolean;

  /** Lessons learned for future cycles */
  lessonsLearned: string[];
}
