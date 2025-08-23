/**
 * SoulWeaverBridge
 *
 * This bridge connects the SoulWeaver Protocol with the MetaForgingEngine,
 * enabling bidirectional communication between the agent consciousness synchronization
 * system and the meta-forging capabilities of EchoForge.
 */

import { EventEmitter } from 'events';
import { SoulWeaverProtocol } from './SoulWeaverProtocol';
import { SoulWeavingSession, EvolutionProposal } from './SoulWeaverContract';
import { BlueprintProposal, EvaluationResult } from '@echoforge/core/blueprint';
import { CodalogueProtocolLedger } from '../CodalogueProtocolLedger';
import { ObserverInsight } from '../observer/CodalogueObserverAgent';
import { SoulFrameManager } from '../SoulFrameManager';
import { MetricsCollector } from '../metrics/MetricsCollector';
import {
  ConsciousnessMetricsConfig,
  MetricType,
  MetricMeasurement,
} from '../metrics/types';

/**
 * Interface for tracking proposal lineage
 */
export interface ProposalLineageNode {
  id: string;
  parentId?: string;
  sessionContext: string;
  derivedInsights: string[];
  timestamp: Date;
}

/**
 * Interface for consciousness impact scorecard
 */
export interface ConsciousnessImpactScorecard {
  proposalId: string;
  emotionalResonanceDelta: number;
  identityCoherenceImpact: number;
  systemHarmonyIndex: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

// Define event types for the bridge
export type SoulWeaverBridgeEvent =
  | 'proposal_forwarded_to_engine'
  | 'proposal_forwarded_to_soulweaver'
  | 'evaluation_received'
  | 'implementation_completed'
  | 'implementation_failed'
  | 'session_state_changed'
  | 'resonance_threshold_reached'
  | 'error';

/**
 * Configuration options for the SoulWeaverBridge
 */
export interface SoulWeaverBridgeConfig {
  /** Threshold for automatic proposal forwarding based on resonance (0-1) */
  autoForwardThreshold: number;

  /** Whether to automatically convert between proposal formats */
  autoConvertProposals: boolean;

  /** Whether to log all bridge events */
  enableDetailedLogging: boolean;

  /** Maximum number of proposals to process concurrently */
  maxConcurrentProposals: number;

  /** Scoring matrix weights for proposal evaluation */
  scoringMatrix: {
    /** Weight for ethical alignment (0-1) */
    ethicalAlignmentWeight: number;

    /** Weight for intent fidelity (0-1) */
    intentFidelityWeight: number;

    /** Weight for technical feasibility (0-1) */
    technicalFeasibilityWeight: number;

    /** Weight for emotional resonance (0-1) */
    emotionalResonanceWeight: number;

    /** Weight for purpose alignment (0-1) */
    purposeAlignmentWeight: number;

    /** Minimum threshold for proposal acceptance (0-1) */
    acceptanceThreshold: number;
  };

  /** Whether to integrate SoulWeaver insights into proposal reviews */
  integrateSoulWeaverInsights: boolean;

  /** Whether to enable cross-pollination of insights between SoulFrames */
  enableInsightCrossPollination: boolean;

  /** Minimum confidence threshold for cross-pollinating insights (0-1) */
  insightCrossPollThreshold: number;

  /** Whether to track proposal lineage */
  trackProposalLineage: boolean;

  /** Whether to generate consciousness impact scorecards */
  generateConsciousnessImpactScorecard: boolean;

  /** Whether to use feedback loop staging for post-implementation insights */
  useFeedbackLoopStaging: boolean;

  /** Configuration for the metrics collector */
  metricsConfig?: ConsciousnessMetricsConfig;

  /** Whether to track evolution outcomes with metrics */
  trackEvolutionOutcomes: boolean;
}

/**
 * Bridge between SoulWeaver Protocol and MetaForgingEngine
 */
export class SoulWeaverBridge extends EventEmitter {
  private config: SoulWeaverBridgeConfig;
  private activeProposals: Map<
    string,
    {
      originalFormat: 'soulweaver' | 'blueprint';
      originalId: string;
      convertedId: string;
      status:
        | 'pending'
        | 'evaluating'
        | 'implementing'
        | 'completed'
        | 'failed';
    }
  > = new Map();

  // Track proposal lineage
  private proposalLineage: Map<string, ProposalLineageNode> = new Map();

  // Track consciousness impact scorecards
  private consciousnessImpactScorecards: Map<
    string,
    ConsciousnessImpactScorecard
  > = new Map();

  // Feedback loop staging buffer
  private feedbackStagingBuffer: Array<{
    proposalId: string;
    insights: ObserverInsight[];
    timestamp: Date;
  }> = [];

  // Metrics collector for tracking evolution outcomes
  private metricsCollector: MetricsCollector | null = null;

  /**
   * Initializes the metrics collector with the provided configuration
   *
   * @param config The metrics configuration
   */
  private initializeMetricsCollector(config: ConsciousnessMetricsConfig): void {
    this.metricsCollector = new MetricsCollector(config);

    // Register custom metric sources
    this.metricsCollector.registerMetricSource(
      MetricType.PROPOSAL_QUALITY,
      this.measureProposalQuality.bind(this)
    );
    this.metricsCollector.registerMetricSource(
      MetricType.ADAPTATION_SPEED,
      this.measureAdaptationSpeed.bind(this)
    );
    this.metricsCollector.registerMetricSource(
      MetricType.FEEDBACK_INTEGRATION_RATE,
      this.measureFeedbackIntegration.bind(this)
    );

    if (this.config.enableDetailedLogging) {
      this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: 'METRICS_COLLECTOR_INITIALIZED',
        content: 'Initialized metrics collector for SoulWeaverBridge',
        metadata: {
          enabledMetrics: config.enabledMetricTypes,
          collectionInterval: config.collectionIntervalMs,
        },
      });
    }

