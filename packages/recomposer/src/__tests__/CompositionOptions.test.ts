/**
 * CompositionOptions.test.ts
 * Tests for the CompositionOptions module
 */

import { CompositionOptions, ConflictStrategy } from '../CompositionOptions';

describe('CompositionOptions', () => {
  describe('ConflictStrategy enum', () => {
    it('should have the correct values', () => {
      expect(ConflictStrategy.FIRST_WINS).toBe('FIRST_WINS');
      expect(ConflictStrategy.LAST_WINS).toBe('LAST_WINS');
      expect(ConflictStrategy.MERGE).toBe('MERGE');
      expect(ConflictStrategy.ERROR).toBe('ERROR');
    });
  });

  describe('Default options', () => {
    it('should have correct default values when instantiated without parameters', () => {
      const options = new CompositionOptions();

      expect(options.conflictStrategy).toBe(ConflictStrategy.LAST_WINS);
      expect(options.autoRefinement).toBe(true);
      expect(options.maintainLineage).toBe(true);
    });

    it('should override default values when options are provided', () => {
      const options = new CompositionOptions({
        conflictStrategy: ConflictStrategy.FIRST_WINS,
        autoRefinement: false,
        maintainLineage: false,
      });

      expect(options.conflictStrategy).toBe(ConflictStrategy.FIRST_WINS);
      expect(options.autoRefinement).toBe(false);
      expect(options.maintainLineage).toBe(false);
    });

    it('should allow partial overrides of default values', () => {
      const options = new CompositionOptions({
        conflictStrategy: ConflictStrategy.ERROR,
      });

      expect(options.conflictStrategy).toBe(ConflictStrategy.ERROR);
      expect(options.autoRefinement).toBe(true); // Default value
      expect(options.maintainLineage).toBe(true); // Default value
    });
  });

  describe('Validation', () => {
    it('should throw an error for invalid conflict strategy', () => {
      expect(() => {
        new CompositionOptions({
          // @ts-ignore - Testing invalid value
          conflictStrategy: 'INVALID_STRATEGY',
        });
      }).toThrow(/Invalid conflict strategy/);
    });

    it('should throw an error for non-boolean autoRefinement', () => {
      expect(() => {
        new CompositionOptions({
          // @ts-ignore - Testing invalid value
          autoRefinement: 'not-a-boolean',
        });
      }).toThrow(/autoRefinement must be a boolean/);
    });

    it('should throw an error for non-boolean maintainLineage', () => {
      expect(() => {
        new CompositionOptions({
          // @ts-ignore - Testing invalid value
          maintainLineage: 'not-a-boolean',
        });
      }).toThrow(/maintainLineage must be a boolean/);
    });
  });
});
