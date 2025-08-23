/**
 * TestAssertion interfaces
 */

export enum AssertionType {
  EQUALS = 'equals',
  CONTAINS = 'contains',
  MATCHES = 'matches'
}

export enum ExpectedOutcomeType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning'
}

export interface TestAssertion {
  id: string;
  type: AssertionType;
  expected: any;
  actual?: any;
  message?: string;
  outcome: ExpectedOutcomeType;
}