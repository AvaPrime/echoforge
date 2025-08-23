/**
 * AssertionSynthesizer.ts
 * Converts blueprint specifications into test assertions.
 */

import { CodalBlueprint } from '../../../codalism-interpreter/codalism_interpreter';
import {
  TestAssertion,
  AssertionType,
  ExpectedOutcomeType,
} from './interfaces/TestAssertion';

export class AssertionSynthesizer {
  /**
   * Synthesizes test assertions from a blueprint
   * @param blueprint The blueprint to synthesize assertions from
   * @returns Array of test assertions
   */
  public synthesizeAssertions(blueprint: CodalBlueprint): TestAssertion[] {
    const assertions: TestAssertion[] = [];

    // Add assertions based on blueprint intent
    if (blueprint.intent) {
      assertions.push(this.createIntentAssertion(blueprint));
    }

    // Add assertions based on dominant sequence
    if (blueprint.dominantSequence && blueprint.dominantSequence.length > 0) {
      assertions.push(...this.createSequenceAssertions(blueprint));
    }

    // Add assertions for suggested agents
    if (blueprint.suggestedAgents && blueprint.suggestedAgents.length > 0) {
      assertions.push(...this.createAgentAssertions(blueprint));
    }

    // Add assertions from refinement annotations if available
    if (blueprint.refinementAnnotation) {
      assertions.push(...this.createRefinementAssertions(blueprint));
    }

    return assertions;
  }

  /**
   * Creates an assertion based on the blueprint's intent
   */
  private createIntentAssertion(blueprint: CodalBlueprint): TestAssertion {
    return {
      description: `Agent should fulfill the intent: ${blueprint.intent}`,
      type: AssertionType.CAPABILITY,
      targetFunction: 'executeIntent',
      expectedOutcome: true,
      expectedOutcomeType: ExpectedOutcomeType.BOOLEAN,
      severity: 'critical',
      tags: ['intent', 'core-capability'],
    };
  }

  /**
   * Creates assertions based on the blueprint's dominant sequence
   */
  private createSequenceAssertions(blueprint: CodalBlueprint): TestAssertion[] {
    return blueprint.dominantSequence.map((sequenceItem, index) => {
      return {
        description: `Agent should support the capability: ${sequenceItem}`,
        type: AssertionType.CAPABILITY,
        targetFunction: sequenceItem,
        expectedOutcome: true,
        expectedOutcomeType: ExpectedOutcomeType.BOOLEAN,
        severity: 'high',
        tags: ['sequence', `sequence-${index}`],
      };
    });
  }

  /**
   * Creates assertions for suggested agents
   */
  private createAgentAssertions(blueprint: CodalBlueprint): TestAssertion[] {
    return blueprint.suggestedAgents.map((agent) => {
      return {
        description: `Agent should implement the ${agent} role`,
        type: AssertionType.INVARIANT,
        targetFunction: 'checkAgentRole',
        expectedOutcome: agent,
        expectedOutcomeType: ExpectedOutcomeType.STRING,
        severity: 'medium',
        tags: ['agent-role'],
      };
    });
  }

  /**
   * Creates assertions from refinement annotations
   */
  private createRefinementAssertions(
    blueprint: CodalBlueprint
  ): TestAssertion[] {
    if (
      !blueprint.refinementAnnotation ||
      !blueprint.refinementAnnotation.changes
    ) {
      return [];
    }

    return blueprint.refinementAnnotation.changes.map((change) => {
      return {
        description: `Agent should implement the refined capability: ${change}`,
        type: AssertionType.CAPABILITY,
        targetFunction: 'checkRefinedCapability',
        expectedOutcome: change,
        expectedOutcomeType: ExpectedOutcomeType.STRING,
        severity: 'high',
        tags: ['refinement', 'user-specified'],
      };
    });
  }

  /**
   * Creates precondition assertions for a function
   * @param functionName The function to create preconditions for
   * @param conditions The preconditions
   */
  public createPreconditionAssertions(
    functionName: string,
    conditions: any[]
  ): TestAssertion[] {
    return conditions.map((condition, index) => {
      return {
        description: `Precondition ${index + 1} for ${functionName}`,
        type: AssertionType.PRECONDITION,
        targetFunction: functionName,
        expectedOutcome: condition,
        expectedOutcomeType: typeof condition as ExpectedOutcomeType,
        severity: 'high',
        tags: ['precondition'],
      };
    });
  }

  /**
   * Creates postcondition assertions for a function
   * @param functionName The function to create postconditions for
   * @param conditions The postconditions
   */
  public createPostconditionAssertions(
    functionName: string,
    conditions: any[]
  ): TestAssertion[] {
    return conditions.map((condition, index) => {
      return {
        description: `Postcondition ${index + 1} for ${functionName}`,
        type: AssertionType.POSTCONDITION,
        targetFunction: functionName,
        expectedOutcome: condition,
        expectedOutcomeType: typeof condition as ExpectedOutcomeType,
        severity: 'high',
        tags: ['postcondition'],
      };
    });
  }
}
