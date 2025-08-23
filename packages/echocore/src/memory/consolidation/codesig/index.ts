/**
 * CODESIG Integration Index
 *
 * Exports all components of the CODESIG integration for easy importing.
 */

// Export types
export * from './CODESIGTypes';

// Export main components
export { SoulFrameManager, SoulFrameMetadata } from './SoulFrameManager';
export {
  EnhancedMemoryConsolidationEngine,
  EmotionWeightedClusteringStrategy,
  IntentDrivenSummarizationStrategy,
} from './EnhancedMemoryConsolidationEngine';
export {
  CodalogueProtocolLedger,
  CodalogueEventType,
  CodalogueQuery,
  CodalogueEntry,
} from './CodalogueProtocolLedger';
export { CODESIGIntegration } from './CODESIGIntegration';

// SoulWeaver Protocol
export * from './soulweaver/SoulWeaverContract';
export * from './soulweaver/SoulWeaverProtocol';
export * from './soulweaver/EmotionalResonanceIndex';

// Codalogue Observer
export * from './observer/CodalogueObserverAgent';

// Evolution Pipeline
export * from './evolution/EvolutionProposalPipeline';

// Purpose Alignment
export * from './purpose/PurposeAlignmentEngine';

// Dream Layer
export * from './dream/DreamLayerSubstrate';