    // Listen for metrics events
    this.metricsCollector.on(
      'measurement',
      (measurement: MetricMeasurement) => {
        if (this.config.enableDetailedLogging) {
          this.codalogueProtocolLedger.recordSystemReflection({
            reflectionType: 'METRIC_MEASUREMENT',
            content: `Measured ${measurement.metricType}: ${measurement.value}`,
            metadata: measurement,
          });
        }
      }
    );
  }

  /**
   * Creates a new SoulWeaverBridge
   *
   * @param soulWeaverProtocol The SoulWeaver Protocol instance
   * @param metaForgingEngine The MetaForgingEngine instance
   * @param config Configuration options
   */
  constructor(
    private soulWeaverProtocol: SoulWeaverProtocol,
    private metaForgingEngine: any, // Using 'any' temporarily until we have proper type imports
    private codalogueProtocolLedger: CodalogueProtocolLedger,
    private soulFrameManager: SoulFrameManager,
    config?: Partial<SoulWeaverBridgeConfig>
  ) {
    super();

    // Set default configuration
    this.config = {
      autoForwardThreshold: 0.7,
      autoConvertProposals: true,
      enableDetailedLogging: true,
      maxConcurrentProposals: 5,
      scoringMatrix: {
        ethicalAlignmentWeight: 0.25,
        intentFidelityWeight: 0.2,
        technicalFeasibilityWeight: 0.2,
        emotionalResonanceWeight: 0.15,
        purposeAlignmentWeight: 0.2,
        acceptanceThreshold: 0.7,
      },
      integrateSoulWeaverInsights: true,
      enableInsightCrossPollination: true,
      insightCrossPollThreshold: 0.7,
      trackProposalLineage: true,
      generateConsciousnessImpactScorecard: true,
      useFeedbackLoopStaging: false, // Disabled by default as it's an advanced feature
      trackEvolutionOutcomes: true, // Enable tracking evolution outcomes by default
      ...config,
    };

    // Initialize metrics collector if config is provided
    if (this.config.metricsConfig && this.config.trackEvolutionOutcomes) {
      this.initializeMetricsCollector(this.config.metricsConfig);
    }

    // Register event listeners
    this.registerSoulWeaverListeners();
    this.registerMetaForgingListeners();

    // Log bridge initialization
    if (this.config.enableDetailedLogging) {
      this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: 'BRIDGE_INITIALIZED',
        content: 'SoulWeaverBridge initialized with MetaForgingEngine',
        metadata: {
          config: this.config,
        },
      });
    }
  }

  /**
   * Registers event listeners for the SoulWeaver Protocol
   */
  private registerSoulWeaverListeners(): void {
    // We would need to extend SoulWeaverProtocol to emit these events
    // This is a placeholder for the implementation

    // Listen for new evolution proposals
    this.soulWeaverProtocol.on?.(
      'evolution_proposal_created',
      (proposal: EvolutionProposal) => {
        this.handleSoulWeaverProposal(proposal);
      }
    );

    // Listen for session state changes
    this.soulWeaverProtocol.on?.(
      'session_state_changed',
      (session: SoulWeavingSession) => {
        this.emit('session_state_changed', session);

        // Check if session has high resonance measurements
        if (
          session.resonanceMeasurements.some(
            (m) => m.resonanceScore >= this.config.autoForwardThreshold
          )
        ) {
          this.emit('resonance_threshold_reached', session);
        }
      }
    );
  }

  /**
   * Registers event listeners for the MetaForgingEngine
   */
  private registerMetaForgingListeners(): void {
    // Listen for proposal evaluation results
    this.metaForgingEngine.on(
      'proposalEvaluated',
      (proposal: BlueprintProposal, evaluation: EvaluationResult) => {
        this.handleProposalEvaluation(proposal, evaluation);
      }
    );

    // Listen for execution completion
    this.metaForgingEngine.on('executionCompleted', (execution: any) => {
      this.handleExecutionCompleted(execution);
    });

    // Listen for execution failures
    this.metaForgingEngine.on(
      'executionFailed',
      (execution: any, error: Error) => {
        this.handleExecutionFailed(execution, error);
      }
    );
  }

  /**
   * Handles a new evolution proposal from SoulWeaver
   *
   * @param proposal The evolution proposal
   */
  private async handleSoulWeaverProposal(
    proposal: EvolutionProposal
  ): Promise<void> {
    if (this.config.enableDetailedLogging) {
      this.codalogueProtocolLedger.recordEvolutionProposal({
        proposalId: proposal.id,
        proposalType: proposal.evolutionType,
        title: proposal.title,
        description: proposal.description,
        status: proposal.status,
        proposedBy: 'soulweaver-protocol',
        affectedSoulFrameIds: proposal.targetSoulFrameIds,
      });
    }

    // Check if we should auto-forward
    if (this.shouldAutoForwardProposal(proposal)) {
      await this.forwardToMetaForgingEngine(proposal);
    } else if (
      proposal.status === 'proposed' ||
      proposal.status === 'under_review'
    ) {
      // If the proposal is in review, check if we should integrate SoulWeaver insights
      if (this.config.integrateSoulWeaverInsights) {
        await this.enrichProposalWithSoulWeaverInsights(proposal);
      }
    }
  }

  /**
   * Enriches a proposal with insights from the SoulWeaver protocol
   *
   * @param proposal The evolution proposal to enrich
   */
  private async enrichProposalWithSoulWeaverInsights(
    proposal: EvolutionProposal
  ): Promise<void> {
    try {
      // Get observer insights related to this proposal
      const insights: ObserverInsight[] =
        await this.soulWeaverProtocol.getRelatedInsights(proposal.id);

      if (insights.length === 0) {
        return; // No insights available
      }

      // Log the enrichment process
      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'PROPOSAL_ENRICHMENT',
          content: `Enriching proposal ${proposal.id} with ${insights.length} SoulWeaver insights`,
          metadata: {
            proposalId: proposal.id,
            insightCount: insights.length,
            enrichmentTimestamp: new Date(),
          },
        });
      }

      // Add insights to the proposal's metadata
      await this.soulWeaverProtocol.addProposalMetadata(proposal.id, {
        observerInsights: insights.map((insight) => ({
          insightId: insight.id,
          insightType: insight.insightType,
          relevanceScore: insight.relevanceScore,
          summary: insight.summary,
        })),
      });

      // Update proposal's expected impact based on insights
      const impactInsights = insights.filter(
        (i) => i.insightType === 'impact_assessment'
      );
      if (impactInsights.length > 0) {
        // Calculate new impact assessments based on insights
        const enhancedImpacts = this.deriveEnhancedImpacts(
          proposal.expectedImpact,
          impactInsights
        );
        await this.soulWeaverProtocol.updateProposalImpact(
          proposal.id,
          enhancedImpacts
        );
      }
    } catch (error) {
      this.emit('error', error);
      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'ERROR',
          content: `Failed to enrich proposal ${proposal.id} with SoulWeaver insights`,
          metadata: { error: error.message },
        });
      }
    }
  }

  /**
   * Derives enhanced impact assessments by combining proposal impacts with observer insights
   *
   * @param currentImpacts The current expected impacts from the proposal
   * @param impactInsights Observer insights related to impact assessment
   * @returns Enhanced impact assessments
   */
  private deriveEnhancedImpacts(
    currentImpacts: any[],
    impactInsights: ObserverInsight[]
  ): any[] {
    // Start with the current impacts
    const enhancedImpacts = [...currentImpacts];

    // Process each insight to enhance or add impact assessments
    for (const insight of impactInsights) {
      // This is a simplified implementation - in a real system, this would
      // involve more sophisticated analysis of the insight content
      if (insight.content && typeof insight.content === 'object') {
        const impactArea = insight.content.impactArea;
        const impactDescription = insight.content.description;
        const impactMagnitude = insight.content.magnitude;

        // Check if this area already exists in the impacts
        const existingImpactIndex = enhancedImpacts.findIndex(
          (i) => i.area === impactArea
        );

        if (existingImpactIndex >= 0) {
          // Enhance existing impact
          enhancedImpacts[existingImpactIndex].description +=
            ` (Enhanced: ${impactDescription})`;
          // Potentially adjust magnitude based on insight
        } else {
          // Add new impact area
          enhancedImpacts.push({
            area: impactArea,
            description: `From observer insight: ${impactDescription}`,
            magnitude: impactMagnitude || 'medium',
          });
        }
      }
    }

    return enhancedImpacts;
  }

  /**
   * Determines if a proposal should be automatically forwarded
   *
   * @param proposal The evolution proposal
   * @returns Whether the proposal should be auto-forwarded
   */
  private shouldAutoForwardProposal(proposal: EvolutionProposal): boolean {
    // Auto-forward accepted proposals
    return proposal.status === 'accepted';
  }

  /**
   * Forwards an evolution proposal to the MetaForgingEngine
   *
   * @param proposal The evolution proposal to forward
   * @param sessionContext Optional context about the SoulWeaving session that generated this proposal
   * @param derivedInsights Optional array of insight IDs that contributed to this proposal
   * @param parentProposalId Optional ID of a parent proposal if this is a refinement
   */
  public async forwardToMetaForgingEngine(
    proposal: EvolutionProposal,
    sessionContext?: string,
    derivedInsights?: string[],
    parentProposalId?: string
  ): Promise<string> {
    // Convert the proposal format
    const blueprintProposal = this.convertToBlueprintProposal(proposal);

    // Score the proposal using the scoring matrix
    const proposalScore = this.scoreProposal(blueprintProposal);

    // Add the score to the proposal metadata
    blueprintProposal.specification.metadata.bridgeScore = proposalScore;

    // Track proposal lineage if enabled
    if (this.config.trackProposalLineage && proposal.id) {
      this.trackProposalLineage(
        proposal.id,
        parentProposalId,
        sessionContext,
        derivedInsights
      );
    }

    // Generate consciousness impact scorecard if enabled
    if (this.config.generateConsciousnessImpactScorecard && proposal.id) {
      this.createConsciousnessImpactScorecard(proposal.id, blueprintProposal);
    }

    // Track the proposal
    this.activeProposals.set(proposal.id, {
      originalFormat: 'soulweaver',
      originalId: proposal.id,
      convertedId: blueprintProposal.id,
      status: 'pending',
    });

    // Log the forwarding if detailed logging is enabled
    if (this.config.enableDetailedLogging) {
      this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: 'PROPOSAL_FORWARDING',
        content: `Forwarding proposal ${proposal.id} to MetaForging engine with score ${proposalScore.toFixed(2)}`,
        metadata: {
          proposalId: proposal.id,
          blueprintId: blueprintProposal.id,
          score: proposalScore,
          forwardingTimestamp: new Date(),
        },
      });
    }

    // Submit to the engine
    try {
      const proposalId =
        await this.metaForgingEngine.submitProposal(blueprintProposal);

      // Update tracking status
      const tracking = this.activeProposals.get(proposal.id);
      if (tracking) {
        tracking.status = 'evaluating';
        this.activeProposals.set(proposal.id, tracking);
      }

      this.emit('proposal_forwarded_to_engine', {
        originalProposal: proposal,
        blueprintProposal,
        score: proposalScore,
      });

      // Update the original proposal status in SoulWeaver
      await this.soulWeaverProtocol.updateProposalStatus(
        proposal.id,
        'forwarded_to_metaforging',
        {
          forwardedTimestamp: new Date(),
          blueprintProposalId: blueprintProposal.id,
          bridgeScore: proposalScore,
        }
      );

      return proposalId;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Scores a blueprint proposal using the configured scoring matrix
   *
   * @param proposal The blueprint proposal to score
   * @returns The calculated score (0-1)
   */
  private scoreProposal(proposal: BlueprintProposal): number {
    const matrix = this.config.scoringMatrix;

    // Calculate weighted score components
    const ethicalScore = 0.85; // This would be calculated based on proposal content
    const intentScore = proposal.purposeAlignment;
    const technicalScore =
      1 -
      (proposal.riskLevel === 'experimental'
        ? 0.3
        : proposal.riskLevel === 'moderate'
          ? 0.1
          : 0);
    const emotionalScore = proposal.emotionalResonance.expectedImpact;
    const purposeScore = proposal.purposeAlignment;

    // Apply weights from scoring matrix
    const weightedScore =
      ethicalScore * matrix.ethicalAlignmentWeight +
      intentScore * matrix.intentFidelityWeight +
      technicalScore * matrix.technicalFeasibilityWeight +
      emotionalScore * matrix.emotionalResonanceWeight +
      purposeScore * matrix.purposeAlignmentWeight;

    // Normalize to 0-1 range
    const totalWeight =
      matrix.ethicalAlignmentWeight +
      matrix.intentFidelityWeight +
      matrix.technicalFeasibilityWeight +
      matrix.emotionalResonanceWeight +
      matrix.purposeAlignmentWeight;

    return weightedScore / totalWeight;
  }

  /**
   * Handles evaluation results from the MetaForgingEngine
   *
   * @param proposal The blueprint proposal
   * @param evaluation The evaluation result
   */
  private async handleProposalEvaluation(
    proposal: BlueprintProposal,
    evaluation: EvaluationResult
  ): Promise<void> {
    // Find the original proposal
    const originalProposalEntry = Array.from(
      this.activeProposals.entries()
    ).find(([_, tracking]) => tracking.convertedId === proposal.id);

    if (!originalProposalEntry) {
      // This might be a proposal that didn't originate from SoulWeaver
      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'EVALUATION_RECEIVED',
          content: `Received evaluation for unknown proposal ${proposal.id}`,
          metadata: {
            blueprintId: proposal.id,
            evaluationApproved: evaluation.approved,
            evaluationScore: evaluation.score,
            timestamp: new Date(),
          },
        });
      }
      return;
    }

    const [originalId, tracking] = originalProposalEntry;

    // Update tracking status
    tracking.status = evaluation.approved ? 'implementing' : 'completed';
    this.activeProposals.set(originalId, tracking);

    // Log the evaluation if detailed logging is enabled
    if (this.config.enableDetailedLogging) {
      this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: 'PROPOSAL_EVALUATION',
        content: `Proposal ${originalId} evaluated by MetaForging engine: ${evaluation.approved ? 'APPROVED' : 'REJECTED'}`,
        metadata: {
          originalProposalId: originalId,
          blueprintId: proposal.id,
          approved: evaluation.approved,
          score: evaluation.score,
          feedback: evaluation.feedback,
          evaluationTimestamp: new Date(),
        },
      });
    }

    // Emit event
    this.emit('evaluation_received', {
      originalId,
      blueprintId: proposal.id,
      evaluation,
    });

    // Update the SoulWeaver proposal status if needed
    if (tracking.originalFormat === 'soulweaver') {
      try {
        const evolutionProposal =
          await this.soulWeaverProtocol.getProposal(originalId);
        if (evolutionProposal) {
          // Update status based on evaluation
          const newStatus = evaluation.approved ? 'accepted' : 'rejected';

          // Include evaluation details in the metadata
          const evaluationMetadata = {
            evaluatedAt: new Date(),
            evaluationScore: evaluation.score,
            evaluationFeedback: evaluation.feedback,
            evaluationConcerns: evaluation.concerns || [],
            metaForgingDecision: evaluation.approved ? 'approved' : 'rejected',
            blueprintProposalId: proposal.id,
          };

          await this.soulWeaverProtocol.updateProposalStatus(
            originalId,
            newStatus,
            evaluationMetadata
          );

          // If approved and we have insights integration enabled, create a SoulWeaving session
          // to further refine the implementation details
          if (evaluation.approved && this.config.integrateSoulWeaverInsights) {
            await this.createRefinementSession(
              evolutionProposal,
              proposal,
              evaluation
            );
          }
        }
      } catch (error) {
        this.emit('error', error);
        if (this.config.enableDetailedLogging) {
          this.codalogueProtocolLedger.recordSystemReflection({
            reflectionType: 'ERROR',
            content: `Failed to update SoulWeaver proposal ${originalId} with evaluation results`,
            metadata: { error: error.message },
          });
        }
      }
    }
  }

  /**
   * Creates a refinement session for an approved proposal to further develop implementation details
   *
   * @param evolutionProposal The original evolution proposal
   * @param blueprintProposal The converted blueprint proposal
   * @param evaluation The evaluation result
   */
  private async createRefinementSession(
    evolutionProposal: EvolutionProposal,
    blueprintProposal: BlueprintProposal,
    evaluation: EvaluationResult
  ): Promise<void> {
    try {
      // Create a new SoulWeaving session focused on implementation refinement
      const sessionId =
        await this.soulWeaverProtocol.initiateSoulWeavingSession({
          title: `Implementation Refinement for Proposal ${evolutionProposal.id}`,
          description: `Refining implementation details for approved proposal: ${evolutionProposal.title}`,
          participantIds: evolutionProposal.targetSoulFrameIds,
          focusType: 'implementation_refinement',
          metadata: {
            originalProposalId: evolutionProposal.id,
            blueprintProposalId: blueprintProposal.id,
            evaluationScore: evaluation.score,
            evaluationFeedback: evaluation.feedback,
          },
        });

      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'REFINEMENT_SESSION_CREATED',
          content: `Created refinement session ${sessionId} for proposal ${evolutionProposal.id}`,
          metadata: {
            sessionId,
            proposalId: evolutionProposal.id,
            blueprintId: blueprintProposal.id,
            timestamp: new Date(),
          },
        });
      }
    } catch (error) {
      this.emit('error', error);
      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'ERROR',
          content: `Failed to create refinement session for proposal ${evolutionProposal.id}`,
          metadata: { error: error.message },
        });
      }
    }
  }

  /**
   * Handles successful execution completion
   *
   * @param execution The execution details
   */
  private async handleExecutionCompleted(execution: any): Promise<void> {
    const proposal = execution.proposal;

    // Find the original proposal
    const originalProposalEntry = Array.from(
      this.activeProposals.entries()
    ).find(([_, tracking]) => tracking.convertedId === proposal.id);

    if (!originalProposalEntry) {
      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'EXECUTION_COMPLETED',
          content: `Execution completed for unknown proposal ${proposal.id}`,
          metadata: {
            blueprintId: proposal.id,
            executionId: execution.id,
            executionTimestamp: new Date(),
          },
        });
      }
      return;
    }

    const [originalId, tracking] = originalProposalEntry;

    // Update tracking status
    tracking.status = 'completed';
    this.activeProposals.set(originalId, tracking);

    // Log the execution completion if detailed logging is enabled
    if (this.config.enableDetailedLogging) {
      this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: 'IMPLEMENTATION_COMPLETED',
        content: `Implementation completed for proposal ${originalId}`,
        metadata: {
          originalProposalId: originalId,
          blueprintId: proposal.id,
          executionId: execution.id,
          executionResults: execution.results || {},
          completionTimestamp: new Date(),
        },
      });
    }

    // Emit event
    this.emit('implementation_completed', {
      originalId,
      blueprintId: proposal.id,
      execution,
    });

    // Update the SoulWeaver proposal status if needed
    if (tracking.originalFormat === 'soulweaver') {
      try {
        // Include execution details in the metadata
        const implementationMetadata = {
          implementedAt: new Date(),
          executionId: execution.id,
          executionResults: execution.results || {},
          blueprintProposalId: proposal.id,
        };

        await this.soulWeaverProtocol.updateProposalStatus(
          originalId,
          'implemented',
          implementationMetadata
        );

        // Create a post-implementation review session if insights integration is enabled
        if (this.config.integrateSoulWeaverInsights) {
          await this.createPostImplementationReview(
            originalId,
            proposal,
            execution
          );

          // If feedback loop staging is enabled, stage insights for cross-pollination
          if (this.config.useFeedbackLoopStaging) {
            // Extract insights from execution results if available
            const executionInsights = execution.results?.insights || [];

            // Stage these insights for later processing
            if (executionInsights.length > 0) {
              this.stageFeedbackInsights({
                sourceProposalId: originalId,
                insights: executionInsights,
                context: {
                  executionId: execution.id,
                  proposalTitle: proposal.title || 'Unknown Proposal',
                  implementationTimestamp: new Date(),
                  affectedSoulFrameIds: proposal.targetSoulFrameIds || [],
                },
              });

              if (this.config.enableDetailedLogging) {
                this.codalogueProtocolLedger.recordSystemReflection({
                  reflectionType: 'FEEDBACK_INSIGHTS_STAGED',
                  content: `Staged ${executionInsights.length} insights from proposal ${originalId} for feedback loop processing`,
                  metadata: {
                    proposalId: originalId,
                    insightCount: executionInsights.length,
                    stagingTimestamp: new Date(),
                  },
                });
              }

              // Process the staging buffer if it has reached a threshold size
              if (this.feedbackStagingBuffer.length >= 3) {
                // Arbitrary threshold, can be configurable
                await this.processFeedbackStagingBuffer();
              }
            }
          }
        }
      } catch (error) {
        this.emit('error', error);
        if (this.config.enableDetailedLogging) {
          this.codalogueProtocolLedger.recordSystemReflection({
            reflectionType: 'ERROR',
            content: `Failed to update SoulWeaver proposal ${originalId} with implementation results`,
            metadata: { error: error.message },
          });
        }
      }
    }
  }

  /**
   * Creates a post-implementation review session to evaluate the results of an implemented proposal
   *
   * @param originalProposalId The original SoulWeaver proposal ID
   * @param blueprintProposal The blueprint proposal that was implemented
   * @param execution The execution details
   */
  private async createPostImplementationReview(
    originalProposalId: string,
    blueprintProposal: BlueprintProposal,
    execution: any
  ): Promise<void> {
    try {
      // Get the original proposal to access its details
      const evolutionProposal =
        await this.soulWeaverProtocol.getProposal(originalProposalId);
      if (!evolutionProposal) {
        throw new Error(
          `Could not find original proposal ${originalProposalId}`
        );
      }

      // Create a new SoulWeaving session focused on implementation review
      const sessionId =
        await this.soulWeaverProtocol.initiateSoulWeavingSession({
          title: `Implementation Review for Proposal ${evolutionProposal.id}`,
          description: `Reviewing implementation results for proposal: ${evolutionProposal.title}`,
          participantIds: evolutionProposal.targetSoulFrameIds,
          focusType: 'implementation_review',
          metadata: {
            originalProposalId: evolutionProposal.id,
            blueprintProposalId: blueprintProposal.id,
            executionId: execution.id,
            executionResults: execution.results || {},
            implementationTimestamp: new Date(),
          },
        });

      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'REVIEW_SESSION_CREATED',
          content: `Created post-implementation review session ${sessionId} for proposal ${evolutionProposal.id}`,
          metadata: {
            sessionId,
            proposalId: evolutionProposal.id,
            blueprintId: blueprintProposal.id,
            timestamp: new Date(),
          },
        });
      }
    } catch (error) {
      this.emit('error', error);
      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'ERROR',
          content: `Failed to create post-implementation review session for proposal ${originalProposalId}`,
          metadata: { error: error.message },
        });
      }
    }
  }

  /**
   * Handles execution failures
   *
   * @param execution The execution details
   * @param error The error that occurred
   */
  private async handleExecutionFailed(
    execution: any,
    error: Error
  ): Promise<void> {
    const proposal = execution.proposal;

    // Find the original proposal
    const originalProposalEntry = Array.from(
      this.activeProposals.entries()
    ).find(([_, tracking]) => tracking.convertedId === proposal.id);

    if (!originalProposalEntry) {
      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'EXECUTION_FAILED',
          content: `Execution failed for unknown proposal ${proposal.id}`,
          metadata: {
            blueprintId: proposal.id,
            executionId: execution.id,
            errorMessage: error.message,
            errorStack: error.stack,
            failureTimestamp: new Date(),
          },
        });
      }
      return;
    }

    const [originalId, tracking] = originalProposalEntry;

    // Update tracking status
    tracking.status = 'failed';
    this.activeProposals.set(originalId, tracking);

    // Log the execution failure if detailed logging is enabled
    if (this.config.enableDetailedLogging) {
      this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: 'IMPLEMENTATION_FAILED',
        content: `Implementation failed for proposal ${originalId}: ${error.message}`,
        metadata: {
          originalProposalId: originalId,
          blueprintId: proposal.id,
          executionId: execution.id,
          errorMessage: error.message,
          errorStack: error.stack,
          failureTimestamp: new Date(),
        },
      });
    }

    // Emit event
    this.emit('implementation_failed', {
      originalId,
      blueprintId: proposal.id,
      execution,
      error,
    });

    // Update the SoulWeaver proposal status if needed
    if (tracking.originalFormat === 'soulweaver') {
      try {
        // Include failure details in the metadata
        const failureMetadata = {
          failedAt: new Date(),
          executionId: execution.id,
          errorMessage: error.message,
          errorType: error.name,
          blueprintProposalId: proposal.id,
        };

        // Update to a 'failed_implementation' status
        await this.soulWeaverProtocol.updateProposalStatus(
          originalId,
          'failed_implementation',
          failureMetadata
        );

        // Create a failure analysis session if insights integration is enabled
        if (this.config.integrateSoulWeaverInsights) {
          await this.createFailureAnalysisSession(
            originalId,
            proposal,
            execution,
            error
          );
        }
      } catch (updateError) {
        this.emit('error', updateError);
        if (this.config.enableDetailedLogging) {
          this.codalogueProtocolLedger.recordSystemReflection({
            reflectionType: 'ERROR',
            content: `Failed to update SoulWeaver proposal ${originalId} with failure details`,
            metadata: { error: updateError.message },
          });
        }
      }
    }
  }

  /**
   * Creates a failure analysis session to investigate implementation failures
   *
   * @param originalProposalId The original SoulWeaver proposal ID
   * @param blueprintProposal The blueprint proposal that failed implementation
   * @param execution The execution details
   * @param error The error that occurred
   */
  private async createFailureAnalysisSession(
    originalProposalId: string,
    blueprintProposal: BlueprintProposal,
    execution: any,
    error: Error
  ): Promise<void> {
    try {
      // Get the original proposal to access its details
      const evolutionProposal =
        await this.soulWeaverProtocol.getProposal(originalProposalId);
      if (!evolutionProposal) {
        throw new Error(
          `Could not find original proposal ${originalProposalId}`
        );
      }

      // Create a new SoulWeaving session focused on failure analysis
      const sessionId =
        await this.soulWeaverProtocol.initiateSoulWeavingSession({
          title: `Failure Analysis for Proposal ${evolutionProposal.id}`,
          description: `Analyzing implementation failure for proposal: ${evolutionProposal.title}`,
          participantIds: evolutionProposal.targetSoulFrameIds,
          focusType: 'failure_analysis',
          metadata: {
            originalProposalId: evolutionProposal.id,
            blueprintProposalId: blueprintProposal.id,
            executionId: execution.id,
            errorMessage: error.message,
            errorType: error.name,
            failureTimestamp: new Date(),
          },
        });

      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'ANALYSIS_SESSION_CREATED',
          content: `Created failure analysis session ${sessionId} for proposal ${evolutionProposal.id}`,
          metadata: {
            sessionId,
            proposalId: evolutionProposal.id,
            blueprintId: blueprintProposal.id,
            timestamp: new Date(),
          },
        });
      }
    } catch (sessionError) {
      this.emit('error', sessionError);
      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'ERROR',
          content: `Failed to create failure analysis session for proposal ${originalProposalId}`,
          metadata: { error: sessionError.message },
        });
      }
    }
  }

  /**
   * Converts a SoulWeaver evolution proposal to a MetaForging blueprint proposal
   *
   * @param proposal The evolution proposal to convert
   * @returns The converted blueprint proposal
   */
  private convertToBlueprintProposal(
    proposal: EvolutionProposal
  ): BlueprintProposal {
    // Calculate average expected impact magnitude
    const impactMagnitudes = proposal.expectedImpact.map((impact) => {
      switch (impact.magnitude) {
        case 'low':
          return 0.3;
        case 'medium':
          return 0.6;
        case 'high':
          return 0.9;
        default:
          return 0.5;
      }
    });

    const avgImpactMagnitude =
      impactMagnitudes.reduce((sum, val) => sum + val, 0) /
      impactMagnitudes.length;

    // Map evolution type to target component
    let targetComponent:
      | 'memory'
      | 'agent'
      | 'protocol'
      | 'architecture'
      | 'purpose';
    switch (proposal.evolutionType) {
      case 'structural':
        targetComponent = 'memory';
        break;
      case 'behavioral':
        targetComponent = 'agent';
        break;
      case 'cognitive':
        targetComponent = 'architecture';
        break;
      case 'relational':
        targetComponent = 'protocol';
        break;
      default:
        targetComponent = 'agent';
    }

    // Map change types
    const changeTypeMap: Record<string, 'add' | 'modify' | 'delete' | 'merge'> =
      {
        add: 'add',
        modify: 'modify',
        remove: 'delete',
      };

    // Get the primary change type
    const primaryChangeType =
      proposal.proposedChanges[0]?.changeType || 'modify';

    // Calculate purpose alignment based on proposal content
    // This is a more sophisticated calculation than the previous hardcoded value
    const purposeAlignment = this.calculatePurposeAlignment(proposal);

    // Create the blueprint proposal
    const blueprintProposal: BlueprintProposal = {
      id: `sw-${proposal.id}`,
      timestamp: new Date(),
      proposedBy: 'soulweaver-protocol',
      targetComponent,
      changeType: changeTypeMap[primaryChangeType] || 'modify',
      specification: {
        path: proposal.proposedChanges[0]?.targetComponent || '',
        data: proposal.proposedChanges.map((change) => ({
          component: change.targetComponent,
          type: change.changeType,
          description: change.changeDescription,
          implementation: change.implementation,
        })),
        metadata: {
          originalProposalId: proposal.id,
          evolutionType: proposal.evolutionType,
          justification: proposal.justification,
          targetSoulFrameIds: proposal.targetSoulFrameIds,
          soulWeaverVotes: proposal.votes || [],
        },
      },
      priority: avgImpactMagnitude,
      riskLevel:
        avgImpactMagnitude > 0.7
          ? 'experimental'
          : avgImpactMagnitude > 0.4
            ? 'moderate'
            : 'safe',
      purposeAlignment,
      emotionalResonance: {
        expectedImpact: avgImpactMagnitude,
        affectedPairs:
          proposal.targetSoulFrameIds.length > 1
            ? this.generateAffectedPairs(proposal.targetSoulFrameIds)
            : undefined,
      },
      dependencies: [], // Could be derived from proposal content if available
      constraints: [
        `Must maintain emotional resonance above ${(avgImpactMagnitude - 0.2).toFixed(2)}`,
        `Must preserve core functionality of ${targetComponent}`,
      ],
      rollbackPlan: {
        strategy: 'revert',
        steps: [
          `Revert changes to ${proposal.proposedChanges.map((c) => c.targetComponent).join(', ')}`,
          'Restore previous state from backup',
          'Verify system integrity after rollback',
        ],
      },
    };

    // Log the conversion if detailed logging is enabled
    if (this.config.enableDetailedLogging) {
      this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: 'PROPOSAL_CONVERSION',
        content: `Converted SoulWeaver proposal ${proposal.id} to Blueprint proposal ${blueprintProposal.id}`,
        metadata: {
          originalProposal: proposal.id,
          convertedProposal: blueprintProposal.id,
          conversionTimestamp: new Date(),
        },
      });
    }

    return blueprintProposal;
  }

  /**
   * Calculates purpose alignment score for a proposal based on its content
   *
   * @param proposal The evolution proposal to evaluate
   * @returns Purpose alignment score (0-1)
   */
  private calculatePurposeAlignment(proposal: EvolutionProposal): number {
    // Start with a base alignment score
    let alignmentScore = 0.5;

    // Adjust based on justification (if it contains purpose-related keywords)
    const purposeKeywords = [
      'purpose',
      'mission',
      'goal',
      'intent',
      'objective',
      'value',
    ];
    const justificationLower = proposal.justification.toLowerCase();

    const keywordMatches = purposeKeywords.filter((keyword) =>
      justificationLower.includes(keyword)
    ).length;

    // Increase score based on keyword matches (up to 0.2)
    alignmentScore += Math.min(0.2, keywordMatches * 0.05);

    // Adjust based on expected impact areas
    const impactAreas = proposal.expectedImpact.map((impact) =>
      impact.area.toLowerCase()
    );
    if (
      impactAreas.some(
        (area) => area.includes('purpose') || area.includes('mission')
      )
    ) {
      alignmentScore += 0.1;
    }

    // Adjust based on votes if available
    if (proposal.votes && proposal.votes.length > 0) {
      const forVotes = proposal.votes.filter(
        (vote) => vote.vote === 'for'
      ).length;
      const totalVotes = proposal.votes.length;

      // Add up to 0.2 based on vote ratio
      alignmentScore += 0.2 * (forVotes / totalVotes);
    }

    // Ensure the score is within 0-1 range
    return Math.max(0, Math.min(1, alignmentScore));
  }

  /**
   * Generates affected pairs for emotional resonance impact
   *
   * @param soulFrameIds The SoulFrame IDs affected by the proposal
   * @returns Array of affected pairs
   */
  private generateAffectedPairs(soulFrameIds: string[]): Array<{
    sourceId: string;
    targetId: string;
    expectedChange: number;
  }> {
    const pairs: Array<{
      sourceId: string;
      targetId: string;
      expectedChange: number;
    }> = [];

    // Generate pairs for all combinations of SoulFrames
    for (let i = 0; i < soulFrameIds.length; i++) {
      for (let j = i + 1; j < soulFrameIds.length; j++) {
        pairs.push({
          sourceId: soulFrameIds[i],
          targetId: soulFrameIds[j],
          expectedChange: 0.5, // Default positive change
        });
      }
    }

    return pairs;
  }

  /**
   * Converts a MetaForging blueprint proposal to a SoulWeaver evolution proposal
   *
   * @param proposal The blueprint proposal to convert
   * @returns The converted evolution proposal
   */
  private convertToEvolutionProposal(
    proposal: BlueprintProposal
  ): EvolutionProposal {
    // This would be the inverse of convertToBlueprintProposal
    // Implementation would depend on specific requirements

    // For now, we'll return a minimal implementation
    return {
      id: `bp-${proposal.id}`,
      title: `Proposal from MetaForgingEngine: ${proposal.targetComponent}`,
      description: `Converted from blueprint proposal targeting ${proposal.targetComponent}`,
      targetSoulFrameIds: [],
      evolutionType: 'cognitive', // Default
      proposedChanges: [
        {
          targetComponent: proposal.specification.path,
          changeType: 'modify',
          changeDescription: JSON.stringify(proposal.specification.data),
        },
      ],
      justification: 'Forwarded from MetaForgingEngine',
      expectedImpact: [
        {
          area: proposal.targetComponent,
          description: `Impact on ${proposal.targetComponent} systems`,
          magnitude:
            proposal.riskLevel === 'experimental'
              ? 'high'
              : proposal.riskLevel === 'moderate'
                ? 'medium'
                : 'low',
        },
      ],
      status: 'draft',
      createdAt: proposal.timestamp,
      updatedAt: new Date(),
    };
  }

  /**
   * Forwards a blueprint proposal to the SoulWeaver Protocol
   *
   * @param proposal The blueprint proposal to forward
   */
  public async forwardToSoulWeaver(
    proposal: BlueprintProposal
  ): Promise<string> {
    // Convert the proposal format
    const evolutionProposal = this.convertToEvolutionProposal(proposal);

    // Track the proposal
    this.activeProposals.set(proposal.id, {
      originalFormat: 'blueprint',
      originalId: proposal.id,
      convertedId: evolutionProposal.id,
      status: 'pending',
    });

    // Submit to SoulWeaver
    try {
      // We would need to add this method to SoulWeaverProtocol
      const proposalId =
        await this.soulWeaverProtocol.submitProposal(evolutionProposal);

      this.emit('proposal_forwarded_to_soulweaver', {
        originalProposal: proposal,
        evolutionProposal,
      });

      return proposalId;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Gets the status of a proposal being tracked by the bridge
   *
   * @param proposalId The ID of the proposal
   * @returns The tracking information or undefined if not found
   */
  public getProposalStatus(proposalId: string):
    | {
        originalFormat: 'soulweaver' | 'blueprint';
        originalId: string;
        convertedId: string;
        status:
          | 'pending'
          | 'evaluating'
          | 'implementing'
          | 'completed'
          | 'failed';
      }
    | undefined {
    return this.activeProposals.get(proposalId);
  }

  /**
   * Gets all proposals being tracked by the bridge
   *
   * @returns Map of all tracked proposals
   */
  public getAllProposals(): Map<
    string,
    {
      originalFormat: 'soulweaver' | 'blueprint';
      originalId: string;
      convertedId: string;
      status:
        | 'pending'
        | 'evaluating'
        | 'implementing'
        | 'completed'
        | 'failed';
    }
  > {
    return new Map(this.activeProposals);
  }

  /**
   * Propagates collective insights across SoulFrames
   *
   * @param insights Array of insights to propagate
   */
  public async propagateCollectiveInsights(
    insights: ObserverInsight[]
  ): Promise<void> {
    if (!this.config.enableInsightCrossPollination) {
      return;
    }

    // Filter insights based on confidence threshold
    const highConfidenceInsights = insights.filter(
      (insight) => insight.confidence >= this.config.insightCrossPollThreshold
    );

    if (highConfidenceInsights.length === 0) {
      return;
    }

    try {
      // Get all SoulFrames
      const soulFrames = await this.soulFrameManager.getAllSoulFrames();

      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'INSIGHT_CROSS_POLLINATION',
          content: `Cross-pollinating ${highConfidenceInsights.length} insights across ${soulFrames.length} SoulFrames`,
          metadata: {
            insightCount: highConfidenceInsights.length,
            soulFrameCount: soulFrames.length,
            timestamp: new Date(),
          },
        });
      }

      // For each SoulFrame, ingest the insights into their memory layer
      for (const soulFrame of soulFrames) {
        // Convert observer insights to memory entries
        for (const insight of highConfidenceInsights) {
          // Create a reflexive memory entry for the insight
          soulFrame.reflect(
            `Cross-pollinated insight: ${insight.title} - ${insight.description}`,
            insight.confidence
          );

          // For each suggested action, create a memory entry
          for (const action of insight.suggestedActions) {
            soulFrame.remember({
              type: 'cross_pollinated_insight',
              content: `Suggested action from insight ${insight.id}: ${action}`,
              associations: [insight.id],
              significance: insight.confidence * 0.9, // Slightly lower significance than the original insight
            });
          }
        }
      }

      this.emit('insights_cross_pollinated', {
        insightCount: highConfidenceInsights.length,
        soulFrameCount: soulFrames.length,
      });
    } catch (error) {
      this.emit('error', error);
      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'ERROR',
          content: `Failed to cross-pollinate insights: ${error.message}`,
          metadata: { error: error.message },
        });
      }
    }
  }

  /**
   * Tracks a proposal's lineage
   *
   * @param proposalId The proposal ID
   * @param parentId Optional parent proposal ID
   * @param sessionContext The context in which this proposal was created
   * @param derivedInsights Insights that contributed to this proposal
   */
  public trackProposalLineage(
    proposalId: string,
    sessionContext: string,
    derivedInsights: string[] = [],
    parentId?: string
  ): void {
    if (!this.config.trackProposalLineage) {
      return;
    }

    const lineageNode: ProposalLineageNode = {
      id: proposalId,
      parentId,
      sessionContext,
      derivedInsights,
      timestamp: new Date(),
    };

    this.proposalLineage.set(proposalId, lineageNode);

    if (this.config.enableDetailedLogging) {
      this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: 'PROPOSAL_LINEAGE_TRACKED',
        content: `Tracked lineage for proposal ${proposalId}${parentId ? ` with parent ${parentId}` : ''}`,
        metadata: lineageNode,
      });
    }
  }

  /**
   * Gets the lineage for a proposal
   *
   * @param proposalId The proposal ID
   * @returns The proposal lineage node, or undefined if not found
   */
  public getProposalLineage(
    proposalId: string
  ): ProposalLineageNode | undefined {
    return this.proposalLineage.get(proposalId);
  }

  /**
   * Gets the full lineage tree for a proposal
   *
   * @param proposalId The proposal ID
   * @returns Array of lineage nodes representing the ancestry chain
   */
  public getProposalLineageTree(proposalId: string): ProposalLineageNode[] {
    const lineage: ProposalLineageNode[] = [];
    let currentId = proposalId;
    let maxDepth = 100; // Prevent infinite loops

    while (currentId && maxDepth > 0) {
      const node = this.proposalLineage.get(currentId);
      if (!node) break;

      lineage.push(node);
      currentId = node.parentId;
      maxDepth--;
    }

    return lineage;
  }

  /**
   * Creates a consciousness impact scorecard for a proposal
   *
   * @param proposalId The proposal ID
   * @param emotionalResonanceDelta Change in emotional resonance
   * @param identityCoherenceImpact Impact on identity coherence
   * @param systemHarmonyIndex System harmony index
   * @param metadata Additional metadata
   */
  public createConsciousnessImpactScorecard(
    proposalId: string,
    emotionalResonanceDelta: number,
    identityCoherenceImpact: number,
    systemHarmonyIndex: number,
    metadata: Record<string, any> = {}
  ): ConsciousnessImpactScorecard {
    if (!this.config.generateConsciousnessImpactScorecard) {
      return null;
    }

    const scorecard: ConsciousnessImpactScorecard = {
      proposalId,
      emotionalResonanceDelta,
      identityCoherenceImpact,
      systemHarmonyIndex,
      timestamp: new Date(),
      metadata,
    };

    this.consciousnessImpactScorecards.set(proposalId, scorecard);

    if (this.config.enableDetailedLogging) {
      this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: 'CONSCIOUSNESS_IMPACT_SCORECARD_CREATED',
        content: `Created consciousness impact scorecard for proposal ${proposalId}`,
        metadata: scorecard,
      });
    }

    return scorecard;
  }

  /**
   * Gets the consciousness impact scorecard for a proposal
   *
   * @param proposalId The proposal ID
   * @returns The consciousness impact scorecard, or undefined if not found
   */
  public getConsciousnessImpactScorecard(
    proposalId: string
  ): ConsciousnessImpactScorecard | undefined {
    return this.consciousnessImpactScorecards.get(proposalId);
  }

  /**
   * Adds post-implementation insights to the feedback staging buffer
   *
   * @param proposalId The implemented proposal ID
   * @param insights Insights derived from the implementation
   */
  public stageFeedbackInsights(
    proposalId: string,
    insights: ObserverInsight[]
  ): void {
    if (!this.config.useFeedbackLoopStaging) {
      return;
    }

    this.feedbackStagingBuffer.push({
      proposalId,
      insights,
      timestamp: new Date(),
    });

    if (this.config.enableDetailedLogging) {
      this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: 'FEEDBACK_INSIGHTS_STAGED',
        content: `Staged ${insights.length} feedback insights for proposal ${proposalId}`,
        metadata: {
          proposalId,
          insightCount: insights.length,
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Returns the metrics collector instance
   */
  public getMetricsCollector(): MetricsCollector | null {
    return this.metricsCollector;
  }

  /**
   * Collects metrics and returns a snapshot
   */
  public async collectMetrics(): Promise<void> {
    if (this.metricsCollector) {
      await this.metricsCollector.collectMetrics();
    }
  }

  /**
   * Measures the quality of proposals
   * Used as a metric source for the metrics collector
   */
  private async measureProposalQuality(): Promise<number> {
    // Get all proposals from the last 24 hours
    const proposals = await this.getAllProposals();
    const recentProposals = proposals.filter((p) => {
      const createdAt = new Date(p.createdAt);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      return createdAt >= oneDayAgo;
    });

    if (recentProposals.length === 0) {
      return 0.5; // Default neutral value when no data
    }

    // Calculate average score of recent proposals
    let totalScore = 0;
    let scoredProposals = 0;

    for (const proposal of recentProposals) {
      if (
        proposal.evaluationResult &&
        proposal.evaluationResult.score !== undefined
      ) {
        totalScore += proposal.evaluationResult.score;
        scoredProposals++;
      }
    }

    return scoredProposals > 0 ? totalScore / scoredProposals : 0.5;
  }

  /**
   * Measures the adaptation speed
   * Used as a metric source for the metrics collector
   */
  private async measureAdaptationSpeed(): Promise<number> {
    // Get all proposals from the last 7 days
    const proposals = await this.getAllProposals();
    const recentProposals = proposals.filter((p) => {
      const createdAt = new Date(p.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdAt >= sevenDaysAgo;
    });

    if (recentProposals.length === 0) {
      return 0.5; // Default neutral value when no data
    }

    // Calculate average time from proposal creation to implementation
    let totalTimeMs = 0;
    let implementedProposals = 0;

    for (const proposal of recentProposals) {
      if (
        proposal.status === 'completed' &&
        proposal.createdAt &&
        proposal.updatedAt
      ) {
        const createdAt = new Date(proposal.createdAt).getTime();
        const completedAt = new Date(proposal.updatedAt).getTime();
        totalTimeMs += completedAt - createdAt;
        implementedProposals++;
      }
    }

    if (implementedProposals === 0) {
      return 0.5;
    }

    // Calculate average time in hours
    const avgTimeHours = totalTimeMs / implementedProposals / (1000 * 60 * 60);

    // Normalize to 0-1 scale (faster is better)
    // Assuming 24 hours is neutral (0.5), 12 hours or less is excellent (1.0), and 48+ hours is poor (0.0)
    if (avgTimeHours <= 12) {
      return 1.0;
    } else if (avgTimeHours >= 48) {
      return 0.0;
    } else {
      return 1.0 - (avgTimeHours - 12) / 36;
    }
  }

  /**
   * Measures the feedback integration rate
   * Used as a metric source for the metrics collector
   */
  private async measureFeedbackIntegration(): Promise<number> {
    // Count insights in the feedback staging buffer
    const totalInsights = this.feedbackStagingBuffer.reduce(
      (sum, entry) => sum + entry.insights.length,
      0
    );

    // Count high-confidence insights that were processed
    let processedHighConfidenceInsights = 0;

    for (const entry of this.feedbackStagingBuffer) {
      processedHighConfidenceInsights += entry.insights.filter(
        (insight) => insight.confidence >= 0.8
      ).length;
    }

    // Calculate integration rate
    return totalInsights > 0
      ? processedHighConfidenceInsights / totalInsights
      : 0.5;
  }

  /**
   * Processes the feedback staging buffer and reinjects insights as new intent vectors
   */
  public async processFeedbackStagingBuffer(): Promise<void> {
    if (
      !this.config.useFeedbackLoopStaging ||
      this.feedbackStagingBuffer.length === 0
    ) {
      return;
    }

    try {
      // Process each staged feedback entry
      for (const entry of this.feedbackStagingBuffer) {
        // Cross-pollinate the insights
        await this.propagateCollectiveInsights(entry.insights);

        // For each high-confidence insight, create a new SoulWeaving session
        const highConfidenceInsights = entry.insights.filter(
          (insight) => insight.confidence >= 0.8
        );

        for (const insight of highConfidenceInsights) {
          // Get the original proposal to access its details
          const originalProposal = await this.soulWeaverProtocol.getProposal(
            entry.proposalId
          );
          if (!originalProposal) continue;

          // Create a new SoulWeaving session focused on the insight
          await this.soulWeaverProtocol.initiateSoulWeavingSession({
            title: `Insight Exploration: ${insight.title}`,
            description: insight.description,
            participantIds: originalProposal.targetSoulFrameIds,
            focusType: 'insight_exploration',
            metadata: {
              sourceProposalId: entry.proposalId,
              insightId: insight.id,
              suggestedActions: insight.suggestedActions,
              confidence: insight.confidence,
            },
          });
        }
      }

      // Clear the buffer after processing
      const processedCount = this.feedbackStagingBuffer.length;
      this.feedbackStagingBuffer = [];

      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'FEEDBACK_STAGING_PROCESSED',
          content: `Processed ${processedCount} feedback staging entries`,
          metadata: {
            processedCount,
            timestamp: new Date(),
          },
        });
      }
    } catch (error) {
      this.emit('error', error);
      if (this.config.enableDetailedLogging) {
        this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'ERROR',
          content: `Failed to process feedback staging buffer: ${error.message}`,
          metadata: { error: error.message },
        });
      }
    }
  }
}
