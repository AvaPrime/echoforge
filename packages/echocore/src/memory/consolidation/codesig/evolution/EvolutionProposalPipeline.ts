/**
 * Evolution Proposal Pipeline
 *
 * Automates the generation, review, and acceptance of system-wide upgrades
 * via debate and consensus hooks.
 */

import { SoulFrameManager } from '../SoulFrameManager';
import { CodalogueProtocolLedger } from '../CodalogueProtocolLedger';
import { SoulWeaverProtocol } from '../soulweaver/SoulWeaverProtocol';
import { EvolutionProposal } from '../soulweaver/SoulWeaverContract';
import { ObserverInsight } from '../observer/CodalogueObserverAgent';
import { v4 as uuidv4 } from 'uuid';

/**
 * Status of an evolution proposal in the pipeline
 */
export enum ProposalStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  DEBATE_IN_PROGRESS = 'debate_in_progress',
  VOTING = 'voting',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
  FAILED = 'failed',
}

/**
 * Result of a proposal review
 */
export interface ProposalReview {
  /** Unique identifier for the review */
  id: string;

  /** ID of the proposal being reviewed */
  proposalId: string;

  /** ID of the SoulFrame that performed the review */
  reviewerId: string;

  /** Overall score (0-1) */
  score: number;

  /** Detailed feedback */
  feedback: string;

  /** Specific concerns or issues */
  concerns: string[];

  /** Suggested improvements */
  suggestions: string[];

  /** Timestamp of the review */
  timestamp: Date;
}

/**
 * Result of a proposal debate
 */
export interface ProposalDebate {
  /** Unique identifier for the debate */
  id: string;

  /** ID of the proposal being debated */
  proposalId: string;

  /** IDs of the SoulFrames participating in the debate */
  participantIds: string[];

  /** Key points raised during the debate */
  keyPoints: string[];

  /** Areas of consensus */
  consensusAreas: string[];

  /** Areas of disagreement */
  disagreementAreas: string[];

  /** Outcome of the debate */
  outcome: 'consensus' | 'majority' | 'split' | 'inconclusive';

  /** Summary of the debate */
  summary: string;

  /** Timestamp of the debate */
  timestamp: Date;
}

/**
 * Vote on a proposal
 */
export interface ProposalVote {
  /** Unique identifier for the vote */
  id: string;

  /** ID of the proposal being voted on */
  proposalId: string;

  /** ID of the SoulFrame casting the vote */
  voterId: string;

  /** Vote decision */
  decision: 'approve' | 'reject' | 'abstain';

  /** Reasoning behind the vote */
  reasoning: string;

  /** Timestamp of the vote */
  timestamp: Date;
}

/**
 * Implementation plan for an accepted proposal
 */
export interface ImplementationPlan {
  /** Unique identifier for the plan */
  id: string;

  /** ID of the proposal being implemented */
  proposalId: string;

  /** Steps to implement the proposal */
  steps: {
    /** Description of the step */
    description: string;

    /** Status of the step */
    status: 'pending' | 'in_progress' | 'completed' | 'failed';

    /** Assigned SoulFrame ID (if applicable) */
    assignedTo?: string;
  }[];

  /** Overall status of the implementation */
  status: 'pending' | 'in_progress' | 'completed' | 'failed';

  /** Start timestamp */
  startTimestamp: Date | null;

  /** Completion timestamp */
  completionTimestamp: Date | null;
}

/**
 * Configuration for the Evolution Proposal Pipeline
 */
export interface EvolutionPipelineConfig {
  /** Minimum number of reviews required before debate */
  minReviewsRequired: number;

  /** Minimum score threshold for automatic approval to debate stage */
  minReviewScoreThreshold: number;

  /** Minimum number of participants for a debate */
  minDebateParticipants: number;

  /** Maximum number of participants for a debate */
  maxDebateParticipants: number;

  /** Minimum number of votes required for a decision */
  minVotesRequired: number;

  /** Threshold for proposal acceptance (percentage of approve votes) */
  acceptanceThreshold: number;

  /** Whether to automatically implement accepted proposals */
  autoImplementAccepted: boolean;
}

/**
 * Default configuration for the Evolution Proposal Pipeline
 */
