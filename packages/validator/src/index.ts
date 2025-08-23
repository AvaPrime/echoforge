/**
 * @echoforge/validator
 * Blueprint Test Validator Engine for the EchoForge platform
 */

// Export main components
export { ValidatorEngine } from './ValidatorEngine';
export { AssertionSynthesizer } from './AssertionSynthesizer';
export { TestCaseGenerator } from './TestCaseGenerator';
export { BlueprintTestRunner } from './BlueprintTestRunner';

// Export interfaces
export {
  TestAssertion,
  AssertionType,
  ExpectedOutcomeType,
} from './interfaces/TestAssertion';
export {
  ValidationResult,
  AssertionResult,
  ValidationStatus,
} from './interfaces/ValidationResult';
export {
  ValidatorOptions,
  ValidationMode,
  ValidationLevel,
} from './interfaces/ValidatorOptions';

// Export configuration
export {
  DEFAULT_VALIDATOR_CONFIG,
  createInteractiveConfig,
  createHeadlessConfig,
  createAutofixConfig,
  createGuildModeConfig,
} from './ValidatorConfig';
