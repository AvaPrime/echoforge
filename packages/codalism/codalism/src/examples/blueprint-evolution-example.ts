/**
 * Example demonstrating blueprint evolution using Codalism and Memory Consolidation
 */

import { CodalismInterpreter } from '../interpreter/CodalismInterpreter';
import { SemanticBlueprint } from '../models/SemanticBlueprint';
import {
  MemoryManager,
  MemoryConsolidator,
  SemanticClusteringStrategy,
  LLMSummarizationStrategy,
  MemoryEventType,
} from '@echoforge/echocore';

/**
 * Mock implementation of language model provider for demonstration purposes
 */
class MockLanguageModelProvider {
  async complete(prompt: string): Promise<string> {
    console.log('Mock LLM received prompt:', prompt.substring(0, 100) + '...');

    // Return a mock response based on the prompt content
    if (prompt.includes('summarize')) {
      return JSON.stringify({
        summary:
          'These blueprints all describe CLI-based sentiment analysis systems with varying levels of complexity.',
        patterns: [
          'All systems use a command-line interface for user interaction',
          'All systems include sentiment analysis capabilities',
          'Most systems include some form of data persistence',
        ],
        recommendations: [
          'Consider creating a unified CLI framework with pluggable analysis modules',
          'Extract the sentiment analysis logic into a shared library',
        ],
      });
    }

    return 'Mock LLM response';
  }

  async embed(text: string): Promise<number[]> {
    // Return a simple mock embedding (just for demonstration)
    return Array(10)
      .fill(0)
      .map(() => Math.random());
  }
}

/**
 * Main function demonstrating blueprint evolution
 */
async function demonstrateBlueprintEvolution() {
  console.log('Starting Blueprint Evolution Example');

  // Initialize components
  const mockLLM = new MockLanguageModelProvider();
  const memoryManager = new MemoryManager({
    enableReflexiveHooks: true,
  });

  const interpreter = new CodalismInterpreter({
    languageModelProvider: mockLLM,
  });

  // Create consolidation strategies
  const clusteringStrategy = new SemanticClusteringStrategy({
    embeddingProvider: mockLLM,
    similarityThreshold: 0.7,
  });

  const summarizationStrategy = new LLMSummarizationStrategy({
    languageModelProvider: mockLLM,
    consolidatedMemoryType: 'blueprint_pattern',
  });

  // Create consolidator
  const consolidator = new MemoryConsolidator(
    memoryManager,
    clusteringStrategy,
    summarizationStrategy
  );

  // Register a hook to track blueprint changes
  memoryManager.registerHook({
    eventType: MemoryEventType.onStore,
    memoryType: 'blueprint',
    hook: async (context) => {
      const { entry } = context;

      console.log(`Blueprint stored: ${entry.id}`);

      // Store a reference to this version in a blueprint history
      await memoryManager.store({
        type: 'blueprint_history',
        content: {
          blueprintId: entry.id,
          timestamp: Date.now(),
          version: entry.metadata?.version || 1,
        },
        tags: ['blueprint', 'history', `blueprint:${entry.id}`],
      });
    },
  });

  // Generate and store multiple blueprints representing evolution
  const inputs = [
    'Create a simple CLI tool that analyzes text for sentiment',
    'Enhance the sentiment analyzer to store results in a database',
    'Add user authentication to the sentiment analysis system',
    'Extend the sentiment analyzer with multi-language support',
  ];

  const blueprints: SemanticBlueprint[] = [];

  // Process each input as an evolution of the system
  for (let i = 0; i < inputs.length; i++) {
    console.log(`\nProcessing evolution step ${i + 1}: ${inputs[i]}`);

    // Interpret the current input
    const blueprint = await interpreter.interpret(inputs[i]);
    blueprints.push(blueprint);

    // Store the blueprint with version information
    await memoryManager.store({
      type: 'blueprint',
      content: blueprint.toJSON(),
      tags: ['blueprint', 'system_design', 'sentiment_analyzer'],
      metadata: { version: i + 1 },
    });

    // Display the blueprint
    console.log('Blueprint created:');
    console.log(`- Name: ${blueprint.name}`);
    console.log(
      `- Intents: ${blueprint.intents.map((i) => i.description).join(', ')}`
    );
    console.log(
      `- Modules: ${blueprint.modules.map((m) => m.name).join(', ')}`
    );
  }

  console.log('\nConsolidating blueprints to identify patterns...');

  // Consolidate blueprints to identify patterns
  const results = await consolidator.consolidate({
    type: ['blueprint'],
    tags: ['sentiment_analyzer'],
  });

  console.log(`Identified ${results.length} blueprint patterns`);

  // Display the consolidated insights
  if (results.length > 0) {
    const consolidatedMemory = results[0];
    console.log('\nConsolidated Insights:');
    console.log(JSON.stringify(consolidatedMemory.content, null, 2));
  }

  console.log('\nBlueprint Evolution Example Complete');
}

// Run the example
demonstrateBlueprint;
Evolution().catch(console.error);
