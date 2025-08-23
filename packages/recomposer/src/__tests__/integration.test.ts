/**
 * integration.test.ts
 * Integration tests for the recomposer package
 */

import { BlueprintComposer, ConflictStrategy } from '../BlueprintComposer';
import { CapabilityExtractor, SelectorType } from '../CapabilityExtractor';
import { BlueprintDiff, ChangeType } from '../BlueprintDiff';
import { createMockBlueprint } from './setup/testUtils';

describe('Recomposer Integration', () => {
  it('should perform a complete recomposition workflow', () => {
    // Create two mock blueprints
    const blueprint1 = createMockBlueprint({
      name: 'TextAnalyzer',
      intent: {
        description: 'Analyzes text for sentiment and entities',
      },
      capabilities: {
        analyze_sentiment: {
          description: 'Analyzes sentiment in text',
          function: 'function analyze_sentiment(text) { return "positive"; }',
        },
        extract_entities: {
          description: 'Extracts entities from text',
          function:
            'function extract_entities(text) { return ["entity1", "entity2"]; }',
        },
      },
    });

    const blueprint2 = createMockBlueprint({
      name: 'ContentGenerator',
      intent: {
        description: 'Generates content based on prompts',
      },
      capabilities: {
        generate_content: {
          description: 'Generates content based on a prompt',
          function:
            'function generate_content(prompt) { return "generated content"; }',
        },
        format_output: {
          description: 'Formats the output content',
          function:
            'function format_output(content) { return content.toUpperCase(); }',
        },
      },
    });

    // 1. Compose the blueprints
    const composer = new BlueprintComposer({
      conflictStrategy: ConflictStrategy.MERGE,
      autoRefinement: true,
      maintainLineage: true,
    });

    const composedBlueprint = composer.compose([blueprint1, blueprint2]);

    // Verify composition results
    expect(composedBlueprint).toBeDefined();
    expect(composedBlueprint.id).toBeDefined();
    expect(composedBlueprint.capabilities).toHaveProperty('analyze_sentiment');
    expect(composedBlueprint.capabilities).toHaveProperty('extract_entities');
    expect(composedBlueprint.capabilities).toHaveProperty('generate_content');
    expect(composedBlueprint.capabilities).toHaveProperty('format_output');

    // 2. Extract a capability
    const extractor = new CapabilityExtractor({
      selectorType: SelectorType.FUNCTION_NAME,
      includeRelatedFunctions: true,
      generateMinimalViableModule: true,
    });

    const extractedBlueprint = extractor.extract(
      composedBlueprint,
      'analyze_sentiment'
    );

    // Verify extraction results
    expect(extractedBlueprint).toBeDefined();
    expect(extractedBlueprint.id).toBeDefined();
    expect(extractedBlueprint.capabilities).toHaveProperty('analyze_sentiment');
    expect(extractedBlueprint.capabilities).not.toHaveProperty(
      'generate_content'
    );

    // 3. Compare original and extracted blueprints
    const diff = BlueprintDiff.compare(composedBlueprint, extractedBlueprint);

    // Verify diff results
    expect(diff).toBeDefined();
    expect(diff.changes.length).toBeGreaterThan(0);

    // Verify capability changes
    const capabilityChanges = diff.getCapabilityChanges();
    expect(
      capabilityChanges.some(
        (change) =>
          change.type === ChangeType.REMOVED &&
          change.key === 'generate_content'
      )
    ).toBe(true);

    // Verify narrative generation
    const narrative = diff.generateNarrative();
    expect(narrative).toContain('capabilities');
    expect(narrative.length).toBeGreaterThan(0);

    // Verify similarity score
    const similarityScore = diff.getSimilarityScore(
      composedBlueprint,
      extractedBlueprint
    );
    expect(similarityScore).toBeGreaterThan(0);
    expect(similarityScore).toBeLessThan(100);
  });
});
