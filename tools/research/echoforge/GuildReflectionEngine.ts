import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import { GuildManager } from '../packages/echocore/src/guild/GuildManager';
import { AgentContext } from '../packages/echocore/src/core/AgentContext';
import {
  GuildTask,
  GuildResult,
  GuildEvent,
  GuildMember,
} from '../packages/echocore/src/guild/GuildContract';
import { SculptorResult } from './SculptorResult';
import { SculptorIntent } from './SculptorIntent';
import { BlueprintProposal } from './BlueprintProposal';
import { SculptingOperation } from './SculptingOperation';

/**
 * Vote on a sculpting proposal
 */
export interface SculptingVote {
  memberId: string;
  memberName: string;
  memberRole: string;
  vote: 'approve' | 'reject' | 'abstain';
  confidence: number; // 0-1
  reasoning: string;
  timestamp: Date;
  weight?: number; // Voting weight based on expertise/role
}

/**
 * A reflection session for a sculpting proposal
 */
export interface ReflectionSession {
  id: string;
  proposal: BlueprintProposal;
  sculptorIntent: SculptorIntent;
  createdAt: Date;
  completedAt?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  votes: SculptingVote[];
  quorumMet: boolean;
  consensusReached: boolean;
  finalDecision: 'approved' | 'rejected' | 'deferred';
  executionScheduled?: Date;
  metadata: {
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    impactLevel: number; // 0-10
    requiredQuorum: number;
    requiredConsensus: number; // 0-1 (percentage)
    timeLimit: number; // milliseconds
    agentId: string;
    operation: SculptingOperation;
  };
}

/**
 * A specialized guild member for memory reflection and governance
 */
export interface ReflectionGuildMember extends GuildMember {
  /**
   * The member's expertise areas for weighted voting
   */
  expertiseAreas: string[];

  /**
   * The member's voting weight (0-1, with 1 being highest authority)
   */
  votingWeight: number;

  /**
   * Method to evaluate a sculpting proposal
   */
  evaluateSculptingProposal(
    proposal: BlueprintProposal,
    intent: SculptorIntent
  ): Promise<SculptingVote>;

  /**
   * Method to provide ongoing reflection during a session
   */
  contributeToReflection(session: ReflectionSession): Promise<string>;
}

/**
 * Configuration for the Guild Reflection Engine
 */
export interface GuildReflectionConfig {
  /**
   * Minimum number of votes required for quorum
   */
  minimumQuorum: number;

  /**
   * Minimum percentage of votes needed for consensus (0-1)
   */
  consensusThreshold: number;

  /**
   * Maximum time to wait for votes (in milliseconds)
   */
  votingTimeLimit: number;

  /**
   * Impact threshold above which guild reflection is required
   */
  impactThreshold: number;

  /**
   * Operations that always require guild reflection regardless of impact
   */
  alwaysRequireReflection: SculptingOperation[];

  /**
   * Whether to enable automatic execution of approved proposals
   */
  enableAutoExecution: boolean;

  /**
   * Grace period before auto-execution (in milliseconds)
   */
  executionGracePeriod: number;
}

/**
 * Default configuration for the Guild Reflection Engine
 */
export const DEFAULT_GUILD_REFLECTION_CONFIG: GuildReflectionConfig = {
  minimumQuorum: 3,
  consensusThreshold: 0.67, // 67% consensus required
  votingTimeLimit: 5 * 60 * 1000, // 5 minutes
  impactThreshold: 7, // Operations with impact >= 7 require guild reflection
  alwaysRequireReflection: ['prune', 'merge'], // High-risk operations
  enableAutoExecution: false, // Require manual execution for safety
  executionGracePeriod: 2 * 60 * 1000, // 2 minutes grace period
};

/**
 * The Guild Reflection Engine implements a democratic governance system
 * for high-impact memory sculpting operations. It coordinates guild members
 * to review, debate, and vote on sculpting proposals that could significantly
 * affect an agent's cognitive architecture.
 */
export class GuildReflectionEngine extends EventEmitter {
  private guild: GuildManager;
  private activeSessions: Map<string, ReflectionSession> = new Map();
  private sessionHistory: ReflectionSession[] = [];
  private reflexionMembers: Map<string, ReflectionGuildMember> = new Map();

