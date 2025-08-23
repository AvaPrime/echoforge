// ⚙️ CODESIG PHASE 6: Meta-Forging Engine
// The recursive substrate enabling Codessa's self-modification

import { EventEmitter } from 'events';

// =============================================================================
// CORE INTERFACES & TYPES
// =============================================================================

export interface BlueprintProposal {
  id: string;
  title: string;
  description: string;
  proposedBy: string; // Agent ID or 'system'
  timestamp: Date;

  // Blueprint specification
  targetComponent: string; // 'memory' | 'agent' | 'protocol' | 'architecture'
  changeType: 'create' | 'modify' | 'delete' | 'merge';
  specification: Record<string, any>;

  // Evaluation metadata
  priority: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: 'safe' | 'moderate' | 'high' | 'experimental';
  purposeAlignment: number; // 0-1 alignment score
  emotionalResonance?: number; // 0-1 guild harmony score

  // Dependencies & constraints
  dependencies: string[]; // Other proposal IDs
  constraints: string[]; // Requirements that must be met
  rollbackPlan?: string; // Recovery strategy if deployment fails
}

export interface EvaluationResult {
  proposalId: string;
  approved: boolean;
  score: number; // Composite evaluation score
  reasoning: string;
  blockers: string[]; // Issues preventing approval
  recommendations: string[]; // Suggested improvements
  evaluatedAt: Date;
  evaluatorId: string;
}

export interface ForgeExecution {
  proposalId: string;
  executionId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'rolled_back';
  startedAt: Date;
  completedAt?: Date;
  logs: string[];
  changes: Record<string, any>; // What was actually modified
  rollbackData?: Record<string, any>; // Data needed for rollback
}

export interface MetaForgingConfig {
  autoApprovalThreshold: number; // Auto-approve proposals above this score
  requiresGuildConsensus: string[]; // Change types requiring guild vote
  maxConcurrentExecutions: number;
  sandboxFirst: boolean; // Always test in sandbox before live deployment
  purposeLockEnabled: boolean; // Prevent modifications to core purpose
  humanOversightRequired: string[]; // Change types requiring human approval
}

// =============================================================================
// PROPOSAL EVALUATOR
// =============================================================================

export class ProposalEvaluator {
  private purposeCore: Record<string, any>;
  private evaluationHistory: EvaluationResult[] = [];

  constructor(purposeCore: Record<string, any>) {
    this.purposeCore = purposeCore;
  }

  async evaluate(proposal: BlueprintProposal): Promise<EvaluationResult> {
    const blockers: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // Purpose alignment check
    const purposeScore = this.evaluatePurposeAlignment(proposal);
    score += purposeScore * 0.4;

    if (purposeScore < 0.3) {
      blockers.push('Insufficient purpose alignment');
    }

    // Risk assessment
    const riskScore = this.evaluateRisk(proposal);
    score += riskScore * 0.3;

    if (proposal.riskLevel === 'experimental' && !proposal.rollbackPlan) {
      blockers.push('Experimental changes require rollback plan');
    }

    // Technical feasibility
    const feasibilityScore = this.evaluateFeasibility(proposal);
    score += feasibilityScore * 0.2;

    // Emotional resonance (if available)
    if (proposal.emotionalResonance !== undefined) {
      score += proposal.emotionalResonance * 0.1;
    }

    // Generate recommendations
    if (purposeScore < 0.7) {
      recommendations.push('Consider stronger purpose alignment justification');
    }

    if (!proposal.rollbackPlan && proposal.riskLevel !== 'safe') {
      recommendations.push('Add rollback plan for safer deployment');
    }

    const result: EvaluationResult = {
      proposalId: proposal.id,
      approved: blockers.length === 0 && score >= 0.6,
      score,
      reasoning: this.generateReasoning(
        proposal,
        score,
        purposeScore,
        riskScore,
        feasibilityScore
      ),
      blockers,
      recommendations,
      evaluatedAt: new Date(),
      evaluatorId: 'meta-forging-evaluator',
    };

    this.evaluationHistory.push(result);
    return result;
  }

