/**
 * CapabilityExtractor.test.ts
 * Tests for the CapabilityExtractor class
 */

import { CapabilityExtractor } from '../CapabilityExtractor';
import { SelectorType } from '../interfaces/ExtractionOptions';

// Mock blueprint for testing
const mockBlueprint = {
  id: 'blueprint-123',
  name: 'TestBlueprint',
  intent: {
    description: 'Test blueprint for capability extraction',
  },
  dominantSequence: ['function1', 'function2', 'function3'],
  capabilities: {
    function1: {
      description: 'Test function 1',
      function: 'function function1() { return function2(); }',
    },
    function2: {
      description: 'Test function 2',
      function: 'function function2() { return "function2"; }',
    },
    function3: {
      description: 'Test function 3',
      function: 'function function3() { return "function3"; }',
    },
    // Function with intent tag
    analyze_data: {
      description: 'Analyzes data',
      function: 'function analyze_data() { return "analyzed"; }',
      intentTags: ['data_processing'],
    },
    process_data: {
      description: 'Processes data',
      function: 'function process_data() { return analyze_data(); }',
      intentTags: ['data_processing'],
    },
  },
  suggestedAgents: ['agent1', 'agent2'],
  refinementAnnotations: {
    function1: {
      improvement: 'Could be improved',
      priority: 'medium',
    },
    function2: {
      improvement: 'Works well',
      priority: 'low',
    },
  },
};

describe('CapabilityExtractor', () => {
  let extractor: CapabilityExtractor;

  beforeEach(() => {
    extractor = new CapabilityExtractor();
  });

  describe('constructor', () => {
    it('should create a new instance with default options', () => {
      expect(extractor).toBeInstanceOf(CapabilityExtractor);
    });

    it('should create a new instance with custom options', () => {
      const customExtractor = new CapabilityExtractor({
        includeRelatedFunctions: false,
        generateMinimalViableModule: false,
        maxDependencyDepth: 1,
      });
      expect(customExtractor).toBeInstanceOf(CapabilityExtractor);
    });
  });

  describe('extract', () => {
    it('should extract a function by name', async () => {
      const result = await extractor.extract(mockBlueprint, {
        selector: 'function1',
        selectorType: SelectorType.FUNCTION,
      });

      expect(result).toBeDefined();
      expect(result.id).not.toBe(mockBlueprint.id);
      expect(result.name).toContain('function1');
      expect(result.capabilities).toBeDefined();
      expect(result.capabilities.function1).toBeDefined();

      // Should include related function (function2) due to dependency
      expect(result.capabilities.function2).toBeDefined();

      // Should not include unrelated function (function3)
      expect(result.capabilities.function3).toBeUndefined();
    });

    it('should extract capabilities by intent tag', async () => {
      const result = await extractor.extract(mockBlueprint, {
        selector: 'data_processing',
        selectorType: SelectorType.INTENT_TAG,
      });

      expect(result).toBeDefined();
      expect(result.capabilities).toBeDefined();
      expect(result.capabilities.analyze_data).toBeDefined();
      expect(result.capabilities.process_data).toBeDefined();

      // Should not include unrelated functions
      expect(result.capabilities.function1).toBeUndefined();
    });

    it('should extract a capability with minimal viable module', async () => {
      const result = await extractor.extract(mockBlueprint, {
        selector: 'function1',
        selectorType: SelectorType.FUNCTION,
        generateMinimalViableModule: true,
      });

      expect(result).toBeDefined();
      expect(result.capabilities).toBeDefined();
      expect(result.dominantSequence).toBeDefined();
      expect(result.dominantSequence).toContain('function1');

      // Should include refinement annotations for the extracted function
      expect(result.refinementAnnotations).toBeDefined();
      expect(result.refinementAnnotations.function1).toBeDefined();
    });

    it('should extract a capability without related functions when option is disabled', async () => {
      const result = await extractor.extract(mockBlueprint, {
        selector: 'function1',
        selectorType: SelectorType.FUNCTION,
        includeRelatedFunctions: false,
      });

      expect(result).toBeDefined();
      expect(result.capabilities).toBeDefined();
      expect(result.capabilities.function1).toBeDefined();

      // Should not include related function (function2) when option is disabled
      expect(result.capabilities.function2).toBeUndefined();
    });

    it('should extract a capability without refinement annotations when option is disabled', async () => {
      const result = await extractor.extract(mockBlueprint, {
        selector: 'function1',
        selectorType: SelectorType.FUNCTION,
        includeRefinementAnnotations: false,
      });

      expect(result).toBeDefined();
      expect(result.refinementAnnotations).toBeUndefined();
    });

    it('should throw an error when selector is not found', async () => {
      await expect(
        extractor.extract(mockBlueprint, {
          selector: 'nonexistent_function',
          selectorType: SelectorType.FUNCTION,
        })
      ).rejects.toThrow('Selector not found');
    });
  });

  describe('identifyDependencies', () => {
    it('should identify direct dependencies of a function', () => {
      const dependencies = extractor.identifyDependencies(
        mockBlueprint.capabilities.function1,
        mockBlueprint.capabilities,
        1 // Max depth
      );

      expect(dependencies).toContain('function2');
      expect(dependencies).not.toContain('function3');
    });

    it('should respect max dependency depth', () => {
      // Mock a deeper dependency chain
      const deepBlueprint = {
        capabilities: {
          functionA: {
            function: 'function functionA() { return functionB(); }',
          },
          functionB: {
            function: 'function functionB() { return functionC(); }',
          },
          functionC: {
            function: 'function functionC() { return "C"; }',
          },
        },
      };

      // With depth 1, should only include direct dependency
      const dependencies1 = extractor.identifyDependencies(
        deepBlueprint.capabilities.functionA,
        deepBlueprint.capabilities,
        1
      );
      expect(dependencies1).toContain('functionB');
      expect(dependencies1).not.toContain('functionC');

      // With depth 2, should include indirect dependency
      const dependencies2 = extractor.identifyDependencies(
        deepBlueprint.capabilities.functionA,
        deepBlueprint.capabilities,
        2
      );
      expect(dependencies2).toContain('functionB');
      expect(dependencies2).toContain('functionC');
    });
  });

  describe('createMinimalViableModule', () => {
    it('should create a minimal viable module from a capability', () => {
      const capability = mockBlueprint.capabilities.function1;
      const dependencies = ['function2'];

      const result = extractor.createMinimalViableModule(
        mockBlueprint,
        'function1',
        capability,
        dependencies,
        { includeRefinementAnnotations: true }
      );

      expect(result).toBeDefined();
      expect(result.id).not.toBe(mockBlueprint.id);
      expect(result.name).toContain('function1');
      expect(result.capabilities).toBeDefined();
      expect(result.capabilities.function1).toBeDefined();
      expect(result.capabilities.function2).toBeDefined();
      expect(result.dominantSequence).toContain('function1');
      expect(result.refinementAnnotations).toBeDefined();
      expect(result.refinementAnnotations.function1).toBeDefined();
    });
  });
});
