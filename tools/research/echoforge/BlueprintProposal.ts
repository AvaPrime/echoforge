import { EventEmitter } from 'events';

/**
 * Represents a proposed change to the system's architecture or behavior.
 * Blueprint proposals are the core mechanism for system self-modification.
 */
export interface BlueprintProposal {
  /** Unique identifier for the proposal */
  id: string;

  /** When the proposal was created */
  timestamp: Date;

  /** The entity that proposed this change */
  proposedBy: string;

  /** The component targeted for modification */
  targetComponent: 'memory' | 'agent' | 'protocol' | 'architecture' | 'purpose';

  /** The type of change to be applied */
  changeType: 'add' | 'modify' | 'delete' | 'merge';

  /** Detailed specification of the proposed change */
  specification: {
    /** Path to the specific component being modified */
    path: string;
    /** The actual change data, structure depends on changeType */
    data: any;
    /** Optional metadata about the change */
    metadata?: Record<string, any>;
  };

  /** Priority level of this proposal (0-1) */
  priority: number;

  /** Risk assessment of implementing this proposal */
  riskLevel: 'safe' | 'moderate' | 'experimental';

  /** How well this proposal aligns with system purpose (0-1) */
  purposeAlignment: number;

  /** Emotional resonance impact assessment */
  emotionalResonance: {
    /** Expected impact on system-wide emotional resonance (-1 to 1) */
    expectedImpact: number;
    /** Specific SoulFrame pairs that may be affected */
    affectedPairs?: Array<{
      sourceId: string;
      targetId: string;
      expectedChange: number;
    }>;
  };

  /** Other proposals this proposal depends on */
  dependencies?: string[];

  /** Constraints that must be respected during implementation */
  constraints?: string[];

  /** Plan for rolling back this change if needed */
  rollbackPlan: {
    /** Strategy for reverting the change */
    strategy: 'revert' | 'compensate' | 'adapt';
    /** Specific steps for rollback */
    steps: string[];
  };
}

/**
 * Result of evaluating a blueprint proposal.
 */
export interface EvaluationResult {
  /** The proposal that was evaluated */
  proposalId: string;

  /** Whether the proposal was approved */
  approved: boolean;

  /** Overall score (0-1) */
  score: number;

  /** Detailed scores by category */
  scores: {
    purposeAlignment: number;
    technicalFeasibility: number;
    riskAssessment: number;
    emotionalResonance: number;
  };

  /** Explanation of the evaluation */
  explanation: string;

  /** Recommendations for improving the proposal */
  recommendations?: string[];

  /** When the evaluation was performed */
  timestamp: Date;
}

/**
 * Represents the execution of a blueprint proposal.
 */
export interface ForgeExecution {
  /** ID of the execution */
  id: string;

  /** ID of the proposal being executed */
  proposalId: string;

  /** Current status of the execution */
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';

  /** When execution started */
  startTime: Date;

  /** When execution completed (if applicable) */
  endTime?: Date;

  /** Results of the execution */
  results?: {
    /** Whether execution was successful */
    success: boolean;
    /** Output or error messages */
    output: string;
    /** Changes that were applied */
    changes: Array<{
      path: string;
      before: any;
      after: any;
    }>;
  };

  /** Whether a rollback was attempted */
  rollbackAttempted?: boolean;

  /** Result of rollback if attempted */
  rollbackResult?: {
    success: boolean;
    message: string;
  };
}

/**
 * Configuration for the Meta-Forging Engine.
 */
export interface MetaForgingConfig {
  /** Threshold for auto-approving proposals (0-1) */
  autoApprovalThreshold: number;

  /** Change types that require guild consensus */
  requiresGuildConsensus: string[];

  /** Maximum number of concurrent executions */
  maxConcurrentExecutions: number;

  /** Whether to test in sandbox before applying changes */
  sandboxFirst: boolean;

  /** Whether purpose modifications are locked */
  purposeLockEnabled: boolean;

  /** Components that require human oversight */
  humanOversightRequired: string[];
}