export const DEFAULT_PIPELINE_CONFIG: EvolutionPipelineConfig = {
  minReviewsRequired: 3,
  minReviewScoreThreshold: 0.7,
  minDebateParticipants: 3,
  maxDebateParticipants: 7,
  minVotesRequired: 5,
  acceptanceThreshold: 0.66, // Two-thirds majority
  autoImplementAccepted: false,
};

/**
 * Evolution Proposal Pipeline
 *
 * Manages the lifecycle of evolution proposals from creation through implementation.
 */
export class EvolutionProposalPipeline {
  /** Active proposals in the pipeline */
  private proposals: Map<
    string,
    EvolutionProposal & { status: ProposalStatus }
  > = new Map();

  /** Reviews for proposals */
  private reviews: Map<string, ProposalReview[]> = new Map();

  /** Debates for proposals */
  private debates: Map<string, ProposalDebate[]> = new Map();

  /** Votes for proposals */
  private votes: Map<string, ProposalVote[]> = new Map();

  /** Implementation plans for accepted proposals */
  private implementationPlans: Map<string, ImplementationPlan> = new Map();

  /**
   * Creates a new Evolution Proposal Pipeline
   *
   * @param soulFrameManager Manager for accessing SoulFrames
   * @param codalogueProtocolLedger Ledger for recording events
   * @param soulWeaverProtocol Protocol for SoulFrame collaboration
   * @param config Configuration for the pipeline
   */
  constructor(
    private soulFrameManager: SoulFrameManager,
    private codalogueProtocolLedger: CodalogueProtocolLedger,
    private soulWeaverProtocol: SoulWeaverProtocol,
    private config: EvolutionPipelineConfig = DEFAULT_PIPELINE_CONFIG
  ) {}

  /**
   * Submits a new proposal to the pipeline
   *
   * @param proposal The proposal to submit
   * @param initialStatus Optional initial status (defaults to DRAFT)
   * @returns The proposal with its assigned status
   */
  async submitProposal(
    proposal: EvolutionProposal,
    initialStatus: ProposalStatus = ProposalStatus.DRAFT
  ): Promise<EvolutionProposal & { status: ProposalStatus }> {
    // Add status to the proposal
    const proposalWithStatus = { ...proposal, status: initialStatus };

    // Store the proposal
    this.proposals.set(proposal.id, proposalWithStatus);

    // Initialize collections for this proposal
    this.reviews.set(proposal.id, []);
    this.debates.set(proposal.id, []);
    this.votes.set(proposal.id, []);

    // Record the submission in the Codalogue
    await this.codalogueProtocolLedger.recordEvolutionProposal({
      proposalId: proposal.id,
      proposalType: proposal.type,
      title: proposal.title,
      description: proposal.description,
      status: initialStatus,
      proposedBy: proposal.proposedBy,
      affectedSoulFrameIds: proposal.affectedSoulFrameIds,
    });

    return proposalWithStatus;
  }