  constructor(
    private context: AgentContext,
    private config: GuildReflectionConfig = DEFAULT_GUILD_REFLECTION_CONFIG
  ) {
    super();

    // Create a specialized guild for reflection activities
    this.guild = new GuildManager(
      'reflection-guild',
      'Codessa Memory Reflection Guild',
      context
    );

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Initialize the Guild Reflection Engine
   */
  async initialize(): Promise<void> {
    await this.guild.start();

    this.emit('initialized', {
      guildId: this.guild.id,
      memberCount: this.guild.getAllMembers().length,
      config: this.config,
    });
  }

  /**
   * Shutdown the Guild Reflection Engine
   */
  async shutdown(): Promise<void> {
    // Complete any active sessions
    for (const session of this.activeSessions.values()) {
      if (session.status === 'in_progress' || session.status === 'pending') {
        await this.completeSession(session.id, 'deferred');
      }
    }

    await this.guild.stop();
    this.emit('shutdown');
  }

  /**
   * Register a reflection guild member
   */
  async registerReflectionMember(member: ReflectionGuildMember): Promise<void> {
    await this.guild.registerMember(member);
    this.reflexionMembers.set(member.id, member);

    this.emit('memberRegistered', {
      memberId: member.id,
      memberName: member.metadata.name,
      expertiseAreas: member.expertiseAreas,
      votingWeight: member.votingWeight,
    });
  }

  /**
   * Unregister a reflection guild member
   */
  async unregisterReflectionMember(memberId: string): Promise<void> {
    await this.guild.removeMember(memberId);
    this.reflexionMembers.delete(memberId);

    this.emit('memberUnregistered', { memberId });
  }

  /**
   * Determine if a sculpting proposal requires guild reflection
   */
  requiresGuildReflection(
    proposal: BlueprintProposal,
    intent: SculptorIntent
  ): boolean {
    // Always require reflection for certain operations
    if (this.config.alwaysRequireReflection.includes(intent.operation)) {
      return true;
    }

    // Require reflection based on impact level
    const impactLevel = this.calculateImpactLevel(proposal, intent);
    if (impactLevel >= this.config.impactThreshold) {
      return true;
    }

    // Require reflection for operations affecting many memories
    if (intent.targetMemoryIds.length >= 20) {
      return true;
    }

    // Require reflection for experimental risk level
    if (proposal.riskLevel === 'experimental') {
      return true;
    }

    return false;
  }

  /**
   * Submit a sculpting proposal for guild reflection
   */
  async submitForReflection(
    proposal: BlueprintProposal,
    intent: SculptorIntent
  ): Promise<string> {
    const impactLevel = this.calculateImpactLevel(proposal, intent);
    const urgencyLevel = this.determineUrgencyLevel(proposal, intent);

    const session: ReflectionSession = {
      id: randomUUID(),
      proposal,
      sculptorIntent: intent,
      createdAt: new Date(),
      status: 'pending',
      votes: [],
      quorumMet: false,
      consensusReached: false,
      finalDecision: 'deferred',
      metadata: {
        urgencyLevel,
        impactLevel,
        requiredQuorum: Math.max(
          this.config.minimumQuorum,
          Math.ceil(this.reflexionMembers.size * 0.5)
        ),
        requiredConsensus: this.config.consensusThreshold,
        timeLimit: this.adjustTimeLimitForUrgency(urgencyLevel),
        agentId: intent.agentId,
        operation: intent.operation,
      },
    };

    this.activeSessions.set(session.id, session);

    // Start the reflection process
    await this.initiateReflectionSession(session);

    this.emit('sessionCreated', {
      sessionId: session.id,
      agentId: intent.agentId,
      operation: intent.operation,
      impactLevel,
      urgencyLevel,
    });

    return session.id;
  }

  /**
   * Get the status of a reflection session
   */
  getSessionStatus(sessionId: string): ReflectionSession | null {
    return (
      this.activeSessions.get(sessionId) ||
      this.sessionHistory.find((s) => s.id === sessionId) ||
      null
    );
  }

  /**
   * Get all active reflection sessions
   */
  getActiveSessions(): ReflectionSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Get reflection session history
   */
  getSessionHistory(limit?: number): ReflectionSession[] {
    const sorted = [...this.sessionHistory].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Force complete a session (for administrative purposes)
   */
  async forceCompleteSession(
    sessionId: string,
    decision: 'approved' | 'rejected' | 'deferred',
    reason: string
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    await this.completeSession(sessionId, decision);

    this.emit('sessionForceCompleted', {
      sessionId,
      decision,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * Initiate a reflection session
   */
  private async initiateReflectionSession(
    session: ReflectionSession
  ): Promise<void> {
    session.status = 'in_progress';

    // Create a guild task to gather votes
    const reflectionTask: GuildTask = {
      id: `reflection-${session.id}`,
      type: 'memory_sculpting_reflection',
      data: {
        sessionId: session.id,
        proposal: session.proposal,
        intent: session.sculptorIntent,
      },
      requiredCapabilities: ['memory_reflection', 'cognitive_evaluation'],
      priority: this.mapUrgencyToPriority(session.metadata.urgencyLevel),
    };

    // Broadcast the reflection request to all eligible members
    const eligibleMembers = Array.from(this.reflexionMembers.values()).filter(
      (member) =>
        member.capabilities.includes('memory_reflection') ||
        member.capabilities.includes('cognitive_evaluation')
    );

    // Request votes from all eligible members
    const votePromises = eligibleMembers.map(async (member) => {
      try {
        const vote = await member.evaluateSculptingProposal(
          session.proposal,
          session.sculptorIntent
        );
        await this.recordVote(session.id, vote);
      } catch (error) {
        this.context.logger.error(
          `Error getting vote from member ${member.id}:`,
          error
        );
      }
    });

    // Set up timeout for the session
    setTimeout(async () => {
      if (session.status === 'in_progress') {
        await this.checkSessionCompletion(session.id);
      }
    }, session.metadata.timeLimit);

    // Wait for all initial votes (with timeout handling)
    await Promise.allSettled(votePromises);

    // Check if we can complete the session immediately
    await this.checkSessionCompletion(session.id);
  }

  /**
   * Record a vote for a reflection session
   */
  private async recordVote(
    sessionId: string,
    vote: SculptingVote
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'in_progress') {
      return;
    }

    // Remove any existing vote from this member
    session.votes = session.votes.filter((v) => v.memberId !== vote.memberId);

    // Add the new vote
    session.votes.push(vote);

    this.emit('voteRecorded', {
      sessionId,
      memberId: vote.memberId,
      vote: vote.vote,
      confidence: vote.confidence,
    });

    // Check if this vote triggers completion
    await this.checkSessionCompletion(sessionId);
  }

  /**
   * Check if a session can be completed
   */
  private async checkSessionCompletion(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'in_progress') {
      return;
    }

    const voteCount = session.votes.length;
    const approveVotes = session.votes.filter((v) => v.vote === 'approve');
    const rejectVotes = session.votes.filter((v) => v.vote === 'reject');
    const abstainVotes = session.votes.filter((v) => v.vote === 'abstain');

    // Calculate weighted votes
    const totalWeight = session.votes.reduce(
      (sum, vote) => sum + (vote.weight || 1),
      0
    );
    const approveWeight = approveVotes.reduce(
      (sum, vote) => sum + (vote.weight || 1),
      0
    );
    const rejectWeight = rejectVotes.reduce(
      (sum, vote) => sum + (vote.weight || 1),
      0
    );

    // Check quorum
    session.quorumMet = voteCount >= session.metadata.requiredQuorum;

    if (!session.quorumMet) {
      // Check if timeout has expired
      const timeElapsed = Date.now() - session.createdAt.getTime();
      if (timeElapsed >= session.metadata.timeLimit) {
        await this.completeSession(sessionId, 'deferred');
      }
      return;
    }

    // Check consensus
    const approvePercentage = totalWeight > 0 ? approveWeight / totalWeight : 0;
    const rejectPercentage = totalWeight > 0 ? rejectWeight / totalWeight : 0;

    if (approvePercentage >= session.metadata.requiredConsensus) {
      session.consensusReached = true;
      await this.completeSession(sessionId, 'approved');
    } else if (rejectPercentage >= session.metadata.requiredConsensus) {
      session.consensusReached = true;
      await this.completeSession(sessionId, 'rejected');
    } else {
      // Check if all members have voted or timeout expired
      const allMembersVoted = voteCount >= this.reflexionMembers.size;
      const timeElapsed = Date.now() - session.createdAt.getTime();
      const timeExpired = timeElapsed >= session.metadata.timeLimit;

      if (allMembersVoted || timeExpired) {
        // Determine decision based on majority
        if (approveWeight > rejectWeight) {
          await this.completeSession(sessionId, 'approved');
        } else if (rejectWeight > approveWeight) {
          await this.completeSession(sessionId, 'rejected');
        } else {
          await this.completeSession(sessionId, 'deferred');
        }
      }
    }
  }

  /**
   * Complete a reflection session
   */
  private async completeSession(
    sessionId: string,
    decision: 'approved' | 'rejected' | 'deferred'
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return;
    }

    session.status = 'completed';
    session.completedAt = new Date();
    session.finalDecision = decision;

    // Schedule execution if approved
    if (decision === 'approved' && this.config.enableAutoExecution) {
      session.executionScheduled = new Date(
        Date.now() + this.config.executionGracePeriod
      );
    }

    // Move to history
    this.activeSessions.delete(sessionId);
    this.sessionHistory.push(session);

    // Trim history if too long
    if (this.sessionHistory.length > 100) {
      this.sessionHistory.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      this.sessionHistory = this.sessionHistory.slice(0, 100);
    }

    this.emit('sessionCompleted', {
      sessionId,
      decision,
      voteCount: session.votes.length,
      quorumMet: session.quorumMet,
      consensusReached: session.consensusReached,
      duration: session.completedAt.getTime() - session.createdAt.getTime(),
    });

    // If execution is scheduled, emit that event too
    if (session.executionScheduled) {
      this.emit('executionScheduled', {
        sessionId,
        scheduledAt: session.executionScheduled,
        proposal: session.proposal,
        intent: session.sculptorIntent,
      });
    }
  }

  /**
   * Calculate impact level of a proposal
   */
  private calculateImpactLevel(
    proposal: BlueprintProposal,
    intent: SculptorIntent
  ): number {
    let impact = 5; // Base impact

    // Adjust based on operation type
    const operationImpacts = {
      relabel: 2,
      merge: 8,
      prune: 9,
      relink: 6,
      extract: 4,
      preserve: 3,
    };

    impact = operationImpacts[intent.operation] || 5;

    // Adjust based on number of affected memories
    if (intent.targetMemoryIds.length > 50) {
      impact += 2;
    } else if (intent.targetMemoryIds.length > 20) {
      impact += 1;
    }

    // Adjust based on risk level
    if (proposal.riskLevel === 'experimental') {
      impact += 2;
    } else if (proposal.riskLevel === 'moderate') {
      impact += 1;
    }

    // Adjust based on purpose alignment
    if (proposal.purposeAlignment < 0.5) {
      impact += 1;
    }

    return Math.min(10, Math.max(1, impact));
  }

  /**
   * Determine urgency level of a proposal
   */
  private determineUrgencyLevel(
    proposal: BlueprintProposal,
    intent: SculptorIntent
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Critical if it's a prune operation on many memories
    if (intent.operation === 'prune' && intent.targetMemoryIds.length > 30) {
      return 'critical';
    }

    // High if experimental risk or high priority
    if (proposal.riskLevel === 'experimental' || proposal.priority > 0.8) {
      return 'high';
    }

    // Medium if moderate risk or significant scope
    if (
      proposal.riskLevel === 'moderate' ||
      intent.targetMemoryIds.length > 10
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Adjust time limit based on urgency
   */
  private adjustTimeLimitForUrgency(
    urgency: 'low' | 'medium' | 'high' | 'critical'
  ): number {
    const baseTime = this.config.votingTimeLimit;

    switch (urgency) {
      case 'critical':
        return baseTime * 0.5; // Half time for critical
      case 'high':
        return baseTime * 0.75;
      case 'medium':
        return baseTime;
      case 'low':
        return baseTime * 1.5; // More time for low urgency
      default:
        return baseTime;
    }
  }

  /**
   * Map urgency to task priority
   */
  private mapUrgencyToPriority(
    urgency: 'low' | 'medium' | 'high' | 'critical'
  ): number {
    switch (urgency) {
      case 'critical':
        return 1.0;
      case 'high':
        return 0.8;
      case 'medium':
        return 0.6;
      case 'low':
        return 0.4;
      default:
        return 0.5;
    }
  }

  /**
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    // Handle guild events
    this.guild.context.events.on('member:*', (event: any) => {
      this.emit('guildEvent', event);
    });

    // Handle vote timeouts
    this.on('sessionTimeout', async (sessionId: string) => {
      await this.checkSessionCompletion(sessionId);
    });
  }

  /**
   * Get guild reflection statistics
   */
  getReflectionStats(): {
    totalSessions: number;
    activeSessions: number;
    approvalRate: number;
    averageVotingTime: number;
    memberParticipation: Record<string, number>;
  } {
    const totalSessions = this.sessionHistory.length;
    const activeSessions = this.activeSessions.size;

    const completedSessions = this.sessionHistory.filter(
      (s) => s.status === 'completed'
    );
    const approvedSessions = completedSessions.filter(
      (s) => s.finalDecision === 'approved'
    );
    const approvalRate =
      completedSessions.length > 0
        ? approvedSessions.length / completedSessions.length
        : 0;

    const averageVotingTime =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => {
            const duration = s.completedAt
              ? s.completedAt.getTime() - s.createdAt.getTime()
              : 0;
            return sum + duration;
          }, 0) / completedSessions.length
        : 0;

    const memberParticipation: Record<string, number> = {};
    for (const session of this.sessionHistory) {
      for (const vote of session.votes) {
        memberParticipation[vote.memberId] =
          (memberParticipation[vote.memberId] || 0) + 1;
      }
    }

    return {
      totalSessions,
      activeSessions,
      approvalRate,
      averageVotingTime,
      memberParticipation,
    };
  }
}

/**
 * Factory function to create a Guild Reflection Engine
 */
export function createGuildReflectionEngine(
  context: AgentContext,
  config?: Partial<GuildReflectionConfig>
): GuildReflectionEngine {
  const finalConfig = config
    ? { ...DEFAULT_GUILD_REFLECTION_CONFIG, ...config }
    : DEFAULT_GUILD_REFLECTION_CONFIG;

  return new GuildReflectionEngine(context, finalConfig);
}
