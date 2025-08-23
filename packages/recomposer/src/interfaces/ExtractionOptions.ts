/**
 * Options for capability extraction
 */

/**
 * Type of selector for capability extraction
 */
export enum SelectorType {
  /**
   * Function selector - extracts a specific function and its dependencies
   */
  FUNCTION = 'function',

  /**
   * Class selector - extracts a specific class and its dependencies
   */
  CLASS = 'class',

  /**
   * Intent tag selector - extracts capabilities related to a specific intent
   */
  INTENT_TAG = 'intent_tag',

  /**
   * Capability selector - extracts a specific capability by name
   */
  CAPABILITY = 'capability',
}

/**
 * Options for capability extraction
 */
export interface ExtractionOptions {
  /**
   * The selector to use for extraction
   * Can be a function name, class name, intent tag, or capability name
   */
  selector: string;

  /**
   * The type of selector
   * @default SelectorType.FUNCTION
   */
  selectorType?: SelectorType;

  /**
   * Whether to include related functions
   * @default true
   */
  includeRelatedFunctions?: boolean;

  /**
   * Whether to generate a minimal viable module
   * @default true
   */
  generateMinimalViableModule?: boolean;

  /**
   * Maximum depth for dependency resolution
   * @default 3
   */
  maxDependencyDepth?: number;

  /**
   * Whether to include metadata in the extracted capability
   * @default true
   */
  includeMetadata?: boolean;

  /**
   * Whether to include refinement annotations in the extracted capability
   * @default true
   */
  includeRefinementAnnotations?: boolean;
}
