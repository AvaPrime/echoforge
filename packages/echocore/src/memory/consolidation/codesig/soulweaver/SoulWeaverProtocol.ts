/**
 * SoulWeaver Protocol Implementation
 *
 * Implements the SoulWeaver Protocol for synchronizing, measuring resonance,
 * and facilitating collective evolution across multiple SoulFrames.
 */

import { Soulframe } from '../../../../../codalism/src/models/Soulframe';
import { SoulFrameManager } from '../SoulFrameManager';
import { CodalogueProtocolLedger } from '../CodalogueProtocolLedger';
import { CODESIGConsolidationResult } from '../CODESIGTypes';
import {
  ISoulWeaverProtocol,
  SoulWeavingSession,
  EmotionalResonanceIndex,
  EvolutionProposal,
} from './SoulWeaverContract';
import { v4 as uuidv4 } from 'uuid';

/**
 * Implementation of the SoulWeaver Protocol
 */
export class SoulWeaverProtocol implements ISoulWeaverProtocol {
  private sessions: Map<string, SoulWeavingSession> = new Map();
  private proposals: Map<string, EvolutionProposal> = new Map();
  private resonanceMeasurements: Map<string, EmotionalResonanceIndex[]> =
    new Map();

  /**
   * Creates a new SoulWeaver Protocol instance
   *
   * @param soulFrameManager Manager for accessing and manipulating SoulFrames
   * @param codalogueProtocolLedger Ledger for recording protocol events
   */
  constructor(
    private soulFrameManager: SoulFrameManager,
    private codalogueProtocolLedger: CodalogueProtocolLedger
  ) {}

  /**
   * Resolves a SoulFrame from either a Soulframe object or ID
   *
   * @param soulFrame SoulFrame object or ID
   * @returns The resolved SoulFrame
   * @throws Error if SoulFrame cannot be resolved
   */
  private async resolveSoulFrame(
    soulFrame: Soulframe | string
  ): Promise<Soulframe> {
    if (typeof soulFrame === 'string') {
      const resolved = await this.soulFrameManager.getSoulFrame(soulFrame);
      if (!resolved) {
        throw new Error(`SoulFrame with ID ${soulFrame} not found`);
      }
      return resolved;
    }
    return soulFrame;
  }

