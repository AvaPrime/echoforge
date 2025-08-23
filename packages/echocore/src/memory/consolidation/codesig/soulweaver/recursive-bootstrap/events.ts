/**
 * Event definitions for the Recursive SoulWeaving Bootstrap system
 */

import {
  SelfReflectionAnalysis,
  EvolutionStrategy,
  MetaEvolutionProposal,
  BootstrapCycleResult,
} from './types';

/**
 * Event names for the Recursive SoulWeaving Bootstrap
 */
export enum RecursiveBootstrapEventName {
  EVOLUTION_CYCLE_STARTED = 'evolutionCycleStarted',
  EVOLUTION_CYCLE_COMPLETED = 'evolutionCycleCompleted',
  SELF_REFLECTION_STARTED = 'selfReflectionStarted',
  SELF_REFLECTION_COMPLETED = 'selfReflectionCompleted',
  STRATEGY_PROPOSAL_GENERATED = 'strategyProposalGenerated',
  META_EVOLUTION_PROPOSAL_ISSUED = 'metaEvolutionProposalIssued',
}

/**
 * Event payload for evolution cycle started event
 */
export interface EvolutionCycleStartedEvent {
  cycleId: string;
  timestamp: number;
  recursionDepth: number;
  initiatedBy: string;
}

/**
 * Event payload for evolution cycle completed event
 */
export interface EvolutionCycleCompletedEvent {
  cycleId: string;
  timestamp: number;
  result: BootstrapCycleResult;
  duration: number;
}

/**
 * Event payload for self reflection started event
 */
export interface SelfReflectionStartedEvent {
  reflectionId: string;
  timestamp: number;
  targetComponents: string[];
}

/**
 * Event payload for self reflection completed event
 */
export interface SelfReflectionCompletedEvent {
  reflectionId: string;
  timestamp: number;
  analysis: SelfReflectionAnalysis;
  duration: number;
}

/**
 * Event payload for strategy proposal generated event
 */
export interface StrategyProposalGeneratedEvent {
  proposalId: string;
  timestamp: number;
  strategy: EvolutionStrategy;
  basedOnAnalysis: string; // ID of the analysis that led to this proposal
}

/**
 * Event payload for meta evolution proposal issued event
 */
export interface MetaEvolutionProposalIssuedEvent {
  proposalId: string;
  timestamp: number;
  proposal: MetaEvolutionProposal;
  confidence: number;
}

/**
 * Type for all event payloads
 */
export type RecursiveBootstrapEventPayload =
  | EvolutionCycleStartedEvent
  | EvolutionCycleCompletedEvent
  | SelfReflectionStartedEvent
  | SelfReflectionCompletedEvent
  | StrategyProposalGeneratedEvent
  | MetaEvolutionProposalIssuedEvent;
