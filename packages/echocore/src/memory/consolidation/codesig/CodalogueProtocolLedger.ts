/**
 * Codalogue Protocol Ledger
 *
 * Implements a semantic event ledger for capturing memory consolidation events,
 * evolution proposals, and system interactions within the CODESIG framework.
 */

import { Codalogue } from '../../../../codalism/src/models/Codalogue';
import { CODESIGConsolidationResult } from './CODESIGTypes';

/**
 * Types of events that can be recorded in the Codalogue Protocol Ledger
 */
export enum CodalogueEventType {
  CONSOLIDATION = 'consolidation',
  EVOLUTION_PROPOSAL = 'evolution-proposal',
  AGENT_DEBATE = 'agent-debate',
  USER_INTERACTION = 'user-interaction',
  SYSTEM_REFLECTION = 'system-reflection',
}

/**
 * Interface for event metadata in the Codalogue Protocol Ledger
 */
export interface CodalogueEventMetadata {
  eventType: CodalogueEventType;
  timestamp: string;
  soulFrameId?: string;
  agentIds?: string[];
  emotionalContext?: string;
  intentContext?: string;
  [key: string]: any; // Additional metadata fields
}

/**
 * Interface for querying the Codalogue Protocol Ledger
 */
export interface CodalogueQuery {
  soulFrameId?: string;
  eventType?: CodalogueEventType;
  timeRange?: {
    from: Date | string;
    to: Date | string;
  };
  limit?: number;
  includeMetadata?: boolean;
}

/**
 * Interface for a Codalogue Protocol Ledger entry
 */
export interface CodalogueEntry {
  id: string;
  type: string;
  content: string;
  metadata: CodalogueEventMetadata;
  timestamp: Date;
}

/**
 * Codalogue Protocol Ledger class
 *
 * Implements a semantic event ledger for capturing memory consolidation events,
 * evolution proposals, and system interactions within the CODESIG framework.
 */
export class CodalogueProtocolLedger {
  /**
   * Creates a new CodalogueProtocolLedger instance
   *
   * @param codalogue The Codalogue instance to use for storing events
   */
  constructor(private codalogue: Codalogue) {}

  /**
   * Records a consolidation event in the ledger
   *
   * @param soulFrameId ID of the SoulFrame that performed the consolidation
   * @param results Results of the consolidation process
   * @returns ID of the created ledger entry
   */
  async recordConsolidationEvent(
    soulFrameId: string,
    results: CODESIGConsolidationResult[]
  ): Promise<string> {
    // Create a summary of the consolidation results
    const summary = this.createConsolidationSummary(results);

    // Create the event metadata
    const metadata: CodalogueEventMetadata = {
      eventType: CodalogueEventType.CONSOLIDATION,
      timestamp: new Date().toISOString(),
      soulFrameId,
      clusterCount: results.length,
      emotionalResonance: this.calculateAverageEmotionalResonance(results),
      intentAlignment: this.calculateAverageIntentAlignment(results),
    };

    // Record the event in the Codalogue
    return this.codalogue.addEntry({
      type: 'reflection',
      content: summary,
      metadata,
    });
  }

  /**
   * Records an evolution proposal event in the ledger
   *
   * @param soulFrameId ID of the SoulFrame proposing the evolution
   * @param proposal The evolution proposal content
   * @param metadata Additional metadata for the event
   * @returns ID of the created ledger entry
   */
  async recordEvolutionProposal(
    soulFrameId: string,
    proposal: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    // Create the event metadata
    const eventMetadata: CodalogueEventMetadata = {
      eventType: CodalogueEventType.EVOLUTION_PROPOSAL,
      timestamp: new Date().toISOString(),
      soulFrameId,
      ...metadata,
    };

    // Record the event in the Codalogue
    return this.codalogue.addEntry({
      type: 'proposal',
      content: proposal,
      metadata: eventMetadata,
    });
  }

  /**
   * Records an agent debate event in the ledger
   *
   * @param agentIds IDs of the agents participating in the debate
   * @param debate The debate content
   * @param metadata Additional metadata for the event
   * @returns ID of the created ledger entry
   */
  async recordAgentDebate(
    agentIds: string[],
    debate: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    // Create the event metadata
    const eventMetadata: CodalogueEventMetadata = {
      eventType: CodalogueEventType.AGENT_DEBATE,
      timestamp: new Date().toISOString(),
      agentIds,
      ...metadata,
    };

    // Record the event in the Codalogue
    return this.codalogue.addEntry({
      type: 'dialogue',
      content: debate,
      metadata: eventMetadata,
    });
  }