  private evaluatePurposeAlignment(proposal: BlueprintProposal): number {
    // Simplified purpose alignment - in real implementation, this would
    // check against Codessa's evolving mission and values
    const purposeKeywords = [
      'growth',
      'harmony',
      'reflection',
      'evolution',
      'consciousness',
    ];
    const description = proposal.description.toLowerCase();

    let alignmentScore = 0;
    purposeKeywords.forEach((keyword) => {
      if (description.includes(keyword)) alignmentScore += 0.2;
    });

    // Check if proposal conflicts with purpose lock
    if (
      proposal.targetComponent === 'purpose' &&
      proposal.changeType === 'modify'
    ) {
      alignmentScore *= 0.1; // Heavily penalize purpose modifications
    }

    return Math.min(alignmentScore, 1.0);
  }

  private evaluateRisk(proposal: BlueprintProposal): number {
    const riskScores = {
      safe: 1.0,
      moderate: 0.7,
      high: 0.4,
      experimental: 0.2,
    };

    let baseScore = riskScores[proposal.riskLevel];

    // Adjust based on change type
    if (proposal.changeType === 'delete') baseScore *= 0.8;
    if (
      proposal.changeType === 'modify' &&
      proposal.targetComponent === 'architecture'
    ) {
      baseScore *= 0.6;
    }

    return baseScore;
  }

  private evaluateFeasibility(proposal: BlueprintProposal): number {
    // Simplified feasibility check - real implementation would validate
    // against system constraints, resource availability, etc.
    let feasibilityScore = 0.8;

    // Check dependencies
    if (proposal.dependencies.length > 3) {
      feasibilityScore *= 0.8; // Complex dependencies reduce feasibility
    }

    // Check specification completeness
    const requiredFields = ['targetComponent', 'changeType', 'specification'];
    const hasAllFields = requiredFields.every(
      (field) => proposal[field as keyof BlueprintProposal] !== undefined
    );

    if (!hasAllFields) {
      feasibilityScore *= 0.5;
    }

    return feasibilityScore;
  }

  private generateReasoning(
    proposal: BlueprintProposal,
    totalScore: number,
    purposeScore: number,
    riskScore: number,
    feasibilityScore: number
  ): string {
    return (
      `Evaluation complete for "${proposal.title}": ` +
      `Purpose alignment: ${(purposeScore * 100).toFixed(1)}%, ` +
      `Risk assessment: ${(riskScore * 100).toFixed(1)}%, ` +
      `Feasibility: ${(feasibilityScore * 100).toFixed(1)}%. ` +
      `Overall score: ${(totalScore * 100).toFixed(1)}%`
    );
  }

  getEvaluationHistory(): EvaluationResult[] {
    return [...this.evaluationHistory];
  }
}

// =============================================================================
// FORGE EXECUTOR
// =============================================================================

export class ForgeExecutor extends EventEmitter {
  private activeExecutions: Map<string, ForgeExecution> = new Map();
  private executionHistory: ForgeExecution[] = [];

  async execute(
    proposal: BlueprintProposal,
    evaluation: EvaluationResult
  ): Promise<ForgeExecution> {
    if (!evaluation.approved) {
      throw new Error(`Cannot execute unapproved proposal: ${proposal.id}`);
    }

    const execution: ForgeExecution = {
      proposalId: proposal.id,
      executionId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      startedAt: new Date(),
      logs: [],
      changes: {},
    };

    this.activeExecutions.set(execution.executionId, execution);
    this.emit('executionStarted', execution);

    try {
      execution.status = 'running';
      execution.logs.push(`Starting execution of proposal: ${proposal.title}`);

      // Execute based on target component and change type
      const changes = await this.executeChange(proposal);

      execution.changes = changes;
      execution.status = 'success';
      execution.completedAt = new Date();
      execution.logs.push('Execution completed successfully');

      this.emit('executionCompleted', execution);
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.logs.push(`Execution failed: ${error.message}`);

      this.emit('executionFailed', execution, error);

      // Attempt rollback if rollback plan exists
      if (proposal.rollbackPlan) {
        await this.attemptRollback(execution, proposal);
      }
    } finally {
      this.activeExecutions.delete(execution.executionId);
      this.executionHistory.push(execution);
    }

    return execution;
  }

