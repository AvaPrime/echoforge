/**
 * BlueprintDiff.test.ts
 * Tests for the BlueprintDiff class
 */

import { BlueprintDiff } from '../BlueprintDiff';
import { ChangeType } from '../interfaces/DiffResult';

// Mock blueprints for testing
const originalBlueprint = {
  id: 'blueprint-123',
  name: 'OriginalBlueprint',
  intent: {
    description: 'Original blueprint for testing',
  },
  dominantSequence: ['function1', 'function2'],
  capabilities: {
    function1: {
      description: 'Original function 1',
      function: 'function function1() { return "original"; }',
    },
    function2: {
      description: 'Original function 2',
      function: 'function function2() { return "original"; }',
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

const recomposedBlueprint = {
  id: 'blueprint-456',
  name: 'RecomposedBlueprint',
  intent: {
    description: 'Recomposed blueprint for testing with enhancements',
  },
  dominantSequence: ['function1', 'function3', 'function2'],
  capabilities: {
    function1: {
      description: 'Modified function 1',
      function: 'function function1() { return "modified"; }',
    },
    function2: {
      description: 'Original function 2',
      function: 'function function2() { return "original"; }',
    },
    function3: {
      description: 'New function 3',
      function: 'function function3() { return "new"; }',
    },
  },
  suggestedAgents: ['agent1', 'agent3'],
  refinementAnnotations: {
    function1: {
      improvement: 'Improved implementation',
      priority: 'high',
    },
    function3: {
      improvement: 'New capability',
      priority: 'medium',
    },
  },
};

describe('BlueprintDiff', () => {
  let diff: BlueprintDiff;

  beforeEach(() => {
    diff = new BlueprintDiff(originalBlueprint, recomposedBlueprint);
  });

  describe('constructor', () => {
    it('should create a new instance and perform the diff', () => {
      expect(diff).toBeInstanceOf(BlueprintDiff);
      expect(diff.getDiffResult()).toBeDefined();
      expect(diff.getDiffResult().originalId).toBe(originalBlueprint.id);
      expect(diff.getDiffResult().recomposedId).toBe(recomposedBlueprint.id);
    });
  });

  describe('static compare', () => {
    it('should create a new BlueprintDiff instance', () => {
      const result = BlueprintDiff.compare(
        originalBlueprint,
        recomposedBlueprint
      );
      expect(result).toBeInstanceOf(BlueprintDiff);
    });
  });

  describe('performDiff', () => {
    it('should identify intent changes', () => {
      const result = diff.getDiffResult();
      expect(result.intentChanges).toBeDefined();
      expect(result.intentChanges.length).toBeGreaterThan(0);
      expect(result.intentChanges[0].type).toBe(ChangeType.MODIFIED);
    });

    it('should identify dominant sequence changes', () => {
      const result = diff.getDiffResult();
      expect(result.dominantSequenceChanges).toBeDefined();
      expect(result.dominantSequenceChanges.length).toBeGreaterThan(0);

      // Should detect the added function3 in the sequence
      const addedChange = result.dominantSequenceChanges.find(
        (change) =>
          change.type === ChangeType.ADDED && change.newValue === 'function3'
      );
      expect(addedChange).toBeDefined();
    });

    it('should identify capability changes', () => {
      const result = diff.getDiffResult();
      expect(result.capabilityChanges).toBeDefined();

      // Should detect modified function1
      expect(result.capabilityChanges.function1).toBeDefined();
      expect(
        result.capabilityChanges.function1.some(
          (change) =>
            change.type === ChangeType.MODIFIED &&
            change.path.includes('description')
        )
      ).toBe(true);

      // Should detect added function3
      expect(result.capabilityChanges.function3).toBeDefined();
      expect(
        result.capabilityChanges.function3.some(
          (change) => change.type === ChangeType.ADDED
        )
      ).toBe(true);

      // Should detect unchanged function2
      expect(result.capabilityChanges.function2).toBeDefined();
      expect(
        result.capabilityChanges.function2.every(
          (change) => change.type === ChangeType.UNCHANGED
        )
      ).toBe(true);
    });

    it('should identify suggested agent changes', () => {
      const result = diff.getDiffResult();
      expect(result.suggestedAgentChanges).toBeDefined();
      expect(result.suggestedAgentChanges.length).toBeGreaterThan(0);

      // Should detect the removed agent2
      const removedChange = result.suggestedAgentChanges.find(
        (change) =>
          change.type === ChangeType.REMOVED &&
          change.originalValue === 'agent2'
      );
      expect(removedChange).toBeDefined();

      // Should detect the added agent3
      const addedChange = result.suggestedAgentChanges.find(
        (change) =>
          change.type === ChangeType.ADDED && change.newValue === 'agent3'
      );
      expect(addedChange).toBeDefined();
    });

    it('should identify refinement annotation changes', () => {
      const result = diff.getDiffResult();
      expect(result.refinementAnnotationChanges).toBeDefined();
      expect(result.refinementAnnotationChanges.length).toBeGreaterThan(0);

      // Should detect the modified annotation for function1
      const modifiedChange = result.refinementAnnotationChanges.find(
        (change) =>
          change.type === ChangeType.MODIFIED &&
          change.path.includes('function1') &&
          change.path.includes('improvement')
      );
      expect(modifiedChange).toBeDefined();

      // Should detect the added annotation for function3
      const addedChange = result.refinementAnnotationChanges.find(
        (change) =>
          change.type === ChangeType.ADDED && change.path.includes('function3')
      );
      expect(addedChange).toBeDefined();
    });

    it('should calculate a similarity score', () => {
      const result = diff.getDiffResult();
      expect(result.similarityScore).toBeDefined();
      expect(result.similarityScore).toBeGreaterThan(0);
      expect(result.similarityScore).toBeLessThan(1);
    });
  });

  describe('generateNarrative', () => {
    it('should generate a narrative of the changes', () => {
      const narrative = diff.generateNarrative();
      expect(narrative).toBeDefined();
      expect(typeof narrative).toBe('string');
      expect(narrative.length).toBeGreaterThan(0);

      // Should mention the blueprint names
      expect(narrative).toContain(originalBlueprint.name);
      expect(narrative).toContain(recomposedBlueprint.name);

      // Should mention the changes
      expect(narrative).toContain('function1');
      expect(narrative).toContain('function3');
    });
  });

  describe('getCapabilityChanges', () => {
    it('should get changes for a specific capability', () => {
      const changes = diff.getCapabilityChanges('function1');
      expect(changes).toBeDefined();
      expect(changes.length).toBeGreaterThan(0);
      expect(
        changes.some((change) => change.type === ChangeType.MODIFIED)
      ).toBe(true);
    });

    it('should return an empty array for a non-existent capability', () => {
      const changes = diff.getCapabilityChanges('nonexistent');
      expect(changes).toBeDefined();
      expect(changes.length).toBe(0);
    });
  });

  describe('getSimilarityScore', () => {
    it('should calculate a similarity score between 0 and 1', () => {
      const score = diff.getSimilarityScore();
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('getChanges', () => {
    it('should get all changes as a flat array', () => {
      const changes = diff.getChanges();
      expect(changes).toBeDefined();
      expect(Array.isArray(changes)).toBe(true);
      expect(changes.length).toBeGreaterThan(0);

      // Should include all types of changes
      expect(changes.some((change) => change.type === ChangeType.ADDED)).toBe(
        true
      );
      expect(
        changes.some((change) => change.type === ChangeType.MODIFIED)
      ).toBe(true);
      expect(
        changes.some((change) => change.type === ChangeType.UNCHANGED)
      ).toBe(true);
    });
  });

  describe('getChangesByType', () => {
    it('should get changes filtered by type', () => {
      const addedChanges = diff.getChangesByType(ChangeType.ADDED);
      expect(addedChanges).toBeDefined();
      expect(Array.isArray(addedChanges)).toBe(true);
      expect(
        addedChanges.every((change) => change.type === ChangeType.ADDED)
      ).toBe(true);

      const modifiedChanges = diff.getChangesByType(ChangeType.MODIFIED);
      expect(modifiedChanges).toBeDefined();
      expect(Array.isArray(modifiedChanges)).toBe(true);
      expect(
        modifiedChanges.every((change) => change.type === ChangeType.MODIFIED)
      ).toBe(true);
    });
  });
});
