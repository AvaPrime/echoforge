/**
 * index.test.ts
 * Tests for the main package exports
 */

import * as Recomposer from '../index';

describe('Package exports', () => {
  it('should export BlueprintComposer', () => {
    expect(Recomposer.BlueprintComposer).toBeDefined();
    expect(typeof Recomposer.BlueprintComposer).toBe('function');
  });

  it('should export CapabilityExtractor', () => {
    expect(Recomposer.CapabilityExtractor).toBeDefined();
    expect(typeof Recomposer.CapabilityExtractor).toBe('function');
  });

  it('should export BlueprintDiff', () => {
    expect(Recomposer.BlueprintDiff).toBeDefined();
    expect(typeof Recomposer.BlueprintDiff).toBe('function');
  });

  it('should export CompositionOptions and ConflictStrategy', () => {
    expect(Recomposer.CompositionOptions).toBeDefined();
    expect(typeof Recomposer.CompositionOptions).toBe('function');
    expect(Recomposer.ConflictStrategy).toBeDefined();
    expect(Object.keys(Recomposer.ConflictStrategy).length).toBeGreaterThan(0);
  });

  it('should export ExtractionOptions and SelectorType', () => {
    expect(Recomposer.ExtractionOptions).toBeDefined();
    expect(typeof Recomposer.ExtractionOptions).toBe('function');
    expect(Recomposer.SelectorType).toBeDefined();
    expect(Object.keys(Recomposer.SelectorType).length).toBeGreaterThan(0);
  });

  it('should export DiffResult and ChangeType', () => {
    expect(Recomposer.DiffResult).toBeDefined();
    expect(typeof Recomposer.DiffResult).toBe('function');
    expect(Recomposer.ChangeType).toBeDefined();
    expect(Object.keys(Recomposer.ChangeType).length).toBeGreaterThan(0);
  });
});