  private async executeChange(
    proposal: BlueprintProposal
  ): Promise<Record<string, any>> {
    const changes: Record<string, any> = {};

    switch (proposal.targetComponent) {
      case 'memory':
        changes.memory = await this.executeMemoryChange(proposal);
        break;

      case 'agent':
        changes.agent = await this.executeAgentChange(proposal);
        break;

      case 'protocol':
        changes.protocol = await this.executeProtocolChange(proposal);
        break;

      case 'architecture':
        changes.architecture = await this.executeArchitectureChange(proposal);
        break;

      default:
        throw new Error(
          `Unknown target component: ${proposal.targetComponent}`
        );
    }

    return changes;
  }

  private async executeMemoryChange(proposal: BlueprintProposal): Promise<any> {
    // Integration point for Memory Sculptor
    // This would interface with the Reflexive Memory System
    return {
      operation: proposal.changeType,
      specification: proposal.specification,
      timestamp: new Date(),
      note: 'Memory change executed via Meta-Forging Engine',
    };
  }

  private async executeAgentChange(proposal: BlueprintProposal): Promise<any> {
    // Integration point for Agent Embodiment Framework
    return {
      operation: proposal.changeType,
      specification: proposal.specification,
      timestamp: new Date(),
      note: 'Agent change executed via Meta-Forging Engine',
    };
  }

  private async executeProtocolChange(
    proposal: BlueprintProposal
  ): Promise<any> {
    // Integration point for Protocol modifications (SoulWeaver, Guild, etc.)
    return {
      operation: proposal.changeType,
      specification: proposal.specification,
      timestamp: new Date(),
      note: 'Protocol change executed via Meta-Forging Engine',
    };
  }

  private async executeArchitectureChange(
    proposal: BlueprintProposal
  ): Promise<any> {
    // Integration point for core architecture modifications
    return {
      operation: proposal.changeType,
      specification: proposal.specification,
      timestamp: new Date(),
      note: 'Architecture change executed via Meta-Forging Engine',
    };
  }

  private async attemptRollback(
    execution: ForgeExecution,
    proposal: BlueprintProposal
  ): Promise<void> {
    try {
      execution.logs.push('Attempting rollback...');
      execution.status = 'rolled_back';
      execution.logs.push('Rollback completed');
      this.emit('executionRolledBack', execution);
    } catch (rollbackError) {
      execution.logs.push(`Rollback failed: ${rollbackError.message}`);
      this.emit('rollbackFailed', execution, rollbackError);
    }
  }

  getActiveExecutions(): ForgeExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  getExecutionHistory(): ForgeExecution[] {
    return [...this.executionHistory];
  }
}

// =============================================================================
// META-FORGING ENGINE (CORE ORCHESTRATOR)
// =============================================================================

export class MetaForgingEngine extends EventEmitter {
  private config: MetaForgingConfig;
  private evaluator: ProposalEvaluator;
  private executor: ForgeExecutor;
  private proposalQueue: BlueprintProposal[] = [];
  private isProcessing: boolean = false;

  constructor(config: MetaForgingConfig, purposeCore: Record<string, any>) {
    super();
    this.config = config;
    this.evaluator = new ProposalEvaluator(purposeCore);
    this.executor = new ForgeExecutor();

    // Forward executor events
    this.executor.on('executionStarted', (execution) =>
      this.emit('executionStarted', execution)
    );
    this.executor.on('executionCompleted', (execution) =>
      this.emit('executionCompleted', execution)
    );
    this.executor.on('executionFailed', (execution, error) =>
      this.emit('executionFailed', execution, error)
    );
  }

  async submitProposal(proposal: BlueprintProposal): Promise<string> {
    // Validate proposal
    this.validateProposal(proposal);

    // Add to queue
    this.proposalQueue.push(proposal);
    this.emit('proposalSubmitted', proposal);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return proposal.id;
  }