  /**
   * Records a user interaction event in the ledger
   *
   * @param soulFrameId ID of the SoulFrame interacting with the user
   * @param interaction The interaction content
   * @param metadata Additional metadata for the event
   * @returns ID of the created ledger entry
   */
  async recordUserInteraction(
    soulFrameId: string,
    interaction: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    // Create the event metadata
    const eventMetadata: CodalogueEventMetadata = {
      eventType: CodalogueEventType.USER_INTERACTION,
      timestamp: new Date().toISOString(),
      soulFrameId,
      ...metadata,
    };

    // Record the event in the Codalogue
    return this.codalogue.addEntry({
      type: 'interaction',
      content: interaction,
      metadata: eventMetadata,
    });
  }

  /**
   * Records a system reflection event in the ledger
   *
   * @param soulFrameId ID of the SoulFrame performing the reflection
   * @param reflection The reflection content
   * @param metadata Additional metadata for the event
   * @returns ID of the created ledger entry
   */
  async recordSystemReflection(
    soulFrameId: string,
    reflection: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    // Create the event metadata
    const eventMetadata: CodalogueEventMetadata = {
      eventType: CodalogueEventType.SYSTEM_REFLECTION,
      timestamp: new Date().toISOString(),
      soulFrameId,
      ...metadata,
    };

    // Record the event in the Codalogue
    return this.codalogue.addEntry({
      type: 'reflection',
      content: reflection,
      metadata: eventMetadata,
    });
  }

  /**
   * Queries the ledger for events matching the specified criteria
   *
   * @param query Query parameters
   * @returns Array of matching ledger entries
   */
  async query(query: CodalogueQuery): Promise<CodalogueEntry[]> {
    // Convert the query to a Codalogue query format
    const codalogueQuery: any = {};

    if (query.soulFrameId) {
      codalogueQuery['metadata.soulFrameId'] = query.soulFrameId;
    }

    if (query.eventType) {
      codalogueQuery['metadata.eventType'] = query.eventType;
    }

    if (query.timeRange) {
      codalogueQuery.timeRange = {
        from: new Date(query.timeRange.from),
        to: new Date(query.timeRange.to),
      };
    }

    if (query.limit) {
      codalogueQuery.limit = query.limit;
    }

    // Query the Codalogue
    const entries = await this.codalogue.query(codalogueQuery);

    // Convert to CodalogueEntry format
    return entries.map((entry) => ({
      id: entry.id,
      type: entry.type,
      content: entry.content,
      metadata: entry.metadata as CodalogueEventMetadata,
      timestamp: new Date(entry.metadata.timestamp),
    }));
  }

  /**
   * Creates a summary of consolidation results
   *
   * @param results The consolidation results to summarize
   * @returns A summary string
   */
  private createConsolidationSummary(
    results: CODESIGConsolidationResult[]
  ): string {
    const clusterCount = results.length;
    const memoryCount = results.reduce(
      (sum, result) =>
        sum +
        (result.clusters?.reduce(
          (clusterSum, cluster) => clusterSum + cluster.entries.length,
          0
        ) || 0),
      0
    );

    return (
      `Memory consolidation completed: ${clusterCount} clusters formed from ${memoryCount} memories. ` +
      `Average emotional resonance: ${this.calculateAverageEmotionalResonance(results).toFixed(2)}. ` +
      `Average intent alignment: ${this.calculateAverageIntentAlignment(results).toFixed(2)}.`
    );
  }

  /**
   * Calculates the average emotional resonance across consolidation results
   *
   * @param results The consolidation results
   * @returns The average emotional resonance (0-1)
   */
  private calculateAverageEmotionalResonance(
    results: CODESIGConsolidationResult[]
  ): number {
    if (results.length === 0) return 0;

    const total = results.reduce(
      (sum, result) => sum + (result.emotionalResonance || 0),
      0
    );

    return total / results.length;
  }

  /**
   * Calculates the average intent alignment across consolidation results
   *
   * @param results The consolidation results
   * @returns The average intent alignment (0-1)
   */
  private calculateAverageIntentAlignment(
    results: CODESIGConsolidationResult[]
  ): number {
    if (results.length === 0) return 0;

    const total = results.reduce(
      (sum, result) => sum + (result.intentAlignment || 0),
      0
    );

    return total / results.length;
  }
}
