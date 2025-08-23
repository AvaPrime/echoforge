import { EventEmitter } from 'events';
import {
  BlueprintProposal,
  EvaluationResult,
  ForgeExecution,
  MetaForgingConfig,
} from './BlueprintProposal';
import { ProposalEvaluator } from './ProposalEvaluator';
import { ForgeExecutor } from './ForgeExecutor';

/**
 * Core engine for evaluating and executing blueprint proposals.
 * This is the central component of the Meta-Forging system that enables
 * self-modification capabilities.
 */
export class MetaForgingEngine extends EventEmitter {
  private config: MetaForgingConfig;
  private purposeCore: Record<string, any>;
  private evaluator: ProposalEvaluator;
  private executor: ForgeExecutor;
  private proposalQueue: BlueprintProposal[] = [];
  private isProcessing: boolean = false;

  constructor(config: MetaForgingConfig, purposeCore: Record<string, any>) {
    super();
    this.config = config;
    this.purposeCore = purposeCore;
    this.evaluator = new ProposalEvaluator(purposeCore);
    this.executor = new ForgeExecutor(config.sandboxFirst);

    // Forward events from executor
    this.executor.on('executionStarted', (execution) => {
      this.emit('executionStarted', execution);
    });

    this.executor.on('executionCompleted', (execution) => {
      this.emit('executionCompleted', execution);
    });

    this.executor.on('executionFailed', (execution, error) => {
      this.emit('executionFailed', execution, error);
    });

    this.executor.on('rollbackSucceeded', (execution) => {
      this.emit('rollbackSucceeded', execution);
    });

    this.executor.on('rollbackFailed', (execution, error) => {
      this.emit('rollbackFailed', execution, error);
    });
  }

  /**
   * Submits a blueprint proposal for evaluation and potential execution.
   */
  async submitProposal(proposal: BlueprintProposal): Promise<string> {
    try {
      // Validate proposal
      this.validateProposal(proposal);

      // Add to queue
      this.proposalQueue.push(proposal);
      this.emit('proposalQueued', proposal);

      // Start processing queue if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }

      return proposal.id;
    } catch (error) {
      this.emit('proposalRejected', proposal, error);
      throw error;
    }
  }

  /**
   * Validates that a proposal has all required fields and meets basic requirements.
   */
  private validateProposal(proposal: BlueprintProposal): void {
    // Check required fields
    const requiredFields = [
      'id',
      'timestamp',
      'proposedBy',
      'targetComponent',
      'changeType',
      'specification',
      'priority',
      'riskLevel',
      'purposeAlignment',
      'emotionalResonance',
      'rollbackPlan',
    ];

    for (const field of requiredFields) {
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

  /**
   * Processes the proposal queue.
   */
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

  /**
   * Determines if a proposal requires special approval.
   */
  private requiresSpecialApproval(proposal: BlueprintProposal): boolean {
    return (
      this.config.requiresGuildConsensus.includes(proposal.changeType) ||
      this.config.humanOversightRequired.includes(proposal.targetComponent) ||
      proposal.riskLevel === 'experimental'
    );
  }

  /**
   * Returns the list of currently queued proposals.
   */
  getQueuedProposals(): BlueprintProposal[] {
    return [...this.proposalQueue];
  }

  /**
   * Returns the history of evaluations performed.
   */
  getEvaluationHistory(): EvaluationResult[] {
    return this.evaluator.getEvaluationHistory();
  }

  /**
   * Returns the history of completed executions.
   */
  getExecutionHistory(): ForgeExecution[] {
    return this.executor.getExecutionHistory();
  }

  /**
   * Returns the list of currently active executions.
   */
  getActiveExecutions(): ForgeExecution[] {
    return this.executor.getActiveExecutions();
  }

  /**
   * Updates the engine configuration.
   */
  updateConfig(newConfig: Partial<MetaForgingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  /**
   * Reflexive method - the engine can propose changes to itself.
   */
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

/**
 * Creates a new MetaForgingEngine with default or custom configuration.
 */
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

/**
 * Integration hooks for connecting the Meta-Forging Engine with other components.
 */
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
