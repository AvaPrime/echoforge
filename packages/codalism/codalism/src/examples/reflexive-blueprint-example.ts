/**
 * Example demonstrating a self-evolving blueprint using Codalism and Reflexive Memory
 */

import { CodalismInterpreter } from '../interpreter/CodalismInterpreter';
import { SemanticBlueprint } from '../models/SemanticBlueprint';
import {
  MemoryManager,
  MemoryEventType,
  MemoryEntry,
} from '@echoforge/echocore';

/**
 * Mock implementation of language model provider for demonstration purposes
 */
class MockLanguageModelProvider {
  async complete(prompt: string): Promise<string> {
    console.log('Mock LLM received prompt:', prompt.substring(0, 100) + '...');

    // Return a mock response based on the prompt content
    if (prompt.includes('enhance') || prompt.includes('improve')) {
      return JSON.stringify({
        enhancements: [
          {
            type: 'module',
            name: 'DataPersistenceManager',
            description: 'Manages data persistence across sessions',
            interfaces: ['save', 'load', 'query'],
          },
          {
            type: 'module',
            name: 'UserPreferencesManager',
            description: 'Manages user preferences and settings',
            interfaces: ['getPreference', 'setPreference', 'resetPreferences'],
          },
        ],
        reasoning:
          'The system needs data persistence to maintain state between sessions and user preferences to customize behavior.',
      });
    }

    return 'Mock LLM response';
  }
}

/**
 * A reflexive agent that can suggest improvements to blueprints
 */
class BlueprintEvolver {
  private languageModelProvider: MockLanguageModelProvider;
  private memoryManager: MemoryManager;

  constructor(
    languageModelProvider: MockLanguageModelProvider,
    memoryManager: MemoryManager
  ) {
    this.languageModelProvider = languageModelProvider;
    this.memoryManager = memoryManager;
  }

  async suggestImprovements(blueprint: SemanticBlueprint): Promise<any> {
    // Create a prompt asking for improvements to the blueprint
    const prompt = `
      I have a system blueprint with the following characteristics:
      Name: ${blueprint.name}
      Description: ${blueprint.description}
      Intents: ${blueprint.intents.map((i) => i.description).join(', ')}
      Modules: ${blueprint.modules.map((m) => m.name + ': ' + m.description).join(', ')}
      
      Please suggest enhancements or improvements to this blueprint. Focus on:
      1. Additional modules that might be useful
      2. Improvements to existing modules
      3. New capabilities that would align with the system's intents
      
      Return your response as a JSON object with an 'enhancements' array and a 'reasoning' field.
    `;

    // Get suggestions from the language model
    const response = await this.languageModelProvider.complete(prompt);

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      return { enhancements: [], reasoning: 'Error processing response' };
    }
  }

  async applyImprovements(
    blueprint: SemanticBlueprint,
    improvements: any
  ): Promise<SemanticBlueprint> {
    // Create a copy of the blueprint
    const enhancedBlueprint = new SemanticBlueprint({
      name: blueprint.name,
      description:
        blueprint.description + '\n\nEnhanced with: ' + improvements.reasoning,
    });

    // Copy existing intents, constraints, modules, and relationships
    blueprint.intents.forEach((intent) => enhancedBlueprint.addIntent(intent));
    blueprint.constraints.forEach((constraint) =>
      enhancedBlueprint.addConstraint(constraint)
    );
    blueprint.modules.forEach((module) => enhancedBlueprint.addModule(module));
    blueprint.relationships.forEach((relationship) =>
      enhancedBlueprint.addRelationship(relationship)
    );

    // Add new modules from improvements
    if (improvements.enhancements) {
      improvements.enhancements.forEach((enhancement: any) => {
        if (enhancement.type === 'module') {
          enhancedBlueprint.addModule({
            name: enhancement.name,
            description: enhancement.description,
            interfaces: enhancement.interfaces || [],
          });
        }
      });
    }

    return enhancedBlueprint;
  }
}

/**
 * Main function demonstrating reflexive blueprint evolution
 */
async function demonstrateReflexiveBlueprint() {
  console.log('Starting Reflexive Blueprint Example');

  // Initialize components
  const mockLLM = new MockLanguageModelProvider();
  const memoryManager = new MemoryManager({
    enableReflexiveHooks: true,
  });

  const interpreter = new CodalismInterpreter({
    languageModelProvider: mockLLM,
  });

  const evolver = new BlueprintEvolver(mockLLM, memoryManager);

  // Register a hook to trigger blueprint evolution when a new blueprint is stored
  memoryManager.registerHook({
    eventType: MemoryEventType.onStore,
    memoryType: 'blueprint',
    hook: async (context) => {
      const { entry } = context;

      console.log(`Blueprint stored: ${entry.id}`);

      // Check if this is a new blueprint (not an evolution)
      if (!entry.metadata?.isEvolution) {
        console.log('Triggering blueprint evolution...');

        // Get the blueprint from the entry
        const blueprintData = entry.content as any;
        const blueprint = SemanticBlueprint.fromJSON(blueprintData);

        // Suggest improvements
        const improvements = await evolver.suggestImprovements(blueprint);
        console.log(
          'Suggested improvements:',
          JSON.stringify(improvements, null, 2)
        );

        // Apply improvements
        const enhancedBlueprint = await evolver.applyImprovements(
          blueprint,
          improvements
        );

        // Store the enhanced blueprint
        await memoryManager.store({
          type: 'blueprint',
          content: enhancedBlueprint.toJSON(),
          tags: ['blueprint', 'system_design', 'evolved'],
          metadata: {
            originalId: entry.id,
            version: (entry.metadata?.version || 1) + 1,
            isEvolution: true,
          },
        });
      }
    },
  });

  // Create an initial blueprint
  const input =
    'Create a note-taking application with tagging and search capabilities';
  console.log(`\nInterpreting initial request: ${input}`);

  const blueprint = await interpreter.interpret(input);

  // Display the initial blueprint
  console.log('Initial Blueprint:');
  console.log(`- Name: ${blueprint.name}`);
  console.log(`- Description: ${blueprint.description}`);
  console.log(
    `- Intents: ${blueprint.intents.map((i) => i.description).join(', ')}`
  );
  console.log(`- Modules: ${blueprint.modules.map((m) => m.name).join(', ')}`);

  // Store the blueprint to trigger the evolution hook
  await memoryManager.store({
    type: 'blueprint',
    content: blueprint.toJSON(),
    tags: ['blueprint', 'system_design', 'note_taking'],
    metadata: { version: 1 },
  });

  // Retrieve all blueprints to see the evolution
  const blueprints = await memoryManager.retrieve({
    type: ['blueprint'],
    tags: ['system_design'],
  });

  console.log(`\nRetrieved ${blueprints.length} blueprints:`);

  // Display all blueprints
  for (const entry of blueprints) {
    const blueprintData = entry.content as any;
    console.log(`\nBlueprint ID: ${entry.id}`);
    console.log(`Version: ${entry.metadata?.version || 1}`);
    console.log(`Is Evolution: ${entry.metadata?.isEvolution ? 'Yes' : 'No'}`);

    if (entry.metadata?.originalId) {
      console.log(`Original Blueprint ID: ${entry.metadata.originalId}`);
    }

    const blueprint = SemanticBlueprint.fromJSON(blueprintData);
    console.log(`Modules: ${blueprint.modules.map((m) => m.name).join(', ')}`);
  }

  console.log('\nReflexive Blueprint Example Complete');
}

// Run the example
demonstrateReflexiveBlueprint().catch(console.error);
