/**
 * testUtils.ts
 * Common test utilities and mock data for recomposer tests
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a mock blueprint for testing
 * @param overrides Properties to override in the default mock blueprint
 * @returns A mock blueprint
 */
export function createMockBlueprint(overrides: any = {}) {
  return {
    id: uuidv4(),
    name: 'MockBlueprint',
    intent: {
      description: 'A mock blueprint for testing',
    },
    dominantSequence: ['function1', 'function2'],
    capabilities: {
      function1: {
        description: 'Test function 1',
        function: 'function function1() { return "function1"; }',
      },
      function2: {
        description: 'Test function 2',
        function: 'function function2() { return "function2"; }',
      },
    },
    suggestedAgents: ['agent1', 'agent2'],
    refinementAnnotations: {
      function1: {
        improvement: 'Could be improved',
        priority: 'medium',
      },
    },
    metadata: {
      createdAt: new Date().toISOString(),
      author: 'Test Author',
      tags: ['test', 'mock'],
    },
    ...overrides,
  };
}

/**
 * Validates that a blueprint has the expected structure
 * @param blueprint The blueprint to validate
 * @returns true if the blueprint is valid, throws an error otherwise
 */
export function validateBlueprint(blueprint: any): boolean {
  if (!blueprint) throw new Error('Blueprint is undefined');
  if (!blueprint.id) throw new Error('Blueprint is missing ID');
  if (!blueprint.name) throw new Error('Blueprint is missing name');
  if (!blueprint.intent) throw new Error('Blueprint is missing intent');
  if (!blueprint.capabilities)
    throw new Error('Blueprint is missing capabilities');

  return true;
}

/**
 * Compares two blueprints for deep equality, ignoring specific fields
 * @param blueprint1 First blueprint to compare
 * @param blueprint2 Second blueprint to compare
 * @param ignoreFields Fields to ignore in the comparison
 * @returns true if the blueprints are equal, false otherwise
 */
export function compareBlueprintsIgnoring(
  blueprint1: any,
  blueprint2: any,
  ignoreFields: string[] = ['id', 'metadata.createdAt']
): boolean {
  // Create deep copies to avoid modifying the originals
  const bp1 = JSON.parse(JSON.stringify(blueprint1));
  const bp2 = JSON.parse(JSON.stringify(blueprint2));

  // Remove ignored fields
  for (const field of ignoreFields) {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (bp1[parent]) delete bp1[parent][child];
      if (bp2[parent]) delete bp2[parent][child];
    } else {
      delete bp1[field];
      delete bp2[field];
    }
  }

  return JSON.stringify(bp1) === JSON.stringify(bp2);
}

/**
 * Creates a mock capability for testing
 * @param name The name of the capability
 * @param overrides Properties to override in the default mock capability
 * @returns A mock capability
 */
export function createMockCapability(name: string, overrides: any = {}) {
  return {
    description: `Mock capability ${name}`,
    function: `function ${name}() { return "${name}"; }`,
    ...overrides,
  };
}
