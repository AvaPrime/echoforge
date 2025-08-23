/**
 * ExtractionOptions.test.ts
 * Tests for the ExtractionOptions module
 */

import { ExtractionOptions, SelectorType } from '../ExtractionOptions';

describe('ExtractionOptions', () => {
  describe('SelectorType enum', () => {
    it('should have the correct values', () => {
      expect(SelectorType.FUNCTION_NAME).toBe('FUNCTION_NAME');
      expect(SelectorType.INTENT_TAG).toBe('INTENT_TAG');
    });
  });

  describe('Default options', () => {
    it('should have correct default values when instantiated without parameters', () => {
      const options = new ExtractionOptions();

      expect(options.selectorType).toBe(SelectorType.FUNCTION_NAME);
      expect(options.includeRelatedFunctions).toBe(true);
      expect(options.includeRefinementAnnotations).toBe(true);
      expect(options.generateMinimalViableModule).toBe(true);
    });

    it('should override default values when options are provided', () => {
      const options = new ExtractionOptions({
        selectorType: SelectorType.INTENT_TAG,
        includeRelatedFunctions: false,
        includeRefinementAnnotations: false,
        generateMinimalViableModule: false,
      });

      expect(options.selectorType).toBe(SelectorType.INTENT_TAG);
      expect(options.includeRelatedFunctions).toBe(false);
      expect(options.includeRefinementAnnotations).toBe(false);
      expect(options.generateMinimalViableModule).toBe(false);
    });

    it('should allow partial overrides of default values', () => {
      const options = new ExtractionOptions({
        selectorType: SelectorType.INTENT_TAG,
        includeRefinementAnnotations: false,
      });

      expect(options.selectorType).toBe(SelectorType.INTENT_TAG);
      expect(options.includeRelatedFunctions).toBe(true); // Default value
      expect(options.includeRefinementAnnotations).toBe(false);
      expect(options.generateMinimalViableModule).toBe(true); // Default value
    });
  });

  describe('Validation', () => {
    it('should throw an error for invalid selector type', () => {
      expect(() => {
        new ExtractionOptions({
          // @ts-ignore - Testing invalid value
          selectorType: 'INVALID_SELECTOR',
        });
      }).toThrow(/Invalid selector type/);
    });

    it('should throw an error for non-boolean includeRelatedFunctions', () => {
      expect(() => {
        new ExtractionOptions({
          // @ts-ignore - Testing invalid value
          includeRelatedFunctions: 'not-a-boolean',
        });
      }).toThrow(/includeRelatedFunctions must be a boolean/);
    });

    it('should throw an error for non-boolean includeRefinementAnnotations', () => {
      expect(() => {
        new ExtractionOptions({
          // @ts-ignore - Testing invalid value
          includeRefinementAnnotations: 'not-a-boolean',
        });
      }).toThrow(/includeRefinementAnnotations must be a boolean/);
    });

    it('should throw an error for non-boolean generateMinimalViableModule', () => {
      expect(() => {
        new ExtractionOptions({
          // @ts-ignore - Testing invalid value
          generateMinimalViableModule: 'not-a-boolean',
        });
      }).toThrow(/generateMinimalViableModule must be a boolean/);
    });
  });
});
