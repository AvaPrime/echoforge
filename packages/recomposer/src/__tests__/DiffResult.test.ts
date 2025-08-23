/**
 * DiffResult.test.ts
 * Tests for the DiffResult class
 */

import { DiffResult, ChangeType } from '../DiffResult';
import { createMockBlueprint } from './setup/testUtils';

describe('DiffResult', () => {
  let diffResult: DiffResult;

  beforeEach(() => {
    diffResult = new DiffResult();
  });

  describe('addChange', () => {
    it('should add a change to the changes array', () => {
      diffResult.addChange(ChangeType.ADDED, 'capabilities', 'analyze_text', {
        before: null,
        after: { description: 'Analyzes text' },
      });

      expect(diffResult.changes).toHaveLength(1);
      expect(diffResult.changes[0]).toEqual({
        type: ChangeType.ADDED,
        category: 'capabilities',
        key: 'analyze_text',
        before: null,
        after: { description: 'Analyzes text' },
      });
    });

    it('should handle multiple changes', () => {
      diffResult.addChange(ChangeType.ADDED, 'capabilities', 'analyze_text', {
        before: null,
        after: { description: 'Analyzes text' },
      });

      diffResult.addChange(ChangeType.MODIFIED, 'intent', 'description', {
        before: 'Old intent',
        after: 'New intent',
      });

      expect(diffResult.changes).toHaveLength(2);
      expect(diffResult.changes[1].type).toBe(ChangeType.MODIFIED);
      expect(diffResult.changes[1].category).toBe('intent');
    });
  });

  describe('getChangesByType', () => {
    beforeEach(() => {
      // Add various changes
      diffResult.addChange(ChangeType.ADDED, 'capabilities', 'analyze_text', {
        before: null,
        after: { description: 'Analyzes text' },
      });

      diffResult.addChange(ChangeType.MODIFIED, 'intent', 'description', {
        before: 'Old intent',
        after: 'New intent',
      });

      diffResult.addChange(ChangeType.REMOVED, 'capabilities', 'old_function', {
        before: { description: 'Old function' },
        after: null,
      });

      diffResult.addChange(ChangeType.ADDED, 'suggestedAgents', 'agent3', {
        before: null,
        after: 'agent3',
      });
    });

    it('should return changes of a specific type', () => {
      const addedChanges = diffResult.getChangesByType(ChangeType.ADDED);
      expect(addedChanges).toHaveLength(2);
      expect(addedChanges[0].key).toBe('analyze_text');
      expect(addedChanges[1].key).toBe('agent3');

      const modifiedChanges = diffResult.getChangesByType(ChangeType.MODIFIED);
      expect(modifiedChanges).toHaveLength(1);
      expect(modifiedChanges[0].category).toBe('intent');

      const removedChanges = diffResult.getChangesByType(ChangeType.REMOVED);
      expect(removedChanges).toHaveLength(1);
      expect(removedChanges[0].key).toBe('old_function');
    });
  });

  describe('getChanges', () => {
    beforeEach(() => {
      // Add various changes
      diffResult.addChange(ChangeType.ADDED, 'capabilities', 'analyze_text', {
        before: null,
        after: { description: 'Analyzes text' },
      });

      diffResult.addChange(ChangeType.MODIFIED, 'intent', 'description', {
        before: 'Old intent',
        after: 'New intent',
      });

      diffResult.addChange(ChangeType.REMOVED, 'capabilities', 'old_function', {
        before: { description: 'Old function' },
        after: null,
      });
    });

    it('should return all changes when no filters are provided', () => {
      const allChanges = diffResult.getChanges();
      expect(allChanges).toHaveLength(3);
    });

    it('should filter changes by category', () => {
      const capabilityChanges = diffResult.getChanges('capabilities');
      expect(capabilityChanges).toHaveLength(2);
      expect(capabilityChanges[0].key).toBe('analyze_text');
      expect(capabilityChanges[1].key).toBe('old_function');

      const intentChanges = diffResult.getChanges('intent');
      expect(intentChanges).toHaveLength(1);
      expect(intentChanges[0].key).toBe('description');
    });

    it('should filter changes by category and type', () => {
      const addedCapabilities = diffResult.getChanges(
        'capabilities',
        ChangeType.ADDED
      );
      expect(addedCapabilities).toHaveLength(1);
      expect(addedCapabilities[0].key).toBe('analyze_text');

      const removedCapabilities = diffResult.getChanges(
        'capabilities',
        ChangeType.REMOVED
      );
      expect(removedCapabilities).toHaveLength(1);
      expect(removedCapabilities[0].key).toBe('old_function');
    });
  });

  describe('getCapabilityChanges', () => {
    beforeEach(() => {
      // Add various capability changes
      diffResult.addChange(ChangeType.ADDED, 'capabilities', 'analyze_text', {
        before: null,
        after: { description: 'Analyzes text' },
      });

      diffResult.addChange(
        ChangeType.MODIFIED,
        'capabilities',
        'generate_content',
        {
          before: { description: 'Old description' },
          after: { description: 'New description' },
        }
      );

      diffResult.addChange(ChangeType.REMOVED, 'capabilities', 'old_function', {
        before: { description: 'Old function' },
        after: null,
      });

      // Add non-capability changes
      diffResult.addChange(ChangeType.MODIFIED, 'intent', 'description', {
        before: 'Old intent',
        after: 'New intent',
      });
    });

    it('should return only capability changes', () => {
      const capabilityChanges = diffResult.getCapabilityChanges();
      expect(capabilityChanges).toHaveLength(3);
      expect(capabilityChanges[0].category).toBe('capabilities');
      expect(capabilityChanges[1].category).toBe('capabilities');
      expect(capabilityChanges[2].category).toBe('capabilities');
    });
  });

  describe('getSimilarityScore', () => {
    it('should calculate similarity score based on changes', () => {
      // Create two identical blueprints
      const blueprint1 = createMockBlueprint();
      const blueprint2 = JSON.parse(JSON.stringify(blueprint1));

      // No changes = 100% similarity
      diffResult = new DiffResult();
      expect(diffResult.getSimilarityScore(blueprint1, blueprint2)).toBe(100);

      // Add some changes
      diffResult.addChange(ChangeType.ADDED, 'capabilities', 'new_function', {
        before: null,
        after: { description: 'New function' },
      });

      // One capability added out of two existing = less than 100% similarity
      const score = diffResult.getSimilarityScore(blueprint1, blueprint2);
      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThan(0);
    });

    it('should handle empty blueprints', () => {
      const emptyBlueprint = {};
      expect(
        diffResult.getSimilarityScore(emptyBlueprint, emptyBlueprint)
      ).toBe(100);
    });
  });
});
