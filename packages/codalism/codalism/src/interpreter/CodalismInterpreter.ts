import { SemanticBlueprint } from '../models/SemanticBlueprint';
import {
  Intent,
  Constraint,
  Module,
  Interface,
  InterfaceType,
} from '../models/BlueprintTypes';

/**
 * Options for the Codalism Interpreter
 */
export interface CodalismInterpreterOptions {
  /** Optional language model provider for enhanced interpretation */
  languageModelProvider?: LanguageModelProvider;
  /** Default system name if none is extracted */
  defaultSystemName?: string;
  /** Whether to extract intents automatically */
  extractIntents?: boolean;
  /** Whether to extract modules automatically */
  extractModules?: boolean;
  /** Whether to extract constraints automatically */
  extractConstraints?: boolean;
  /** Whether to infer relationships automatically */
  inferRelationships?: boolean;
}

/**
 * Interface for language model providers
 */
export interface LanguageModelProvider {
  /**
   * Generates a completion based on a prompt
   */
  generateCompletion(prompt: string): Promise<string>;

  /**
   * Extracts structured data from text
   */
  extractStructuredData<T>(text: string, schema: any): Promise<T>;
}

/**
 * The Codalism Interpreter transforms natural language intents into semantic blueprints
 */
export class CodalismInterpreter {
  private options: CodalismInterpreterOptions;

  /**
   * Creates a new Codalism Interpreter
   */
  constructor(options: CodalismInterpreterOptions = {}) {
    this.options = {
      defaultSystemName: 'Untitled System',
      extractIntents: true,
      extractModules: true,
      extractConstraints: true,
      inferRelationships: true,
      ...options,
    };
  }

  /**
   * Interprets natural language input into a semantic blueprint
   */
  async interpret(input: string): Promise<SemanticBlueprint> {
    // Extract system name and description
    const { name, description } = await this.extractSystemInfo(input);

    // Create the blueprint
    const blueprint = new SemanticBlueprint({
      name,
      description,
      originalInput: input,
    });

    // Extract intents if enabled
    if (this.options.extractIntents) {
      const intents = await this.extractIntents(input);
      for (const intent of intents) {
        blueprint.addIntent(intent);
      }
    }

    // Extract constraints if enabled
    if (this.options.extractConstraints) {
      const constraints = await this.extractConstraints(input);
      for (const constraint of constraints) {
        blueprint.addConstraint(constraint);
      }
    }

    // Extract modules if enabled
    if (this.options.extractModules) {
      const modules = await this.extractModules(input);
      for (const module of modules) {
        blueprint.addModule(module);
      }
    }

    // Infer relationships if enabled
    if (this.options.inferRelationships && blueprint.modules.length > 0) {
      await this.inferRelationships(blueprint);
    }

    return blueprint;
  }

  /**
   * Extracts system name and description from input
   */
  private async extractSystemInfo(
    input: string
  ): Promise<{ name: string; description: string }> {
    // If we have a language model provider, use it for better extraction
    if (this.options.languageModelProvider) {
      try {
        const prompt = `Extract a concise system name and description from the following requirement:\n\n${input}\n\nProvide the result as JSON with 'name' and 'description' fields.`;
        const completion =
          await this.options.languageModelProvider.generateCompletion(prompt);
        const result = JSON.parse(completion);
        return {
          name:
            result.name || this.options.defaultSystemName || 'Untitled System',
          description: result.description || input,
        };
      } catch (error) {
        console.warn(
          'Error extracting system info with language model:',
          error
        );
      }
    }

    // Fallback to simple heuristics
    const words = input.split(/\s+/);
    const name =
      words.length <= 5 ? input : `${words.slice(0, 5).join(' ')}...`;

    return {
      name: name || this.options.defaultSystemName || 'Untitled System',
      description: input,
    };
  }

  /**
   * Extracts intents from input
   */
  private async extractIntents(input: string): Promise<Omit<Intent, 'id'>[]> {
    // If we have a language model provider, use it for better extraction
    if (this.options.languageModelProvider) {
      try {
        const prompt = `Extract the main goals or intents from the following requirement:\n\n${input}\n\nProvide the result as a JSON array where each item has 'description' and optional 'priority' (1-10) fields.`;
        const completion =
          await this.options.languageModelProvider.generateCompletion(prompt);
        return JSON.parse(completion);
      } catch (error) {
        console.warn('Error extracting intents with language model:', error);
      }
    }

    // Fallback to simple heuristics
    const intents: Omit<Intent, 'id'>[] = [];

    // Look for phrases like "system that", "application that", etc.
    const matches = input.match(
      /(?:system|application|platform|service|tool)\s+that\s+([^,.]+)/gi
    );
    if (matches) {
      for (const match of matches) {
        const description = match.replace(
          /(?:system|application|platform|service|tool)\s+that\s+/i,
          ''
        );
        intents.push({ description });
      }
    }

    // If no intents found, use the whole input as a single intent
    if (intents.length === 0) {
      intents.push({ description: input });
    }

    return intents;
  }

