/**
 * BlueprintComposer.test.ts
 * Tests for the BlueprintComposer class
 */

import { BlueprintComposer } from '../BlueprintComposer';
import { ConflictStrategy } from '../interfaces/CompositionOptions';

// Mock blueprints for testing
const mockBlueprint1 = {
  id: 'blueprint-123',
  name: 'TestBlueprint1',
  intent: {
    description: 'Test blueprint 1',
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
};

const mockBlueprint2 = {
  id: 'blueprint-456',
  name: 'TestBlueprint2',
  intent: {
    description: 'Test blueprint 2',
  },
  dominantSequence: ['function3', 'function4'],
  capabilities: {
    function3: {
      description: 'Test function 3',
      function: 'function function3() { return "function3"; }',
    },
    function4: {
      description: 'Test function 4',
      function: 'function function4() { return "function4"; }',
    },
    // Conflicting capability with blueprint1
    function1: {
      description: 'Test function 1 (modified)',
      function: 'function function1() { return "function1 modified"; }',
    },
  },
  suggestedAgents: ['agent2', 'agent3'],
  refinementAnnotations: {
    function3: {
      improvement: 'Could be improved',
      priority: 'high',
    },
  },
};

describe('BlueprintComposer', () => {
  let composer: BlueprintComposer;

  beforeEach(() => {
    composer = new BlueprintComposer();
  });

  describe('constructor', () => {
    it('should create a new instance with default options', () => {
      expect(composer).toBeInstanceOf(BlueprintComposer);
    });

    it('should create a new instance with custom options', () => {
      const customComposer = new BlueprintComposer({
        conflictStrategy: ConflictStrategy.AGGRESSIVE,
        autoRefine: true,
        maintainLineage: false,
      });
      expect(customComposer).toBeInstanceOf(BlueprintComposer);
    });
  });

  describe('compose', () => {
    it('should throw an error when no blueprints are provided', async () => {
      await expect(composer.compose([])).rejects.toThrow(
        'No blueprints provided for composition'
      );
    });

    it('should return the blueprint as-is when only one blueprint is provided', async () => {
      const result = await composer.compose([mockBlueprint1]);
      expect(result.id).not.toBe(mockBlueprint1.id); // ID should be regenerated
      expect(result.name).toBe(mockBlueprint1.name);
      expect(result.capabilities).toEqual(mockBlueprint1.capabilities);
    });

    it('should compose two blueprints with conservative strategy (default)', async () => {
      const result = await composer.compose([mockBlueprint1, mockBlueprint2]);

      // Check that the result has a new ID
      expect(result.id).not.toBe(mockBlueprint1.id);
      expect(result.id).not.toBe(mockBlueprint2.id);

      // Check that the name is composed
      expect(result.name).toContain(mockBlueprint1.name);
      expect(result.name).toContain(mockBlueprint2.name);

      // Check that capabilities are merged
      expect(Object.keys(result.capabilities).length).toBe(4); // All unique capabilities

      // Check that conflicting capability uses the first blueprint's version (conservative)
      expect(result.capabilities.function1.description).toBe(
        mockBlueprint1.capabilities.function1.description
      );

      // Check that dominant sequences are merged
      expect(result.dominantSequence.length).toBe(4); // All unique functions

      // Check that suggested agents are merged
      expect(result.suggestedAgents.length).toBe(3); // All unique agents

      // Check that refinement annotations are merged
      expect(Object.keys(result.refinementAnnotations).length).toBe(2); // All unique annotations
    });

    it('should compose two blueprints with aggressive strategy', async () => {
      const result = await composer.compose([mockBlueprint1, mockBlueprint2], {
        conflictStrategy: ConflictStrategy.AGGRESSIVE,
      });

      // Check that conflicting capability uses the second blueprint's version (aggressive)
      expect(result.capabilities.function1.description).toBe(
        mockBlueprint2.capabilities.function1.description
      );
    });

    it('should maintain lineage when option is enabled', async () => {
      const result = await composer.compose([mockBlueprint1, mockBlueprint2], {
        maintainLineage: true,
      });

      // Check that lineage is maintained in metadata
      expect(result.metadata).toBeDefined();
      expect(result.metadata.parentIds).toContain(mockBlueprint1.id);
      expect(result.metadata.parentIds).toContain(mockBlueprint2.id);
    });
  });

  describe('mergeCapabilities', () => {
    it('should merge capabilities from multiple blueprints', () => {
      const capabilities1 = mockBlueprint1.capabilities;
      const capabilities2 = mockBlueprint2.capabilities;

      const result = composer.mergeCapabilities(
        [capabilities1, capabilities2],
        {
          conflictStrategy: ConflictStrategy.CONSERVATIVE,
        }
      );

      expect(Object.keys(result).length).toBe(4); // All unique capabilities
      expect(result.function1).toEqual(capabilities1.function1); // Conservative strategy
    });
  });

  describe('mergeIntents', () => {
    it('should merge intents from multiple blueprints', () => {
      const intents = [mockBlueprint1.intent, mockBlueprint2.intent];

      const result = composer.mergeIntents(intents, {});

      expect(result).toBeDefined();
      expect(result.description).toContain(mockBlueprint1.intent.description);
      expect(result.description).toContain(mockBlueprint2.intent.description);
    });
  });

  describe('mergeDominantSequences', () => {
    it('should merge dominant sequences from multiple blueprints', () => {
      const sequences = [
        mockBlueprint1.dominantSequence,
        mockBlueprint2.dominantSequence,
      ];

      const result = composer.mergeDominantSequences(sequences, {});

      expect(result.length).toBe(4); // All unique functions
      expect(result).toContain('function1');
      expect(result).toContain('function2');
      expect(result).toContain('function3');
      expect(result).toContain('function4');
    });
  });

  describe('mergeSuggestedAgents', () => {
    it('should merge suggested agents from multiple blueprints', () => {
      const agents = [
        mockBlueprint1.suggestedAgents,
        mockBlueprint2.suggestedAgents,
      ];

      const result = composer.mergeSuggestedAgents(agents, {});

      expect(result.length).toBe(3); // All unique agents
      expect(result).toContain('agent1');
      expect(result).toContain('agent2');
      expect(result).toContain('agent3');
    });
  });

  describe('mergeRefinementAnnotations', () => {
    it('should merge refinement annotations from multiple blueprints', () => {
      const annotations = [
        mockBlueprint1.refinementAnnotations,
        mockBlueprint2.refinementAnnotations,
      ];

      const result = composer.mergeRefinementAnnotations(annotations, {});

      expect(Object.keys(result).length).toBe(2); // All unique annotations
      expect(result.function1).toEqual(
        mockBlueprint1.refinementAnnotations.function1
      );
      expect(result.function3).toEqual(
        mockBlueprint2.refinementAnnotations.function3
      );
    });
  });

  describe('finalizeBlueprint', () => {
    it('should finalize a blueprint with a new ID', () => {
      const result = composer.finalizeBlueprint(mockBlueprint1, {});

      expect(result.id).not.toBe(mockBlueprint1.id);
      expect(result.name).toBe(mockBlueprint1.name);
    });

    it('should finalize a blueprint with lineage information', () => {
      const parentIds = ['parent-1', 'parent-2'];
      const result = composer.finalizeBlueprint(
        mockBlueprint1,
        { maintainLineage: true },
        parentIds
      );

      expect(result.metadata).toBeDefined();
      expect(result.metadata.parentIds).toEqual(parentIds);
    });
  });
});
