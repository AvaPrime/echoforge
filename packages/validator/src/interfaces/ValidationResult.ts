/**
 * ValidationResult interfaces
 */

export enum ValidationStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  PENDING = 'pending',
  SKIPPED = 'skipped'
}

export interface AssertionResult {
  assertionId: string;
  status: ValidationStatus;
  message?: string;
  duration?: number;
}

export interface ValidationResult {
  id: string;
  status: ValidationStatus;
  assertions: AssertionResult[];
  duration: number;
  timestamp: Date;
  errors?: string[];
}