  /**
   * Extracts constraints from input
   */
  private async extractConstraints(
    input: string
  ): Promise<Omit<Constraint, 'id'>[]> {
    // If we have a language model provider, use it for better extraction
    if (this.options.languageModelProvider) {
      try {
        const prompt = `Extract any constraints or requirements from the following:\n\n${input}\n\nProvide the result as a JSON array where each item has 'description', 'type' (e.g., 'performance', 'security', 'compatibility'), and optional 'severity' (1-10) fields.`;
        const completion =
          await this.options.languageModelProvider.generateCompletion(prompt);
        return JSON.parse(completion);
      } catch (error) {
        console.warn(
          'Error extracting constraints with language model:',
          error
        );
      }
    }

    // Fallback to simple heuristics
    const constraints: Omit<Constraint, 'id'>[] = [];

    // Look for phrases like "must be", "should be", "needs to", etc.
    const mustMatches = input.match(
      /(?:must|should|needs to|has to)\s+([^,.]+)/gi
    );
    if (mustMatches) {
      for (const match of mustMatches) {
        const description = match;
        constraints.push({
          description,
          type: 'functional',
        });
      }
    }

    return constraints;
  }

  /**
   * Extracts modules from input
   */
  private async extractModules(input: string): Promise<Omit<Module, 'id'>[]> {
    // If we have a language model provider, use it for better extraction
    if (this.options.languageModelProvider) {
      try {
        const prompt = `Extract the main components or modules needed for the following system:\n\n${input}\n\nProvide the result as a JSON array where each item has 'name', 'description', and 'responsibilities' (array of strings) fields.`;
        const completion =
          await this.options.languageModelProvider.generateCompletion(prompt);
        return JSON.parse(completion);
      } catch (error) {
        console.warn('Error extracting modules with language model:', error);
      }
    }

    // Fallback to simple heuristics based on common patterns
    const modules: Omit<Module, 'id'>[] = [];

    // Check for CLI mention
    if (input.match(/\b(CLI|command line|terminal)\b/i)) {
      modules.push({
        name: 'InputListener',
        description: 'Handles user input from the command line interface',
        responsibilities: [
          'Capture user input',
          'Parse commands',
          'Route to appropriate handlers',
        ],
      });
    }

    // Check for memory/storage mention
    if (input.match(/\b(memory|stor(e|age)|database|save)\b/i)) {
      modules.push({
        name: 'MemoryStore',
        description: 'Manages persistent storage of data',
        responsibilities: ['Store data', 'Retrieve data', 'Index for search'],
      });
    }

    // Check for analysis mention
    if (input.match(/\b(analy(ze|sis)|process|evaluate)\b/i)) {
      modules.push({
        name: 'Analyzer',
        description: 'Analyzes data for insights',
        responsibilities: [
          'Process data',
          'Extract insights',
          'Generate reports',
        ],
      });
    }

    // If no modules found, create a generic one
    if (modules.length === 0) {
      modules.push({
        name: 'CoreSystem',
        description: 'Core system functionality',
        responsibilities: ['Handle main system operations'],
      });
    }

    return modules;
  }

  /**
   * Infers relationships between entities in the blueprint
   */
  private async inferRelationships(
    blueprint: SemanticBlueprint
  ): Promise<void> {
    // Simple heuristic: if we have modules with names that suggest dependencies
    // (e.g., InputListener -> MemoryStore -> Analyzer), create those dependencies
    const modules = blueprint.modules;

    // If we have an InputListener and a MemoryStore, they probably have a relationship
    const inputListener = modules.find((m) =>
      m.name.match(/Input|CLI|Command/i)
    );
    const memoryStore = modules.find((m) =>
      m.name.match(/Memory|Store|Storage|Database/i)
    );

    if (inputListener && memoryStore) {
      blueprint.addDependency(inputListener.id, memoryStore.id);
    }

    // If we have a MemoryStore and an Analyzer, they probably have a relationship
    const analyzer = modules.find((m) =>
      m.name.match(/Analy|Process|Evaluate/i)
    );

    if (memoryStore && analyzer) {
      blueprint.addDependency(analyzer.id, memoryStore.id);
    }

    // Connect modules to intents based on keyword matching
    for (const module of modules) {
      for (const intent of blueprint.intents) {
        // Simple heuristic: if the module name or description contains words from the intent,
        // it probably fulfills that intent
        const moduleText = `${module.name} ${module.description}`.toLowerCase();
        const intentText = intent.description.toLowerCase();

        // Check if there's significant word overlap
        const moduleWords = new Set(
          moduleText.split(/\W+/).filter((w) => w.length > 3)
        );
        const intentWords = new Set(
          intentText.split(/\W+/).filter((w) => w.length > 3)
        );

        let matches = 0;
        for (const word of intentWords) {
          if (moduleWords.has(word)) {
            matches++;
          }
        }

        // If there's significant overlap, create a fulfillment relationship
        if (matches >= 2 || matches / intentWords.size >= 0.3) {
          blueprint.addFulfillment(module.id, intent.id);
        }
      }
    }
  }
}
