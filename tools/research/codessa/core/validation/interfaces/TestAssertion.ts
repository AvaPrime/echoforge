/**
 * TestAssertion.ts
 * Defines the structure for test assertions used to validate blueprint behaviors.
 */

export enum AssertionType {
  PRECONDITION = 'precondition',
  POSTCONDITION = 'postcondition',
  INVARIANT = 'invariant',
  TRIGGER = 'trigger',
  CAPABILITY = 'capability',
}

export enum ExpectedOutcomeType {
  BOOLEAN = 'boolean',
  STRING = 'string',
  NUMBER = 'number',
  OBJECT = 'object',
  ARRAY = 'array',
  REGEX = 'regex',
  FUNCTION = 'function',
  NULL = 'null',
  UNDEFINED = 'undefined',
}

export interface TestAssertion {
  /**
   * Human-readable description of what this assertion tests
   */
  description: string;

  /**
   * The type of assertion (precondition, postcondition, etc.)
   */
  type: AssertionType;

  /**
   * The function or capability being tested
   */
  targetFunction: string;

  /**
   * The expected outcome of the test
   */
  expectedOutcome: any;

  /**
   * The type of the expected outcome
   */
  expectedOutcomeType: ExpectedOutcomeType;

  /**
   * Optional mock inputs to use for testing
   */
  mockInputs?: Record<string, any>;

  /**
   * Optional timeout for the assertion (in milliseconds)
   */
  timeout?: number;

  /**
   * Optional severity level (critical, high, medium, low)
   */
  severity?: 'critical' | 'high' | 'medium' | 'low';

  /**
   * Optional tags for categorizing assertions
   */
  tags?: string[];

  /**
   * Optional custom validation function
   */
  customValidator?: (result: any) => boolean;
}
