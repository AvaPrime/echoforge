/**
 * ValidationResult.ts
 * Defines the structure for validation results from blueprint testing.
 */

import { TestAssertion } from './TestAssertion';

export enum ValidationStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  ERROR = 'error',
  SKIPPED = 'skipped',
  WARNING = 'warning',
}

export interface AssertionResult {
  /**
   * The assertion that was tested
   */
  assertion: TestAssertion;

  /**
   * The status of the validation
   */
  status: ValidationStatus;

  /**
   * The actual outcome of the test
   */
  actualOutcome?: any;

  /**
   * Error message if the test failed
   */
  errorMessage?: string;

  /**
   * Execution time in milliseconds
   */
  executionTime?: number;

  /**
   * Optional suggestions for fixing failed assertions
   */
  suggestions?: string[];
}

export interface ValidationResult {
  /**
   * Unique identifier for the validation run
   */
  id: string;

  /**
   * Timestamp when the validation was performed
   */
  timestamp: string;

  /**
   * The blueprint ID that was validated
   */
  blueprintId: string;

  /**
   * Overall validation status
   */
  status: ValidationStatus;

  /**
   * Results for individual assertions
   */
  assertionResults: AssertionResult[];

  /**
   * Summary statistics
   */
  summary: {
    total: number;
    passed: number;
    failed: number;
    errors: number;
    skipped: number;
    warnings: number;
  };

  /**
   * Overall execution time in milliseconds
   */
  executionTime: number;

  /**
   * Optional metadata about the validation run
   */
  metadata?: Record<string, any>;
}
