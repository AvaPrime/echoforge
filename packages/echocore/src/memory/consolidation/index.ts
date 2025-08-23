/**
 * Memory Consolidation System
 *
 * Exports the memory consolidation system components for use in the EchoForge ecosystem.
 */

// Core contracts and interfaces
export * from './MemoryConsolidationContract';

// Consolidator implementation
export * from './MemoryConsolidator';

// Strategies
export * from './strategies/SemanticClusteringStrategy';
export * from './strategies/LLMSummarizationStrategy';
