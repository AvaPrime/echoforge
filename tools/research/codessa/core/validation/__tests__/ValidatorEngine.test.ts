/**
 * ValidatorEngine.test.ts
 * Tests for the Blueprint Test Validator Engine.
 */

import { ValidatorEngine } from '../ValidatorEngine';
import { ValidationStatus } from '../interfaces/ValidationResult';
import {
  ValidationMode,
  ValidationLevel,
} from '../interfaces/ValidatorOptions';

// Mock blueprint for testing
const mockBlueprint = {
  id: 'test-blueprint-001',
  name: 'TestBlueprint',
  intent: 'Test the Blueprint Test Validator Engine',
  dominantSequence: ['testFunction1', 'testFunction2'],
  suggestedAgents: ['TestAgent'],
  refinementAnnotations: {
    testFunction1: {
      description: 'Test function 1',
      preconditions: ['Input must be valid'],
      postconditions: ['Returns expected output'],
      examples: [
        {
          input: { test: 'input' },
          output: { result: 'output' },
        },
      ],
    },
    testFunction2: {
      description: 'Test function 2',
      preconditions: ['Input must be processed'],
      postconditions: ['Returns final result'],
      examples: [
        {
          input: { processed: 'input' },
          output: { final: 'result' },
        },
      ],
    },
  },
};

// Mock implementation of AssertionSynthesizer
jest.mock('../AssertionSynthesizer', () => {
  return {
    AssertionSynthesizer: jest.fn().mockImplementation(() => {
      return {
        synthesizeFromIntent: jest.fn().mockResolvedValue([
          {
            description: 'Test intent assertion',
            type: 'postcondition',
            targetFunction: 'executeIntent',
            expectedOutcome: { success: true },
            expectedOutcomeType: 'object',
          },
        ]),
        synthesizeFromDominantSequence: jest.fn().mockResolvedValue([
          {
            description: 'Test sequence assertion',
            type: 'postcondition',
            targetFunction: 'testFunction1',
            expectedOutcome: { result: 'output' },
            expectedOutcomeType: 'object',
          },
        ]),
        synthesizeFromSuggestedAgents: jest.fn().mockResolvedValue([
          {
            description: 'Test agent assertion',
            type: 'postcondition',
            targetFunction: 'checkAgentRole',
            expectedOutcome: 'TestAgent',
            expectedOutcomeType: 'string',
          },
        ]),
        synthesizeFromRefinementAnnotations: jest.fn().mockResolvedValue([
          {
            description: 'Test annotation assertion',
            type: 'postcondition',
            targetFunction: 'testFunction2',
            expectedOutcome: { final: 'result' },
            expectedOutcomeType: 'object',
          },
        ]),
      };
    }),
  };
});

// Mock implementation of TestCaseGenerator
jest.mock('../TestCaseGenerator', () => {
  return {
    TestCaseGenerator: jest.fn().mockImplementation(() => {
      return {
        generateMockDataForFunction: jest.fn().mockResolvedValue({
          input: { test: 'input' },
        }),
      };
    }),
  };
});

// Mock implementation of BlueprintTestRunner
jest.mock('../BlueprintTestRunner', () => {
  return {
    BlueprintTestRunner: jest.fn().mockImplementation(() => {
      return {
        runTests: jest.fn().mockResolvedValue({
          id: 'test-result-001',
          timestamp: '2023-05-15T10:30:00Z',
          blueprintId: 'test-blueprint-001',
          status: ValidationStatus.PASSED,
          assertionResults: [
            {
              assertion: {
                description: 'Test assertion',
                type: 'postcondition',
                targetFunction: 'testFunction',
                expectedOutcome: { result: 'output' },
              },
              status: ValidationStatus.PASSED,
              actualOutcome: { result: 'output' },
              executionTime: 10,
            },
          ],
          summary: {
            total: 1,
            passed: 1,
            failed: 0,
            errors: 0,
            skipped: 0,
            warnings: 0,
          },
          executionTime: 100,
          metadata: {
            validationMode: ValidationMode.HEADLESS,
            validationLevel: ValidationLevel.NORMAL,
          },
        }),
      };
    }),
  };
});

describe('ValidatorEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate a blueprint successfully', async () => {
    // Create a validator engine
    const validatorEngine = new ValidatorEngine();

    // Validate the blueprint
    const result = await validatorEngine.validateBlueprint(mockBlueprint);

    // Check the result
    expect(result).toBeDefined();
    expect(result.status).toBe(ValidationStatus.PASSED);
    expect(result.blueprintId).toBe('test-blueprint-001');
    expect(result.assertionResults).toHaveLength(1);
    expect(result.summary.total).toBe(1);
    expect(result.summary.passed).toBe(1);
    expect(result.summary.failed).toBe(0);
  });

  it('should create a validator engine in interactive mode', () => {
    // Create a validator engine in interactive mode
    const validatorEngine = ValidatorEngine.createInteractive();

    // Check that the validator engine was created with the correct options
    expect(validatorEngine).toBeDefined();
    // Additional checks would require exposing the options property
  });

  it('should create a validator engine in headless mode', () => {
    // Create a validator engine in headless mode
    const validatorEngine = ValidatorEngine.createHeadless();

    // Check that the validator engine was created with the correct options
    expect(validatorEngine).toBeDefined();
    // Additional checks would require exposing the options property
  });
});
