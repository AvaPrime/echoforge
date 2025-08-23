/**
 * TestCaseGenerator.ts
 * Generates test cases for each capability in a blueprint.
 */

import { CodalBlueprint } from '../../../codalism-interpreter/codalism_interpreter';
import { TestAssertion } from './interfaces/TestAssertion';
import { AssertionSynthesizer } from './AssertionSynthesizer';

interface TestCase {
  name: string;
  assertions: TestAssertion[];
  mockData?: Record<string, any>;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export class TestCaseGenerator {
  private assertionSynthesizer: AssertionSynthesizer;

  constructor() {
    this.assertionSynthesizer = new AssertionSynthesizer();
  }

  /**
   * Generates test cases from a blueprint
   * @param blueprint The blueprint to generate test cases from
   * @returns Array of test cases
   */
  public generateTestCases(blueprint: CodalBlueprint): TestCase[] {
    const testCases: TestCase[] = [];

    // Generate core intent test case
    testCases.push(this.generateIntentTestCase(blueprint));

    // Generate test cases for each capability in the dominant sequence
    if (blueprint.dominantSequence && blueprint.dominantSequence.length > 0) {
      testCases.push(...this.generateSequenceTestCases(blueprint));
    }

    // Generate test cases for agent roles
    if (blueprint.suggestedAgents && blueprint.suggestedAgents.length > 0) {
      testCases.push(this.generateAgentRolesTestCase(blueprint));
    }

    // Generate test cases from refinement annotations if available
    if (blueprint.refinementAnnotation) {
      testCases.push(this.generateRefinementTestCase(blueprint));
    }

    return testCases;
  }

  /**
   * Generates a test case for the blueprint's intent
   */
  private generateIntentTestCase(blueprint: CodalBlueprint): TestCase {
    return {
      name: `Intent: ${blueprint.intent}`,
      assertions: [
        this.assertionSynthesizer.synthesizeAssertions(blueprint)[0],
      ],
      mockData: this.generateMockDataForIntent(blueprint),
    };
  }

  /**
   * Generates test cases for each capability in the dominant sequence
   */
  private generateSequenceTestCases(blueprint: CodalBlueprint): TestCase[] {
    return blueprint.dominantSequence.map((sequenceItem, index) => {
      const sequenceAssertions = this.assertionSynthesizer
        .synthesizeAssertions(blueprint)
        .filter((assertion) => assertion.targetFunction === sequenceItem);

      return {
        name: `Capability: ${sequenceItem}`,
        assertions: sequenceAssertions,
        mockData: this.generateMockDataForCapability(sequenceItem, blueprint),
      };
    });
  }

  /**
   * Generates a test case for agent roles
   */
  private generateAgentRolesTestCase(blueprint: CodalBlueprint): TestCase {
    const agentAssertions = this.assertionSynthesizer
      .synthesizeAssertions(blueprint)
      .filter((assertion) => assertion.tags?.includes('agent-role'));

    return {
      name: 'Agent Roles Validation',
      assertions: agentAssertions,
    };
  }

  /**
   * Generates a test case for refinement annotations
   */
  private generateRefinementTestCase(blueprint: CodalBlueprint): TestCase {
    const refinementAssertions = this.assertionSynthesizer
      .synthesizeAssertions(blueprint)
      .filter((assertion) => assertion.tags?.includes('refinement'));

    return {
      name: 'Refinement Validation',
      assertions: refinementAssertions,
    };
  }

  /**
   * Generates mock data for testing the blueprint's intent
   */
  private generateMockDataForIntent(
    blueprint: CodalBlueprint
  ): Record<string, any> {
    // This would be more sophisticated in a real implementation,
    // potentially using NLP to understand the intent and generate appropriate mock data
    return {
      input: {
        query: 'Test intent execution',
        context: {
          blueprintId: blueprint.id,
          timestamp: new Date().toISOString(),
        },
      },
      expectedOutput: {
        success: true,
        message: 'Intent executed successfully',
      },
    };
  }

  /**
   * Generates mock data for testing a specific capability
   */
  private generateMockDataForCapability(
    capability: string,
    blueprint: CodalBlueprint
  ): Record<string, any> {
    // In a real implementation, this would analyze the capability and generate appropriate mock data
    // For now, we'll use a simple approach based on the capability name

    const mockData: Record<string, any> = {
      input: {},
      expectedOutput: {},
    };

    // Generate mock data based on common capability patterns
    if (
      capability.includes('fetch') ||
      capability.includes('get') ||
      capability.includes('retrieve')
    ) {
      mockData.input.url = 'https://example.com/api/data';
      mockData.expectedOutput.data = { success: true, items: [] };
    } else if (
      capability.includes('process') ||
      capability.includes('transform')
    ) {
      mockData.input.data = { raw: 'test data' };
      mockData.expectedOutput.processed = { formatted: 'processed test data' };
    } else if (
      capability.includes('save') ||
      capability.includes('store') ||
      capability.includes('write')
    ) {
      mockData.input.data = { id: '123', content: 'test content' };
      mockData.expectedOutput.success = true;
    } else if (
      capability.includes('analyze') ||
      capability.includes('evaluate')
    ) {
      mockData.input.data = 'sample text for analysis';
      mockData.expectedOutput.analysis = {
        sentiment: 'positive',
        entities: [],
      };
    } else {
      // Default mock data
      mockData.input.args = ['test'];
      mockData.expectedOutput.result = true;
    }

    return mockData;
  }
}
