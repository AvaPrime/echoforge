/**
 * Codalism - A new paradigm for software development
 *
 * This module exports the core components of the Codalism system,
 * which enables the creation of software through conceptual dialogue.
 */

export * from './interpreter/CodalismInterpreter';
export * from './models/SemanticBlueprint';
export * from './models/BlueprintTypes';

// Export Soulframe and Codalogue components
export * from './models/Soulframe';
export * from './models/SoulframeTypes';
export * from './codalogue/Codalogue';
export * from './codalogue/CodalogueTypes';

// Export CLI tools
export { renderManifesto } from './cli/manifesto-renderer';
export { visualizeSoulframe } from './cli/soulframe-visualizer';

// Export Web tools
export { startManifestoViewer } from './web/manifesto-viewer';
export { startSoulframeWebDemo } from './web/soulframe-web-demo';
