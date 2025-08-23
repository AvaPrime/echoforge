/**
 * Advanced example of using the Codalism Interpreter with a language model provider
 */

import {
  CodalismInterpreter,
  LanguageModelProvider,
} from '../interpreter/CodalismInterpreter';
import { SemanticBlueprint } from '../models/SemanticBlueprint';

/**
 * A mock language model provider for demonstration purposes
 * In a real implementation, this would connect to an actual LLM API
 */
class MockLanguageModelProvider implements LanguageModelProvider {
  async generateCompletion(prompt: string): Promise<string> {
    console.log('\nGenerating completion for prompt:', prompt);

    // Simulate different responses based on the prompt content
    if (prompt.includes('system name and description')) {
      return JSON.stringify({
        name: 'Emotional Intelligence CLI',
        description:
          'A command-line tool that captures, stores, and analyzes text for emotional content',
      });
    } else if (prompt.includes('goals or intents')) {
      return JSON.stringify([
        {
          description: 'Provide an intuitive CLI for text input and analysis',
          priority: 8,
        },
        {
          description: 'Store text entries with metadata for future reference',
          priority: 7,
        },
        {
          description: 'Analyze text for emotional tone and sentiment',
          priority: 9,
        },
        {
          description:
            'Generate insights based on emotional patterns over time',
          priority: 6,
        },
      ]);
    } else if (prompt.includes('constraints or requirements')) {
      return JSON.stringify([
        {
          description: 'Must provide real-time analysis feedback',
          type: 'performance',
          severity: 8,
        },
        {
          description: 'Should maintain user privacy and data security',
          type: 'security',
          severity: 9,
        },
        {
          description: 'Should work offline without internet connectivity',
          type: 'compatibility',
          severity: 7,
        },
      ]);
    } else if (prompt.includes('components or modules')) {
      return JSON.stringify([
        {
          name: 'CommandLineInterface',
          description: 'Handles user interaction through the command line',
          responsibilities: [
            'Parse user commands and input',
            'Display formatted results and feedback',
            'Provide help and documentation',
          ],
        },
        {
          name: 'MemoryRepository',
          description:
            'Manages persistent storage of text entries and analysis results',
          responsibilities: [
            'Store text entries with timestamps and metadata',
            'Index content for efficient searching',
            'Retrieve entries based on various criteria',
            'Maintain data integrity and backup',
          ],
        },
        {
          name: 'EmotionAnalysisEngine',
          description:
            'Processes text to identify emotional content and sentiment',
          responsibilities: [
            'Detect primary and secondary emotions',
            'Score text for sentiment (positive/negative)',
            'Identify emotional intensity and confidence levels',
            'Track emotional patterns over time',
          ],
        },
        {
          name: 'InsightGenerator',
          description:
            'Creates higher-level insights from emotional analysis data',
          responsibilities: [
            'Identify trends in emotional content',
            'Generate summary reports',
            'Suggest potential actions based on emotional patterns',
            'Provide visualization data for emotional trends',
          ],
        },
      ]);
    }

    // Default empty response
    return '{}';
  }

  async extractStructuredData<T>(text: string, schema: any): Promise<T> {
    // This is a simplified mock implementation
    return {} as T;
  }
}

/**
 * An advanced example showing how to use the Codalism Interpreter
 * with a language model provider for enhanced interpretation
 */
async function runAdvancedExample() {
  // Create a mock language model provider
  const languageModelProvider = new MockLanguageModelProvider();

  // Create an interpreter with the language model provider
  const interpreter = new CodalismInterpreter({ languageModelProvider });

  // Define a system through natural language
  const input =
    'Create a system that reads user input from a CLI, stores it in a searchable memory, and analyzes it for emotional tone.';

  console.log('Input:', input);
  console.log('\nInterpreting with language model assistance...');

  // Generate a semantic blueprint
  const blueprint = await interpreter.interpret(input);

  // Display the results
  console.log('\nGenerated Blueprint:\n');
  console.log(`Name: ${blueprint.name}`);
  console.log(`Description: ${blueprint.description}`);

  console.log('\nIntents:');
  blueprint.intents.forEach((intent) => {
    console.log(
      `- ${intent.description}${intent.priority ? ` (Priority: ${intent.priority})` : ''}`
    );
  });

  console.log('\nConstraints:');
  blueprint.constraints.forEach((constraint) => {
    console.log(`- ${constraint.description}`);
    console.log(
      `  Type: ${constraint.type}, Severity: ${constraint.severity || 'N/A'}`
    );
  });

  console.log('\nModules:');
  blueprint.modules.forEach((module) => {
    console.log(`- ${module.name}: ${module.description}`);
    console.log(`  Responsibilities:`);
    module.responsibilities.forEach((resp) => {
      console.log(`  * ${resp}`);
    });
  });

  console.log('\nRelationships:');
  blueprint.relationships.forEach((rel) => {
    console.log(`- ${rel.type}: ${rel.description}`);
  });

  // Demonstrate serialization
  console.log('\nBlueprint Serialization:');
  const serialized = JSON.stringify(blueprint.toJSON(), null, 2);
  console.log(serialized.substring(0, 500) + '...');

  // Demonstrate deserialization
  console.log('\nBlueprint Deserialization:');
  const deserialized = SemanticBlueprint.fromJSON(JSON.parse(serialized));
  console.log(`Deserialized blueprint name: ${deserialized.name}`);
  console.log(`Number of modules: ${deserialized.modules.length}`);
}

// Run the example
runAdvancedExample().catch((error) => {
  console.error('Error running advanced example:', error);
});