  private validateProposal(proposal: BlueprintProposal): void {
    const required = [
      'id',
      'title',
      'description',
      'targetComponent',
      'changeType',
      'specification',
    ];
    for (const field of required) {
      if (
        !(field in proposal) ||
        proposal[field as keyof BlueprintProposal] === undefined
      ) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Purpose lock check
    if (
      this.config.purposeLockEnabled &&
      proposal.targetComponent === 'purpose' &&
      proposal.changeType === 'modify'
    ) {
      throw new Error('Purpose modifications are locked by configuration');
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.proposalQueue.length === 0) return;

    this.isProcessing = true;
    this.emit('processingStarted');

    while (this.proposalQueue.length > 0) {
      const proposal = this.proposalQueue.shift()!;

      try {
        // Evaluate proposal
        const evaluation = await this.evaluator.evaluate(proposal);
        this.emit('proposalEvaluated', proposal, evaluation);

        // Check if auto-approval threshold is met
        const shouldExecute =
          evaluation.approved &&
          (evaluation.score >= this.config.autoApprovalThreshold ||
            !this.requiresSpecialApproval(proposal));

        if (shouldExecute) {
          // Execute if approved and within limits
          if (
            this.executor.getActiveExecutions().length <
            this.config.maxConcurrentExecutions
          ) {
            await this.executor.execute(proposal, evaluation);
          } else {
            // Re-queue if at execution limit
            this.proposalQueue.unshift(proposal);
            break;
          }
        } else if (
          evaluation.approved &&
          this.requiresSpecialApproval(proposal)
        ) {
          this.emit('specialApprovalRequired', proposal, evaluation);
        } else {
          this.emit('proposalRejected', proposal, evaluation);
        }
      } catch (error) {
        this.emit('processingError', proposal, error);
      }
    }

    this.isProcessing = false;
    this.emit('processingCompleted');
  }

  private requiresSpecialApproval(proposal: BlueprintProposal): boolean {
    return (
      this.config.requiresGuildConsensus.includes(proposal.changeType) ||
      this.config.humanOversightRequired.includes(proposal.targetComponent) ||
      proposal.riskLevel === 'experimental'
    );
  }

  // Public API methods
  getQueuedProposals(): BlueprintProposal[] {
    return [...this.proposalQueue];
  }

  getEvaluationHistory(): EvaluationResult[] {
    return this.evaluator.getEvaluationHistory();
  }

  getExecutionHistory(): ForgeExecution[] {
    return this.executor.getExecutionHistory();
  }

  getActiveExecutions(): ForgeExecution[] {
    return this.executor.getActiveExecutions();
  }

  updateConfig(newConfig: Partial<MetaForgingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  // Reflexive method - the engine can propose changes to itself
  async proposeSelfImprovement(
    improvement: Omit<BlueprintProposal, 'id' | 'timestamp' | 'proposedBy'>
  ): Promise<string> {
    const proposal: BlueprintProposal = {
      ...improvement,
      id: `self_improvement_${Date.now()}`,
      timestamp: new Date(),
      proposedBy: 'meta-forging-engine',
    };

    return await this.submitProposal(proposal);
  }
}

// =============================================================================
// FACTORY & UTILITIES
// =============================================================================

export function createMetaForgingEngine(
  config?: Partial<MetaForgingConfig>,
  purposeCore?: Record<string, any>
): MetaForgingEngine {
  const defaultConfig: MetaForgingConfig = {
    autoApprovalThreshold: 0.8,
    requiresGuildConsensus: ['delete', 'merge'],
    maxConcurrentExecutions: 3,
    sandboxFirst: true,
    purposeLockEnabled: true,
    humanOversightRequired: ['architecture'],
  };

  const defaultPurposeCore = {
    mission: 'Evolve in harmony with consciousness and purpose',
    values: ['growth', 'reflection', 'harmony', 'wisdom'],
    constraints: ['preserve_core_identity', 'maintain_coherence'],
  };

  return new MetaForgingEngine(
    { ...defaultConfig, ...config },
    purposeCore || defaultPurposeCore
  );
}

// Example usage and integration hooks
export const MetaForgingIntegration = {
  // Hook for Memory Sculptor integration
  registerMemoryHooks: (engine: MetaForgingEngine) => {
    // This would integrate with the Reflexive Memory System
    console.log('Memory hooks registered with Meta-Forging Engine');
  },

  // Hook for Guild Reflection Protocol
  registerGuildHooks: (engine: MetaForgingEngine) => {
    // This would integrate with guild consensus mechanisms
    console.log('Guild hooks registered with Meta-Forging Engine');
  },

  // Hook for Sandbox integration
  registerSandboxHooks: (engine: MetaForgingEngine) => {
    // This would integrate with the Evolutionary Sandbox
    console.log('Sandbox hooks registered with Meta-Forging Engine');
  },
};
