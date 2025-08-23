/**
 * @echoforge/recomposer
 * Agent Recomposer Module for EchoForge - enables blueprint fusion, capability extraction, and agent evolution
 */

// Export main components
export { BlueprintComposer } from './BlueprintComposer';
export { CapabilityExtractor } from './CapabilityExtractor';
export { BlueprintDiff } from './BlueprintDiff';

// Export interfaces
export {
  CompositionOptions,
  ConflictStrategy,
} from './interfaces/CompositionOptions';
export {
  ExtractionOptions,
  SelectorType,
} from './interfaces/ExtractionOptions';
export {
  DiffResult,
  CapabilityChange,
  ChangeType,
} from './interfaces/DiffResult';

// Export configuration
export {
  DEFAULT_COMPOSER_CONFIG,
  createConservativeConfig,
  createAggressiveConfig,
  createManualConfig,
} from './ComposerConfig';