  /**
   * Creates a new proposal from an observer insight
   *
   * @param insight The insight to create a proposal from
   * @param proposalType The type of proposal to create
   * @param sessionId Optional SoulWeaving session ID
   * @returns The created proposal
   */
  async createProposalFromInsight(
    insight: ObserverInsight,
    proposalType: 'structural' | 'behavioral' | 'cognitive' | 'relational',
    sessionId?: string
  ): Promise<EvolutionProposal & { status: ProposalStatus }> {
    // Get all SoulFrames to determine which are affected
    const soulFrames = await this.soulFrameManager.getAllSoulFrames();

    // Create a SoulWeaving session if not provided
    let session;
    if (sessionId) {
      session = await this.soulWeaverProtocol.getSoulWeavingSession(sessionId);
    } else {
      session = await this.soulWeaverProtocol.initiateSoulWeavingSession(
        soulFrames.map((sf) => sf.identity.id),
        `Session for proposal from insight: ${insight.title}`
      );
    }

    // Determine which SoulFrames are affected based on insight category
    let affectedSoulFrameIds: string[] = [];

    switch (insight.category) {
      case 'system_evolution':
        // System-wide evolution affects all SoulFrames
        affectedSoulFrameIds = soulFrames.map((sf) => sf.identity.id);
        break;

      case 'agent_behavior':
        // Agent behavior affects a subset of SoulFrames
        // For simplicity, we'll select a random subset
        affectedSoulFrameIds = soulFrames
          .slice(0, Math.max(2, Math.floor(soulFrames.length / 2)))
          .map((sf) => sf.identity.id);
        break;

      case 'memory_pattern':
        // Memory patterns affect SoulFrames with the most memories
        // For simplicity, we'll select all SoulFrames
        affectedSoulFrameIds = soulFrames.map((sf) => sf.identity.id);
        break;

      case 'interaction_dynamic':
        // Interaction dynamics affect SoulFrames that interact frequently
        // For simplicity, we'll select all SoulFrames
        affectedSoulFrameIds = soulFrames.map((sf) => sf.identity.id);
        break;
    }

    // Create the proposal
    const proposal: EvolutionProposal = {
      id: uuidv4(),
      sessionId: session.id,
      type: proposalType,
      title: insight.title,
      description: insight.description,
      rationale: `Based on insight: ${insight.description}`,
      proposedChanges: insight.suggestedActions,
      expectedBenefits: [
        'Improved system performance',
        'Enhanced cognitive capabilities',
        'Better adaptation to user needs',
      ],
      potentialRisks: [
        'Temporary disruption during implementation',
        'Unforeseen side effects',
        'Resource allocation trade-offs',
      ],
      proposedBy: 'observer',
      affectedSoulFrameIds,
      metadata: {
        insightId: insight.id,
        confidence: insight.confidence,
        category: insight.category,
      },
    };

    // Submit the proposal to the pipeline
    return this.submitProposal(proposal, ProposalStatus.SUBMITTED);
  }

  /**
   * Updates the status of a proposal
   *
   * @param proposalId ID of the proposal to update
   * @param newStatus New status for the proposal
   * @returns The updated proposal
   */
  async updateProposalStatus(
    proposalId: string,
    newStatus: ProposalStatus
  ): Promise<EvolutionProposal & { status: ProposalStatus }> {
    // Get the proposal
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Update the status
    proposal.status = newStatus;

    // Record the status update in the Codalogue
    await this.codalogueProtocolLedger.recordEvolutionProposal({
      proposalId: proposal.id,
      proposalType: proposal.type,
      title: proposal.title,
      description: proposal.description,
      status: newStatus,
      proposedBy: proposal.proposedBy,
      affectedSoulFrameIds: proposal.affectedSoulFrameIds,
    });

    return proposal;
  }