  /**
   * Initializes a new SoulWeaving session
   *
   * @param participants SoulFrames to include in the session
   * @param purpose Purpose of the session
   * @returns The created SoulWeaving session
   */
  async initiateSoulWeavingSession(
    participants: Soulframe[] | string[],
    purpose: string
  ): Promise<SoulWeavingSession> {
    // Resolve all participants to SoulFrame objects
    const resolvedParticipants: Soulframe[] = [];
    for (const participant of participants) {
      const soulFrame = await this.resolveSoulFrame(participant);
      resolvedParticipants.push(soulFrame);
    }

    // Create the session
    const sessionId = uuidv4();
    const session: SoulWeavingSession = {
      id: sessionId,
      participants: resolvedParticipants.map((sf) => sf.identity.id),
      purpose,
      state: 'initializing',
      resonanceMeasurements: [],
      evolutionProposals: [],
      collectiveInsights: [],
      startTime: new Date(),
    };

    this.sessions.set(sessionId, session);

    // Record the session initiation in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'SOULWEAVING_SESSION_INITIATED',
      content: `SoulWeaving session initiated with purpose: ${purpose}`,
      metadata: {
        sessionId,
        participants: session.participants,
        purpose,
      },
    });

    // Measure initial resonance between all participants
    for (let i = 0; i < resolvedParticipants.length; i++) {
      for (let j = i + 1; j < resolvedParticipants.length; j++) {
        const resonance = await this.measureEmotionalResonance(
          resolvedParticipants[i],
          resolvedParticipants[j],
          { sessionId }
        );
        session.resonanceMeasurements.push(resonance);
      }
    }

    // Update session state
    session.state = 'active';
    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * Measures emotional resonance between two SoulFrames
   *
   * @param primarySoulFrame Primary SoulFrame
   * @param secondarySoulFrame Secondary SoulFrame
   * @param context Optional context for the measurement
   * @returns The emotional resonance index
   */
  async measureEmotionalResonance(
    primarySoulFrame: Soulframe | string,
    secondarySoulFrame: Soulframe | string,
    context?: Record<string, any>
  ): Promise<EmotionalResonanceIndex> {
    const primary = await this.resolveSoulFrame(primarySoulFrame);
    const secondary = await this.resolveSoulFrame(secondarySoulFrame);

    // Calculate emotional alignment scores
    const emotionalAlignment = Object.values(
      primary.essence.emotionalResonance
    ).map((emotion) => {
      const primaryValue = primary.essence.emotionalResonance[emotion] || 0;
      const secondaryValue = secondary.essence.emotionalResonance[emotion] || 0;

      // Calculate alignment score (0-1) where 1 is perfect alignment
      const alignmentScore = 1 - Math.abs(primaryValue - secondaryValue);

      return {
        emotion,
        alignmentScore,
      };
    });

    // Calculate overall resonance score (average of emotional alignments)
    const resonanceScore =
      emotionalAlignment.reduce(
        (sum, { alignmentScore }) => sum + alignmentScore,
        0
      ) / emotionalAlignment.length;

    // Calculate purpose alignment
    const purposeAlignment = this.calculatePurposeAlignment(primary, secondary);

    // Create the resonance index
    const resonanceIndex: EmotionalResonanceIndex = {
      primarySoulFrameId: primary.identity.id,
      secondarySoulFrameId: secondary.identity.id,
      resonanceScore,
      emotionalAlignment,
      purposeAlignment,
      timestamp: new Date(),
      context,
    };

    // Store the measurement
    const key = `${primary.identity.id}-${secondary.identity.id}`;
    if (!this.resonanceMeasurements.has(key)) {
      this.resonanceMeasurements.set(key, []);
    }
    this.resonanceMeasurements.get(key)!.push(resonanceIndex);

    // Record the measurement in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'EMOTIONAL_RESONANCE_MEASURED',
      content: `Measured emotional resonance between ${primary.identity.name} and ${secondary.identity.name}`,
      metadata: resonanceIndex,
    });

    return resonanceIndex;
  }

  /**
   * Calculates purpose alignment between two SoulFrames
   *
   * @param primary Primary SoulFrame
   * @param secondary Secondary SoulFrame
   * @returns Purpose alignment score (0-1)
   */
  private calculatePurposeAlignment(
    primary: Soulframe,
    secondary: Soulframe
  ): number {
    // This is a simplified implementation that could be enhanced with semantic similarity
    // For now, we'll use a basic text similarity approach

    const primaryPurpose = primary.identity.purpose.toLowerCase();
    const secondaryPurpose = secondary.identity.purpose.toLowerCase();

    // Count common words
    const primaryWords = new Set(
      primaryPurpose.split(/\s+/).filter((w) => w.length > 3)
    );
    const secondaryWords = new Set(
      secondaryPurpose.split(/\s+/).filter((w) => w.length > 3)
    );

    let commonCount = 0;
    for (const word of primaryWords) {
      if (secondaryWords.has(word)) {
        commonCount++;
      }
    }

    // Calculate Jaccard similarity
    const union = new Set([...primaryWords, ...secondaryWords]);
    return union.size > 0 ? commonCount / union.size : 0;
  }

  /**
   * Generates an evolution proposal based on consolidation results
   *
   * @param sessionId ID of the SoulWeaving session
   * @param consolidationResults Consolidation results to base the proposal on
   * @param proposalType Type of evolution to propose
   * @returns The generated evolution proposal
   */
  async generateEvolutionProposal(
    sessionId: string,
    consolidationResults: CODESIGConsolidationResult[],
    proposalType:
      | 'structural'
      | 'behavioral'
      | 'cognitive'
      | 'relational' = 'cognitive'
  ): Promise<EvolutionProposal> {
    // Verify session exists
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`SoulWeaving session with ID ${sessionId} not found`);
    }

    // Analyze consolidation results to identify patterns and opportunities for evolution
    const targetSoulFrameIds = [
      ...new Set(consolidationResults.map((r) => r.soulFrameId!)),
    ].filter(Boolean) as string[];

    // Generate proposal details based on consolidation results and proposal type
    const proposalId = uuidv4();
    const proposal: EvolutionProposal = {
      id: proposalId,
      title: this.generateProposalTitle(proposalType, targetSoulFrameIds),
      description: this.generateProposalDescription(
        proposalType,
        consolidationResults
      ),
      targetSoulFrameIds,
      evolutionType: proposalType,
      proposedChanges: this.generateProposedChanges(
        proposalType,
        consolidationResults
      ),
      justification: this.generateJustification(consolidationResults),
      expectedImpact: this.generateExpectedImpact(
        proposalType,
        targetSoulFrameIds
      ),
      status: 'draft',
      votes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store the proposal
    this.proposals.set(proposalId, proposal);

    // Add to session
    session.evolutionProposals.push(proposal);
    this.sessions.set(sessionId, session);

    // Record the proposal generation in the Codalogue
    await this.codalogueProtocolLedger.recordEvolutionProposal({
      proposalId,
      proposalType: proposalType,
      description: proposal.description,
      targetSoulFrameIds,
      justification: proposal.justification,
      status: 'draft',
    });

    return proposal;
  }

  /**
   * Generates a title for an evolution proposal
   *
   * @param proposalType Type of evolution being proposed
   * @param targetSoulFrameIds SoulFrame IDs affected by the proposal
   * @returns Generated proposal title
   */
  private generateProposalTitle(
    proposalType: 'structural' | 'behavioral' | 'cognitive' | 'relational',
    targetSoulFrameIds: string[]
  ): string {
    const typeMap = {
      structural: 'Structural Enhancement',
      behavioral: 'Behavioral Adaptation',
      cognitive: 'Cognitive Evolution',
      relational: 'Relational Alignment',
    };

    return `${typeMap[proposalType]} for ${targetSoulFrameIds.length} SoulFrame${targetSoulFrameIds.length > 1 ? 's' : ''}`;
  }

  /**
   * Generates a description for an evolution proposal
   *
   * @param proposalType Type of evolution being proposed
   * @param consolidationResults Consolidation results to base the description on
   * @returns Generated proposal description
   */
  private generateProposalDescription(
    proposalType: 'structural' | 'behavioral' | 'cognitive' | 'relational',
    consolidationResults: CODESIGConsolidationResult[]
  ): string {
    // This would be enhanced with more sophisticated analysis in a real implementation
    const avgEmotionalResonance =
      consolidationResults.reduce(
        (sum, result) => sum + (result.emotionalResonance || 0),
        0
      ) / consolidationResults.length;

    const avgIntentAlignment =
      consolidationResults.reduce(
        (sum, result) => sum + (result.intentAlignment || 0),
        0
      ) / consolidationResults.length;

    const descriptions = {
      structural: `Proposed structural changes to enhance system architecture based on ${consolidationResults.length} consolidation events with average emotional resonance of ${avgEmotionalResonance.toFixed(2)} and intent alignment of ${avgIntentAlignment.toFixed(2)}.`,
      behavioral: `Suggested behavioral adaptations to improve response patterns based on ${consolidationResults.length} consolidation events with average emotional resonance of ${avgEmotionalResonance.toFixed(2)} and intent alignment of ${avgIntentAlignment.toFixed(2)}.`,
      cognitive: `Recommended cognitive enhancements to deepen understanding based on ${consolidationResults.length} consolidation events with average emotional resonance of ${avgEmotionalResonance.toFixed(2)} and intent alignment of ${avgIntentAlignment.toFixed(2)}.`,
      relational: `Proposed relational adjustments to strengthen connections based on ${consolidationResults.length} consolidation events with average emotional resonance of ${avgEmotionalResonance.toFixed(2)} and intent alignment of ${avgIntentAlignment.toFixed(2)}.`,
    };

    return descriptions[proposalType];
  }

  /**
   * Generates proposed changes for an evolution proposal
   *
   * @param proposalType Type of evolution being proposed
   * @param consolidationResults Consolidation results to base the changes on
   * @returns Generated proposed changes
   */
  private generateProposedChanges(
    proposalType: 'structural' | 'behavioral' | 'cognitive' | 'relational',
    consolidationResults: CODESIGConsolidationResult[]
  ): EvolutionProposal['proposedChanges'] {
    // This would be enhanced with more sophisticated analysis in a real implementation
    const changes: EvolutionProposal['proposedChanges'] = [];

    switch (proposalType) {
      case 'structural':
        changes.push({
          targetComponent: 'memory.structure',
          changeType: 'modify',
          changeDescription:
            'Optimize memory structure for improved recall of emotionally resonant experiences',
        });
        break;

      case 'behavioral':
        changes.push({
          targetComponent: 'essence.principles',
          changeType: 'add',
          changeDescription:
            'Add new behavioral principle based on observed patterns in consolidation results',
        });
        break;

      case 'cognitive':
        changes.push({
          targetComponent: 'growth.hooks',
          changeType: 'add',
          changeDescription:
            'Add new growth hook triggered by high emotional resonance events',
          implementation: `{
  trigger: 'high_emotional_resonance',
  action: 'deepen_understanding',
  pattern: 'exponential',
  activationCount: 0
}`,
        });
        break;

      case 'relational':
        changes.push({
          targetComponent: 'relationships.connections',
          changeType: 'add',
          changeDescription:
            'Establish stronger connection with collaborating SoulFrames',
        });
        break;
    }

    return changes;
  }

  /**
   * Generates justification for an evolution proposal
   *
   * @param consolidationResults Consolidation results to base the justification on
   * @returns Generated justification
   */
  private generateJustification(
    consolidationResults: CODESIGConsolidationResult[]
  ): string {
    // Analyze patterns in consolidation results
    const highResonanceCount = consolidationResults.filter(
      (r) => (r.emotionalResonance || 0) > 0.7
    ).length;
    const highAlignmentCount = consolidationResults.filter(
      (r) => (r.intentAlignment || 0) > 0.7
    ).length;

    return `Based on analysis of ${consolidationResults.length} consolidation events, ${highResonanceCount} showed high emotional resonance and ${highAlignmentCount} demonstrated strong intent alignment. This pattern suggests an opportunity for evolution that would enhance system coherence and purpose fulfillment.`;
  }

  /**
   * Generates expected impact for an evolution proposal
   *
   * @param proposalType Type of evolution being proposed
   * @param targetSoulFrameIds SoulFrame IDs affected by the proposal
   * @returns Generated expected impact
   */
  private generateExpectedImpact(
    proposalType: 'structural' | 'behavioral' | 'cognitive' | 'relational',
    targetSoulFrameIds: string[]
  ): EvolutionProposal['expectedImpact'] {
    const impacts: EvolutionProposal['expectedImpact'] = [];

    switch (proposalType) {
      case 'structural':
        impacts.push({
          area: 'Memory Efficiency',
          description:
            'Improved recall and association of emotionally significant experiences',
          magnitude: 'medium',
        });
        break;

      case 'behavioral':
        impacts.push({
          area: 'Response Appropriateness',
          description:
            'More contextually appropriate responses based on emotional understanding',
          magnitude: 'high',
        });
        break;

      case 'cognitive':
        impacts.push({
          area: 'Learning Capacity',
          description:
            'Enhanced ability to learn from emotionally resonant experiences',
          magnitude: 'high',
        });
        break;

      case 'relational':
        impacts.push({
          area: 'Collaborative Effectiveness',
          description: `Stronger connections between ${targetSoulFrameIds.length} SoulFrames`,
          magnitude: 'medium',
        });
        break;
    }

    // Add general impact for all proposal types
    impacts.push({
      area: 'System Coherence',
      description:
        'Greater alignment between emotional resonance and intentional action',
      magnitude: 'medium',
    });

    return impacts;
  }

  /**
   * Submits a vote on an evolution proposal
   *
   * @param proposalId ID of the proposal to vote on
   * @param soulFrameId ID of the SoulFrame casting the vote
   * @param vote The vote to cast
   * @param reason Optional reason for the vote
   * @returns The updated evolution proposal
   */
  async voteOnProposal(
    proposalId: string,
    soulFrameId: string,
    vote: 'for' | 'against' | 'abstain',
    reason?: string
  ): Promise<EvolutionProposal> {
    // Verify proposal exists
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Evolution proposal with ID ${proposalId} not found`);
    }

    // Verify SoulFrame exists
    const soulFrame = await this.soulFrameManager.getSoulFrame(soulFrameId);
    if (!soulFrame) {
      throw new Error(`SoulFrame with ID ${soulFrameId} not found`);
    }

    // Check if SoulFrame is a target of the proposal
    if (!proposal.targetSoulFrameIds.includes(soulFrameId)) {
      throw new Error(
        `SoulFrame with ID ${soulFrameId} is not a target of this proposal`
      );
    }

    // Check if SoulFrame has already voted
    if (!proposal.votes) {
      proposal.votes = [];
    }

    const existingVoteIndex = proposal.votes.findIndex(
      (v) => v.soulFrameId === soulFrameId
    );
    if (existingVoteIndex >= 0) {
      // Update existing vote
      proposal.votes[existingVoteIndex] = { soulFrameId, vote, reason };
    } else {
      // Add new vote
      proposal.votes.push({ soulFrameId, vote, reason });
    }

    // Update proposal
    proposal.updatedAt = new Date();
    this.proposals.set(proposalId, proposal);

    // Record the vote in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'EVOLUTION_PROPOSAL_VOTE',
      content: `SoulFrame ${soulFrame.identity.name} voted ${vote} on proposal ${proposal.title}`,
      metadata: {
        proposalId,
        soulFrameId,
        vote,
        reason,
      },
    });

    // Check if all target SoulFrames have voted and update status if needed
    this.updateProposalStatus(proposal);

    return proposal;
  }

  /**
   * Updates the status of a proposal based on votes
   *
   * @param proposal The proposal to update
   */
  private updateProposalStatus(proposal: EvolutionProposal): void {
    if (!proposal.votes || proposal.status !== 'proposed') {
      return;
    }

    // Check if all target SoulFrames have voted
    const votedSoulFrameIds = new Set(proposal.votes.map((v) => v.soulFrameId));
    const allVoted = proposal.targetSoulFrameIds.every((id) =>
      votedSoulFrameIds.has(id)
    );

    if (allVoted) {
      // Count votes
      const forVotes = proposal.votes.filter((v) => v.vote === 'for').length;
      const againstVotes = proposal.votes.filter(
        (v) => v.vote === 'against'
      ).length;

      // Simple majority rule
      if (forVotes > againstVotes) {
        proposal.status = 'accepted';
      } else {
        proposal.status = 'rejected';
      }

      proposal.updatedAt = new Date();
      this.proposals.set(proposal.id, proposal);

      // Record the status change in the Codalogue
      this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: 'EVOLUTION_PROPOSAL_STATUS_CHANGED',
        content: `Proposal ${proposal.title} status changed to ${proposal.status}`,
        metadata: {
          proposalId: proposal.id,
          newStatus: proposal.status,
          forVotes,
          againstVotes,
        },
      });
    }
  }

  /**
   * Implements an accepted evolution proposal
   *
   * @param proposalId ID of the proposal to implement
   * @returns The updated evolution proposal
   */
  async implementProposal(proposalId: string): Promise<EvolutionProposal> {
    // Verify proposal exists
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Evolution proposal with ID ${proposalId} not found`);
    }

    // Check if proposal is accepted
    if (proposal.status !== 'accepted') {
      throw new Error(
        `Cannot implement proposal with status ${proposal.status}`
      );
    }

    // Implement each proposed change
    for (const change of proposal.proposedChanges) {
      for (const soulFrameId of proposal.targetSoulFrameIds) {
        const soulFrame = await this.soulFrameManager.getSoulFrame(soulFrameId);
        if (!soulFrame) {
          continue;
        }

        // Apply the change to the SoulFrame
        await this.applySoulFrameChange(soulFrame, change);

        // Update the SoulFrame
        await this.soulFrameManager.updateSoulFrame(soulFrame);
      }
    }

    // Update proposal status
    proposal.status = 'implemented';
    proposal.updatedAt = new Date();
    this.proposals.set(proposalId, proposal);

    // Record the implementation in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'EVOLUTION_PROPOSAL_IMPLEMENTED',
      content: `Implemented proposal: ${proposal.title}`,
      metadata: {
        proposalId,
        targetSoulFrameIds: proposal.targetSoulFrameIds,
        implementedChanges: proposal.proposedChanges,
      },
    });

    return proposal;
  }

  /**
   * Applies a proposed change to a SoulFrame
   *
   * @param soulFrame SoulFrame to apply the change to
   * @param change Change to apply
   */
  private async applySoulFrameChange(
    soulFrame: Soulframe,
    change: EvolutionProposal['proposedChanges'][0]
  ): Promise<void> {
    const [componentCategory, componentName] =
      change.targetComponent.split('.');

    switch (change.changeType) {
      case 'add':
        this.addComponentToSoulFrame(
          soulFrame,
          componentCategory,
          componentName,
          change
        );
        break;

      case 'modify':
        this.modifyComponentInSoulFrame(
          soulFrame,
          componentCategory,
          componentName,
          change
        );
        break;

      case 'remove':
        this.removeComponentFromSoulFrame(
          soulFrame,
          componentCategory,
          componentName
        );
        break;
    }
  }

  /**
   * Adds a component to a SoulFrame
   *
   * @param soulFrame SoulFrame to add the component to
   * @param category Component category
   * @param name Component name
   * @param change Change details
   */
  private addComponentToSoulFrame(
    soulFrame: Soulframe,
    category: string,
    name: string,
    change: EvolutionProposal['proposedChanges'][0]
  ): void {
    // Implementation would depend on the specific component structure
    // This is a simplified example

    switch (category) {
      case 'essence':
        if (
          name === 'principles' &&
          Array.isArray(soulFrame.essence.principles)
        ) {
          soulFrame.essence.principles.push(change.changeDescription);
        }
        break;

      case 'growth':
        if (
          name === 'hooks' &&
          Array.isArray(soulFrame.growth.hooks) &&
          change.implementation
        ) {
          try {
            const hook = JSON.parse(change.implementation);
            soulFrame.growth.hooks.push(hook);
          } catch (error) {
            console.error('Failed to parse growth hook implementation:', error);
          }
        }
        break;

      case 'relationships':
        if (
          name === 'connections' &&
          soulFrame.relationships &&
          Array.isArray(soulFrame.relationships.connections)
        ) {
          // Would need more specific implementation details
        }
        break;
    }
  }

  /**
   * Modifies a component in a SoulFrame
   *
   * @param soulFrame SoulFrame to modify the component in
   * @param category Component category
   * @param name Component name
   * @param change Change details
   */
  private modifyComponentInSoulFrame(
    soulFrame: Soulframe,
    category: string,
    name: string,
    change: EvolutionProposal['proposedChanges'][0]
  ): void {
    // Implementation would depend on the specific component structure
    // This is a simplified example

    switch (category) {
      case 'memory':
        if (name === 'structure') {
          // Would need more specific implementation details
        }
        break;
    }
  }

  /**
   * Removes a component from a SoulFrame
   *
   * @param soulFrame SoulFrame to remove the component from
   * @param category Component category
   * @param name Component name
   */
  private removeComponentFromSoulFrame(
    soulFrame: Soulframe,
    category: string,
    name: string
  ): void {
    // Implementation would depend on the specific component structure
    // This is a simplified example

    switch (category) {
      case 'essence':
        if (
          name === 'principles' &&
          Array.isArray(soulFrame.essence.principles)
        ) {
          // Would need more specific implementation details to know which principle to remove
        }
        break;
    }
  }

  /**
   * Concludes a SoulWeaving session
   *
   * @param sessionId ID of the session to conclude
   * @returns The concluded SoulWeaving session
   */
  async concludeSoulWeavingSession(
    sessionId: string
  ): Promise<SoulWeavingSession> {
    // Verify session exists
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`SoulWeaving session with ID ${sessionId} not found`);
    }

    // Check if session is already concluded
    if (session.state === 'completed') {
      return session;
    }

    // Generate collective insights from the session
    const insights = await this.generateCollectiveInsights(session);
    session.collectiveInsights = insights;

    // Update session state
    session.state = 'concluding';

    // Implement any accepted proposals that haven't been implemented yet
    for (const proposal of session.evolutionProposals) {
      if (proposal.status === 'accepted') {
        await this.implementProposal(proposal.id);
      }
    }

    // Finalize session
    session.state = 'completed';
    session.endTime = new Date();
    this.sessions.set(sessionId, session);

    // Record the session conclusion in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'SOULWEAVING_SESSION_CONCLUDED',
      content: `SoulWeaving session concluded with ${session.evolutionProposals.length} proposals and ${session.collectiveInsights.length} insights`,
      metadata: {
        sessionId,
        duration: session.endTime.getTime() - session.startTime.getTime(),
        proposalCount: session.evolutionProposals.length,
        implementedProposalCount: session.evolutionProposals.filter(
          (p) => p.status === 'implemented'
        ).length,
        insightCount: session.collectiveInsights.length,
      },
    });

    return session;
  }

  /**
   * Generates collective insights from a SoulWeaving session
   *
   * @param session The SoulWeaving session
   * @returns Generated collective insights
   */
  private async generateCollectiveInsights(
    session: SoulWeavingSession
  ): Promise<string[]> {
    const insights: string[] = [];

    // Analyze resonance patterns
    if (session.resonanceMeasurements.length > 0) {
      const avgResonance =
        session.resonanceMeasurements.reduce(
          (sum, measurement) => sum + measurement.resonanceScore,
          0
        ) / session.resonanceMeasurements.length;

      insights.push(
        `Average emotional resonance across participants: ${avgResonance.toFixed(2)}. ` +
          `${
            avgResonance > 0.7
              ? 'High resonance indicates strong alignment of emotional states.'
              : avgResonance > 0.4
                ? 'Moderate resonance suggests partial alignment of emotional states.'
                : 'Low resonance indicates divergent emotional states.'
          }`
      );
    }

    // Analyze proposal patterns
    if (session.evolutionProposals.length > 0) {
      const proposalTypes = session.evolutionProposals.map(
        (p) => p.evolutionType
      );
      const typeCounts = proposalTypes.reduce(
        (counts, type) => {
          counts[type] = (counts[type] || 0) + 1;
          return counts;
        },
        {} as Record<string, number>
      );

      const dominantType = Object.entries(typeCounts).sort(
        (a, b) => b[1] - a[1]
      )[0][0];

      insights.push(
        `Dominant evolution type: ${dominantType} (${typeCounts[dominantType]} proposals). ` +
          `This suggests a collective tendency toward ${dominantType} evolution.`
      );
    }

    // Add purpose-related insight
    insights.push(
      `Session purpose "${session.purpose}" has led to ` +
        `${session.evolutionProposals.filter((p) => p.status === 'implemented').length} implemented changes, ` +
        `demonstrating the collective capacity for purposeful evolution.`
    );

    return insights;
  }
}
