import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CodalismInterpreter,
  LanguageModelProvider,
} from './CodalismInterpreter';
import { SemanticBlueprint } from '../models/SemanticBlueprint';

describe('CodalismInterpreter', () => {
  let interpreter: CodalismInterpreter;

  beforeEach(() => {
    interpreter = new CodalismInterpreter();
  });

  it('should create a basic blueprint from natural language', async () => {
    const input =
      'Create a system that reads user input from a CLI, stores it in a searchable memory, and analyzes it for emotional tone.';

    const blueprint = await interpreter.interpret(input);

    // Check basic properties
    expect(blueprint).toBeInstanceOf(SemanticBlueprint);
    expect(blueprint.name).toBeDefined();
    expect(blueprint.description).toBe(input);
    expect(blueprint.originalInput).toBe(input);

    // Check that intents were extracted
    expect(blueprint.intents.length).toBeGreaterThan(0);

    // Check that modules were extracted
    expect(blueprint.modules.length).toBeGreaterThan(0);

    // Verify we have expected modules based on the input
    const moduleNames = blueprint.modules.map((m) => m.name);
    expect(moduleNames).toEqual(
      expect.arrayContaining(['InputListener', 'MemoryStore', 'Analyzer'])
    );
  });

  it('should use language model provider when available', async () => {
    // Mock language model provider
    const mockProvider: LanguageModelProvider = {
      generateCompletion: vi.fn().mockImplementation(async (prompt: string) => {
        if (prompt.includes('system name and description')) {
          return JSON.stringify({
            name: 'Emotion Analysis CLI',
            description:
              'A command-line system for analyzing emotional tone in text',
          });
        } else if (prompt.includes('goals or intents')) {
          return JSON.stringify([
            { description: 'Capture user input via CLI', priority: 8 },
            { description: 'Store input in searchable memory', priority: 7 },
            { description: 'Analyze text for emotional tone', priority: 9 },
          ]);
        } else if (prompt.includes('constraints or requirements')) {
          return JSON.stringify([
            {
              description: 'Must respond within 1 second',
              type: 'performance',
              severity: 7,
            },
          ]);
        } else if (prompt.includes('components or modules')) {
          return JSON.stringify([
            {
              name: 'CLIInterface',
              description: 'Handles command-line interaction',
              responsibilities: ['Parse commands', 'Display results'],
            },
            {
              name: 'MemoryManager',
              description: 'Manages text storage and retrieval',
              responsibilities: [
                'Store text',
                'Index for search',
                'Retrieve by query',
              ],
            },
            {
              name: 'EmotionAnalyzer',
              description: 'Analyzes text for emotional content',
              responsibilities: [
                'Detect emotions',
                'Score sentiment',
                'Categorize tone',
              ],
            },
          ]);
        }
        return '{}';
      }),
      extractStructuredData: vi.fn().mockImplementation(async () => ({})),
    };

    // Create interpreter with mock provider
    const interpreterWithLM = new CodalismInterpreter({
      languageModelProvider: mockProvider,
    });

    const input =
      'Build a CLI tool that analyzes text for emotions and stores results.';
    const blueprint = await interpreterWithLM.interpret(input);

    // Verify the language model was used
    expect(mockProvider.generateCompletion).toHaveBeenCalled();

    // Check that the blueprint has the expected properties
    expect(blueprint.name).toBe('Emotion Analysis CLI');
    expect(blueprint.description).toBe(
      'A command-line system for analyzing emotional tone in text'
    );

    // Check that the intents from the language model were used
    expect(blueprint.intents.length).toBe(3);
    expect(blueprint.intents[0].description).toBe('Capture user input via CLI');

    // Check that the modules from the language model were used
    expect(blueprint.modules.length).toBe(3);
    expect(blueprint.modules[0].name).toBe('CLIInterface');

    // Check that constraints were extracted
    expect(blueprint.constraints.length).toBe(1);
    expect(blueprint.constraints[0].description).toBe(
      'Must respond within 1 second'
    );
  });

  it('should infer relationships between modules', async () => {
    // Create a blueprint with known modules to test relationship inference
    const blueprint = new SemanticBlueprint({
      name: 'Test System',
      description: 'A system for testing relationship inference',
    });

    // Add modules that should have relationships
    const inputModule = blueprint.addModule({
      name: 'InputListener',
      description: 'Handles user input',
      responsibilities: ['Capture input'],
    });

    const memoryModule = blueprint.addModule({
      name: 'MemoryStore',
      description: 'Stores data',
      responsibilities: ['Store data'],
    });

    const analyzerModule = blueprint.addModule({
      name: 'Analyzer',
      description: 'Analyzes data',
      responsibilities: ['Analyze data'],
    });

    // Add an intent that should be fulfilled by modules
    const intent = blueprint.addIntent({
      description: 'Store and analyze user input data',
    });

    // Use the private method via any type assertion to test it directly
    await (interpreter as any).inferRelationships(blueprint);

    // Check that relationships were created
    expect(blueprint.relationships.length).toBeGreaterThan(0);

    // Verify dependency relationships
    const dependencies = blueprint.relationships.filter(
      (r) => r.type === 'depends-on'
    );
    expect(dependencies.length).toBeGreaterThan(0);

    // Verify fulfillment relationships
    const fulfillments = blueprint.relationships.filter(
      (r) => r.type === 'fulfills'
    );
    expect(fulfillments.length).toBeGreaterThan(0);
  });
});