  /**
   * Submits a review for a proposal
   *
   * @param proposalId ID of the proposal to review
   * @param reviewerId ID of the SoulFrame performing the review
   * @param score Overall score (0-1)
   * @param feedback Detailed feedback
   * @param concerns Specific concerns or issues
   * @param suggestions Suggested improvements
   * @returns The submitted review
   */
  async submitReview(
    proposalId: string,
    reviewerId: string,
    score: number,
    feedback: string,
    concerns: string[] = [],
    suggestions: string[] = []
  ): Promise<ProposalReview> {
    // Get the proposal
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Ensure the proposal is in a reviewable state
    if (
      proposal.status !== ProposalStatus.SUBMITTED &&
      proposal.status !== ProposalStatus.DRAFT
    ) {
      throw new Error(
        `Proposal with ID ${proposalId} is not in a reviewable state`
      );
    }

    // Create the review
    const review: ProposalReview = {
      id: uuidv4(),
      proposalId,
      reviewerId,
      score,
      feedback,
      concerns,
      suggestions,
      timestamp: new Date(),
    };

    // Add the review to the collection
    const reviews = this.reviews.get(proposalId) || [];
    reviews.push(review);
    this.reviews.set(proposalId, reviews);

    // Record the review in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'PROPOSAL_REVIEW',
      content: `Review submitted for proposal: ${proposal.title}`,
      metadata: {
        proposalId,
        reviewId: review.id,
        reviewerId,
        score,
        timestamp: review.timestamp,
      },
    });

    // Check if we have enough reviews to move to the next stage
    await this.checkReviewProgress(proposalId);

    return review;
  }

  /**
   * Checks if a proposal has enough reviews to move to the next stage
   *
   * @param proposalId ID of the proposal to check
   */
  private async checkReviewProgress(proposalId: string): Promise<void> {
    // Get the proposal
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      return;
    }

    // Get the reviews
    const reviews = this.reviews.get(proposalId) || [];

    // Check if we have enough reviews
    if (reviews.length >= this.config.minReviewsRequired) {
      // Calculate the average score
      const avgScore =
        reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length;

      // Check if the average score is high enough
      if (avgScore >= this.config.minReviewScoreThreshold) {
        // Move to the debate stage
        await this.updateProposalStatus(
          proposalId,
          ProposalStatus.UNDER_REVIEW
        );

        // Record the progress in the Codalogue
        await this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'PROPOSAL_REVIEW_COMPLETE',
          content: `Proposal ${proposal.title} has completed review with average score ${avgScore.toFixed(2)}`,
          metadata: {
            proposalId,
            averageScore: avgScore,
            reviewCount: reviews.length,
            timestamp: new Date(),
          },
        });
      } else {
        // Record the rejection in the Codalogue
        await this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'PROPOSAL_REVIEW_REJECTED',
          content: `Proposal ${proposal.title} was rejected during review with average score ${avgScore.toFixed(2)}`,
          metadata: {
            proposalId,
            averageScore: avgScore,
            reviewCount: reviews.length,
            timestamp: new Date(),
          },
        });

        // Reject the proposal
        await this.updateProposalStatus(proposalId, ProposalStatus.REJECTED);
      }
    }
  }

  /**
   * Initiates a debate for a proposal
   *
   * @param proposalId ID of the proposal to debate
   * @param participantIds IDs of the SoulFrames participating in the debate
   * @returns The initiated debate
   */
  async initiateDebate(
    proposalId: string,
    participantIds: string[]
  ): Promise<ProposalDebate> {
    // Get the proposal
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Ensure the proposal is in a debatable state
    if (proposal.status !== ProposalStatus.UNDER_REVIEW) {
      throw new Error(
        `Proposal with ID ${proposalId} is not in a debatable state`
      );
    }

    // Ensure we have enough participants
    if (participantIds.length < this.config.minDebateParticipants) {
      throw new Error(
        `Not enough participants for debate (minimum ${this.config.minDebateParticipants})`
      );
    }

    // Limit the number of participants if necessary
    if (participantIds.length > this.config.maxDebateParticipants) {
      participantIds = participantIds.slice(
        0,
        this.config.maxDebateParticipants
      );
    }

    // Create the debate
    const debate: ProposalDebate = {
      id: uuidv4(),
      proposalId,
      participantIds,
      keyPoints: [],
      consensusAreas: [],
      disagreementAreas: [],
      outcome: 'inconclusive',
      summary: '',
      timestamp: new Date(),
    };

    // Add the debate to the collection
    const debates = this.debates.get(proposalId) || [];
    debates.push(debate);
    this.debates.set(proposalId, debates);

    // Update the proposal status
    await this.updateProposalStatus(
      proposalId,
      ProposalStatus.DEBATE_IN_PROGRESS
    );

    // Record the debate initiation in the Codalogue
    await this.codalogueProtocolLedger.recordAgentDebate({
      debateId: debate.id,
      topic: `Proposal: ${proposal.title}`,
      participantIds,
      summary: `Debate initiated for proposal: ${proposal.title}`,
      outcome: 'in_progress',
      metadata: {
        proposalId,
        debateId: debate.id,
        timestamp: debate.timestamp,
      },
    });

    return debate;
  }

  /**
   * Concludes a debate for a proposal
   *
   * @param debateId ID of the debate to conclude
   * @param keyPoints Key points raised during the debate
   * @param consensusAreas Areas of consensus
   * @param disagreementAreas Areas of disagreement
   * @param outcome Outcome of the debate
   * @param summary Summary of the debate
   * @returns The concluded debate
   */
  async concludeDebate(
    debateId: string,
    keyPoints: string[],
    consensusAreas: string[],
    disagreementAreas: string[],
    outcome: 'consensus' | 'majority' | 'split' | 'inconclusive',
    summary: string
  ): Promise<ProposalDebate> {
    // Find the debate
    let debate: ProposalDebate | undefined;
    let proposalId: string | undefined;

    for (const [pid, debates] of this.debates.entries()) {
      const found = debates.find((d) => d.id === debateId);
      if (found) {
        debate = found;
        proposalId = pid;
        break;
      }
    }

    if (!debate || !proposalId) {
      throw new Error(`Debate with ID ${debateId} not found`);
    }

    // Get the proposal
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Update the debate
    debate.keyPoints = keyPoints;
    debate.consensusAreas = consensusAreas;
    debate.disagreementAreas = disagreementAreas;
    debate.outcome = outcome;
    debate.summary = summary;

    // Record the debate conclusion in the Codalogue
    await this.codalogueProtocolLedger.recordAgentDebate({
      debateId: debate.id,
      topic: `Proposal: ${proposal.title}`,
      participantIds: debate.participantIds,
      summary: debate.summary,
      outcome: debate.outcome,
      metadata: {
        proposalId,
        debateId: debate.id,
        keyPoints: debate.keyPoints,
        consensusAreas: debate.consensusAreas,
        disagreementAreas: debate.disagreementAreas,
        timestamp: new Date(),
      },
    });

    // Move to voting if the outcome is positive
    if (outcome === 'consensus' || outcome === 'majority') {
      await this.updateProposalStatus(proposalId, ProposalStatus.VOTING);
    } else {
      // For inconclusive or split outcomes, we might want to initiate another debate
      // or reject the proposal, depending on the specific rules
      // For simplicity, we'll move to voting anyway
      await this.updateProposalStatus(proposalId, ProposalStatus.VOTING);
    }

    return debate;
  }

  /**
   * Casts a vote on a proposal
   *
   * @param proposalId ID of the proposal to vote on
   * @param voterId ID of the SoulFrame casting the vote
   * @param decision Vote decision
   * @param reasoning Reasoning behind the vote
   * @returns The cast vote
   */
  async castVote(
    proposalId: string,
    voterId: string,
    decision: 'approve' | 'reject' | 'abstain',
    reasoning: string
  ): Promise<ProposalVote> {
    // Get the proposal
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Ensure the proposal is in a votable state
    if (proposal.status !== ProposalStatus.VOTING) {
      throw new Error(
        `Proposal with ID ${proposalId} is not in a votable state`
      );
    }

    // Check if the voter has already voted
    const votes = this.votes.get(proposalId) || [];
    const existingVote = votes.find((v) => v.voterId === voterId);

    if (existingVote) {
      throw new Error(
        `SoulFrame with ID ${voterId} has already voted on this proposal`
      );
    }

    // Create the vote
    const vote: ProposalVote = {
      id: uuidv4(),
      proposalId,
      voterId,
      decision,
      reasoning,
      timestamp: new Date(),
    };

    // Add the vote to the collection
    votes.push(vote);
    this.votes.set(proposalId, votes);

    // Record the vote in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'PROPOSAL_VOTE',
      content: `Vote cast for proposal: ${proposal.title}`,
      metadata: {
        proposalId,
        voteId: vote.id,
        voterId,
        decision,
        timestamp: vote.timestamp,
      },
    });

    // Check if we have enough votes to make a decision
    await this.checkVotingProgress(proposalId);

    return vote;
  }

  /**
   * Checks if a proposal has enough votes to make a decision
   *
   * @param proposalId ID of the proposal to check
   */
  private async checkVotingProgress(proposalId: string): Promise<void> {
    // Get the proposal
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      return;
    }

    // Get the votes
    const votes = this.votes.get(proposalId) || [];

    // Check if we have enough votes
    if (votes.length >= this.config.minVotesRequired) {
      // Count the votes
      const approveVotes = votes.filter((v) => v.decision === 'approve').length;
      const rejectVotes = votes.filter((v) => v.decision === 'reject').length;
      const abstainVotes = votes.filter((v) => v.decision === 'abstain').length;

      // Calculate the approval percentage (excluding abstentions)
      const totalDecisiveVotes = approveVotes + rejectVotes;
      const approvalPercentage =
        totalDecisiveVotes > 0 ? approveVotes / totalDecisiveVotes : 0;

      // Check if the proposal is accepted
      if (approvalPercentage >= this.config.acceptanceThreshold) {
        // Accept the proposal
        await this.updateProposalStatus(proposalId, ProposalStatus.ACCEPTED);

        // Record the acceptance in the Codalogue
        await this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'PROPOSAL_ACCEPTED',
          content: `Proposal ${proposal.title} was accepted with ${(approvalPercentage * 100).toFixed(1)}% approval`,
          metadata: {
            proposalId,
            approveVotes,
            rejectVotes,
            abstainVotes,
            approvalPercentage,
            timestamp: new Date(),
          },
        });

        // Automatically create an implementation plan if configured
        if (this.config.autoImplementAccepted) {
          await this.createImplementationPlan(proposalId);
        }
      } else {
        // Reject the proposal
        await this.updateProposalStatus(proposalId, ProposalStatus.REJECTED);

        // Record the rejection in the Codalogue
        await this.codalogueProtocolLedger.recordSystemReflection({
          reflectionType: 'PROPOSAL_REJECTED',
          content: `Proposal ${proposal.title} was rejected with only ${(approvalPercentage * 100).toFixed(1)}% approval`,
          metadata: {
            proposalId,
            approveVotes,
            rejectVotes,
            abstainVotes,
            approvalPercentage,
            timestamp: new Date(),
          },
        });
      }
    }
  }

  /**
   * Creates an implementation plan for an accepted proposal
   *
   * @param proposalId ID of the proposal to implement
   * @returns The created implementation plan
   */
  async createImplementationPlan(
    proposalId: string
  ): Promise<ImplementationPlan> {
    // Get the proposal
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Ensure the proposal is accepted
    if (proposal.status !== ProposalStatus.ACCEPTED) {
      throw new Error(`Proposal with ID ${proposalId} is not accepted`);
    }

    // Create steps from the proposed changes
    const steps = proposal.proposedChanges.map((change) => ({
      description: change,
      status: 'pending' as const,
    }));

    // Create the implementation plan
    const plan: ImplementationPlan = {
      id: uuidv4(),
      proposalId,
      steps,
      status: 'pending',
      startTimestamp: null,
      completionTimestamp: null,
    };

    // Store the plan
    this.implementationPlans.set(proposalId, plan);

    // Record the plan creation in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'IMPLEMENTATION_PLAN_CREATED',
      content: `Implementation plan created for proposal: ${proposal.title}`,
      metadata: {
        proposalId,
        planId: plan.id,
        steps: steps.length,
        timestamp: new Date(),
      },
    });

    return plan;
  }

  /**
   * Starts the implementation of a proposal
   *
   * @param proposalId ID of the proposal to implement
   * @returns The updated implementation plan
   */
  async startImplementation(proposalId: string): Promise<ImplementationPlan> {
    // Get the proposal
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Get the implementation plan
    const plan = this.implementationPlans.get(proposalId);
    if (!plan) {
      throw new Error(
        `Implementation plan for proposal with ID ${proposalId} not found`
      );
    }

    // Update the plan
    plan.status = 'in_progress';
    plan.startTimestamp = new Date();

    // Update the proposal status
    await this.updateProposalStatus(proposalId, ProposalStatus.IMPLEMENTED);

    // Record the implementation start in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'IMPLEMENTATION_STARTED',
      content: `Implementation started for proposal: ${proposal.title}`,
      metadata: {
        proposalId,
        planId: plan.id,
        timestamp: plan.startTimestamp,
      },
    });

    return plan;
  }

  /**
   * Updates the status of an implementation step
   *
   * @param proposalId ID of the proposal
   * @param stepIndex Index of the step to update
   * @param status New status for the step
   * @param assignedTo Optional SoulFrame ID to assign the step to
   * @returns The updated implementation plan
   */
  async updateImplementationStep(
    proposalId: string,
    stepIndex: number,
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    assignedTo?: string
  ): Promise<ImplementationPlan> {
    // Get the proposal
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Get the implementation plan
    const plan = this.implementationPlans.get(proposalId);
    if (!plan) {
      throw new Error(
        `Implementation plan for proposal with ID ${proposalId} not found`
      );
    }

    // Ensure the step exists
    if (stepIndex < 0 || stepIndex >= plan.steps.length) {
      throw new Error(`Step index ${stepIndex} is out of bounds`);
    }

    // Update the step
    plan.steps[stepIndex].status = status;
    if (assignedTo) {
      plan.steps[stepIndex].assignedTo = assignedTo;
    }

    // Record the step update in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'IMPLEMENTATION_STEP_UPDATED',
      content: `Implementation step ${stepIndex + 1} updated for proposal: ${proposal.title}`,
      metadata: {
        proposalId,
        planId: plan.id,
        stepIndex,
        status,
        assignedTo,
        timestamp: new Date(),
      },
    });

    // Check if all steps are completed or failed
    await this.checkImplementationProgress(proposalId);

    return plan;
  }

  /**
   * Checks if all implementation steps are completed or failed
   *
   * @param proposalId ID of the proposal to check
   */
  private async checkImplementationProgress(proposalId: string): Promise<void> {
    // Get the implementation plan
    const plan = this.implementationPlans.get(proposalId);
    if (!plan) {
      return;
    }

    // Check if all steps are completed or failed
    const allStepsCompleted = plan.steps.every(
      (step) => step.status === 'completed' || step.status === 'failed'
    );

    if (allStepsCompleted) {
      // Check if any steps failed
      const anyStepsFailed = plan.steps.some(
        (step) => step.status === 'failed'
      );

      // Update the plan status
      plan.status = anyStepsFailed ? 'failed' : 'completed';
      plan.completionTimestamp = new Date();

      // Get the proposal
      const proposal = this.proposals.get(proposalId);
      if (!proposal) {
        return;
      }

      // Update the proposal status if necessary
      if (anyStepsFailed && proposal.status === ProposalStatus.IMPLEMENTED) {
        await this.updateProposalStatus(proposalId, ProposalStatus.FAILED);
      }

      // Record the implementation completion in the Codalogue
      await this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: anyStepsFailed
          ? 'IMPLEMENTATION_FAILED'
          : 'IMPLEMENTATION_COMPLETED',
        content: `Implementation ${anyStepsFailed ? 'failed' : 'completed'} for proposal: ${proposal.title}`,
        metadata: {
          proposalId,
          planId: plan.id,
          status: plan.status,
          completedSteps: plan.steps.filter(
            (step) => step.status === 'completed'
          ).length,
          failedSteps: plan.steps.filter((step) => step.status === 'failed')
            .length,
          timestamp: plan.completionTimestamp,
        },
      });
    }
  }

  /**
   * Gets all proposals in the pipeline
   *
   * @param status Optional status filter
   * @returns All proposals matching the filter
   */
  getAllProposals(
    status?: ProposalStatus
  ): (EvolutionProposal & { status: ProposalStatus })[] {
    const proposals = Array.from(this.proposals.values());

    if (status) {
      return proposals.filter((p) => p.status === status);
    }

    return proposals;
  }

  /**
   * Gets a specific proposal
   *
   * @param proposalId ID of the proposal to get
   * @returns The proposal, or undefined if not found
   */
  getProposal(
    proposalId: string
  ): (EvolutionProposal & { status: ProposalStatus }) | undefined {
    return this.proposals.get(proposalId);
  }

  /**
   * Gets all reviews for a proposal
   *
   * @param proposalId ID of the proposal
   * @returns All reviews for the proposal
   */
  getReviews(proposalId: string): ProposalReview[] {
    return this.reviews.get(proposalId) || [];
  }

  /**
   * Gets all debates for a proposal
   *
   * @param proposalId ID of the proposal
   * @returns All debates for the proposal
   */
  getDebates(proposalId: string): ProposalDebate[] {
    return this.debates.get(proposalId) || [];
  }

  /**
   * Gets all votes for a proposal
   *
   * @param proposalId ID of the proposal
   * @returns All votes for the proposal
   */
  getVotes(proposalId: string): ProposalVote[] {
    return this.votes.get(proposalId) || [];
  }

  /**
   * Gets the implementation plan for a proposal
   *
   * @param proposalId ID of the proposal
   * @returns The implementation plan, or undefined if not found
   */
  getImplementationPlan(proposalId: string): ImplementationPlan | undefined {
    return this.implementationPlans.get(proposalId);
  }
}
