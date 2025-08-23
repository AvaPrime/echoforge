/**
 * CapabilityExtractor
 * Extracts specific capabilities from blueprints to create reusable modules
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ExtractionOptions,
  SelectorType,
} from './interfaces/ExtractionOptions';

/**
 * Default extraction options
 */
const DEFAULT_EXTRACTION_OPTIONS: Partial<ExtractionOptions> = {
  selectorType: SelectorType.FUNCTION,
  includeRelatedFunctions: true,
  generateMinimalViableModule: true,
  maxDependencyDepth: 3,
  includeMetadata: true,
  includeRefinementAnnotations: true,
};

/**
 * CapabilityExtractor class
 * Responsible for extracting specific capabilities from blueprints
 */
export class CapabilityExtractor {
  private options: Partial<ExtractionOptions>;

  /**
   * Creates a new CapabilityExtractor instance
   * @param options Extraction options
   */
  constructor(options: Partial<ExtractionOptions> = {}) {
    this.options = { ...DEFAULT_EXTRACTION_OPTIONS, ...options };
  }

  /**
   * Extracts a capability from a blueprint
   * @param blueprint The blueprint to extract from
   * @param options Extraction options (overrides constructor options)
   * @returns The extracted capability as a new blueprint
   */
  async extract(
    blueprint: any,
    options: Partial<ExtractionOptions>
  ): Promise<any> {
    // Merge options with defaults
    const extractionOptions = {
      ...DEFAULT_EXTRACTION_OPTIONS,
      ...this.options,
      ...options,
    } as ExtractionOptions;

    // Validate input
    if (!blueprint) {
      throw new Error('No blueprint provided for extraction');
    }

    if (!extractionOptions.selector) {
      throw new Error('No selector provided for extraction');
    }

    // Extract based on selector type
    let extractedCapability: any;

    switch (extractionOptions.selectorType) {
      case SelectorType.FUNCTION:
        extractedCapability = this.extractFunction(
          blueprint,
          extractionOptions
        );
        break;

      case SelectorType.CLASS:
        extractedCapability = this.extractClass(blueprint, extractionOptions);
        break;

      case SelectorType.INTENT_TAG:
        extractedCapability = this.extractByIntentTag(
          blueprint,
          extractionOptions
        );
        break;

      case SelectorType.CAPABILITY:
        extractedCapability = this.extractCapability(
          blueprint,
          extractionOptions
        );
        break;

      default:
        throw new Error(
          `Unsupported selector type: ${extractionOptions.selectorType}`
        );
    }

    // Generate a minimal viable module if requested
    if (extractionOptions.generateMinimalViableModule) {
      return this.createMinimalViableModule(
        extractedCapability,
        blueprint,
        extractionOptions
      );
    }

    return extractedCapability;
  }

  /**
   * Extracts a function and its dependencies from a blueprint
   * @param blueprint The blueprint to extract from
   * @param options Extraction options
   * @returns The extracted function as a capability
   */
  private extractFunction(blueprint: any, options: ExtractionOptions): any {
    const { selector } = options;

    // Check if the function exists in refinement annotations
    const refinementAnnotations = blueprint.refinementAnnotations || {};
    const functionAnnotation = refinementAnnotations[selector];

    if (!functionAnnotation) {
      throw new Error(
        `Function ${selector} not found in blueprint refinement annotations`
      );
    }

    // Create a new capability with the function
    const extractedCapability = {
      function: selector,
      annotation: functionAnnotation,
    };

    // Include related functions if requested
    if (options.includeRelatedFunctions) {
      const dependencies = this.identifyDependencies(
        functionAnnotation,
        blueprint,
        options
      );

      extractedCapability.dependencies = dependencies.map((dep) => ({
        function: dep,
        annotation: refinementAnnotations[dep],
      }));
    }

    return extractedCapability;
  }

  /**
   * Extracts a class and its methods from a blueprint
   * @param blueprint The blueprint to extract from
   * @param options Extraction options
   * @returns The extracted class as a capability
   */
  private extractClass(blueprint: any, options: ExtractionOptions): any {
    const { selector } = options;

    // For simplicity, we'll assume classes are represented as a set of functions
    // with a common prefix in the refinement annotations
    const refinementAnnotations = blueprint.refinementAnnotations || {};
    const classMethods = Object.keys(refinementAnnotations).filter(
      (key) => key.startsWith(`${selector}.`) || key === selector
    );

    if (classMethods.length === 0) {
      throw new Error(
        `Class ${selector} not found in blueprint refinement annotations`
      );
    }

    // Create a new capability with the class methods
    const extractedCapability = {
      class: selector,
      methods: classMethods.map((method) => ({
        function: method,
        annotation: refinementAnnotations[method],
      })),
    };

    // Include related functions if requested
    if (options.includeRelatedFunctions) {
      const allDependencies = new Set<string>();

      classMethods.forEach((method) => {
        const methodDependencies = this.identifyDependencies(
          refinementAnnotations[method],
          blueprint,
          options
        );

        methodDependencies.forEach((dep) => allDependencies.add(dep));
      });

      // Remove class methods from dependencies
      classMethods.forEach((method) => allDependencies.delete(method));

      extractedCapability.dependencies = Array.from(allDependencies).map(
        (dep) => ({
          function: dep,
          annotation: refinementAnnotations[dep],
        })
      );
    }

    return extractedCapability;
  }

  /**
   * Extracts capabilities related to a specific intent tag from a blueprint
   * @param blueprint The blueprint to extract from
   * @param options Extraction options
   * @returns The extracted capabilities as a new blueprint
   */
  private extractByIntentTag(blueprint: any, options: ExtractionOptions): any {
    const { selector } = options;

    // Check if the intent tag exists in the blueprint
    const intent = blueprint.intent || {};
    const tags = intent.tags || [];

    if (!tags.includes(selector)) {
      throw new Error(`Intent tag ${selector} not found in blueprint`);
    }

    // Find capabilities related to the intent tag
    const capabilities = blueprint.capabilities || {};
    const relatedCapabilities: Record<string, any> = {};

    Object.entries(capabilities).forEach(
      ([name, capability]: [string, any]) => {
        const capabilityTags = capability.tags || [];

        if (capabilityTags.includes(selector)) {
          relatedCapabilities[name] = capability;
        }
      }
    );

    // Find refinement annotations related to the capabilities
    const refinementAnnotations = blueprint.refinementAnnotations || {};
    const relatedAnnotations: Record<string, any> = {};

    Object.entries(refinementAnnotations).forEach(
      ([name, annotation]: [string, any]) => {
        const annotationTags = annotation.tags || [];

        if (annotationTags.includes(selector)) {
          relatedAnnotations[name] = annotation;
        }
      }
    );

    return {
      intentTag: selector,
      capabilities: relatedCapabilities,
      refinementAnnotations: relatedAnnotations,
    };
  }

  /**
   * Extracts a specific capability from a blueprint
   * @param blueprint The blueprint to extract from
   * @param options Extraction options
   * @returns The extracted capability
   */
  private extractCapability(blueprint: any, options: ExtractionOptions): any {
    const { selector } = options;

    // Check if the capability exists in the blueprint
    const capabilities = blueprint.capabilities || {};
    const capability = capabilities[selector];

    if (!capability) {
      throw new Error(`Capability ${selector} not found in blueprint`);
    }

    // Find refinement annotations related to the capability
    const refinementAnnotations = blueprint.refinementAnnotations || {};
    const relatedAnnotations: Record<string, any> = {};

    // For simplicity, we'll assume capabilities are linked to functions
    // with the same name or with a capability tag
    Object.entries(refinementAnnotations).forEach(
      ([name, annotation]: [string, any]) => {
        const annotationCapabilities = annotation.capabilities || [];

        if (name === selector || annotationCapabilities.includes(selector)) {
          relatedAnnotations[name] = annotation;
        }
      }
    );

    return {
      capability: selector,
      definition: capability,
      refinementAnnotations: relatedAnnotations,
    };
  }

  /**
   * Identifies dependencies for a function or annotation
   * @param annotation The annotation to analyze
   * @param blueprint The blueprint containing all annotations
   * @param options Extraction options
   * @param depth Current depth of dependency resolution
   * @param visited Set of already visited functions
   * @returns Array of dependency function names
   */
  identifyDependencies(
    annotation: any,
    blueprint: any,
    options: ExtractionOptions,
    depth: number = 0,
    visited: Set<string> = new Set()
  ): string[] {
    if (!annotation || depth >= options.maxDependencyDepth) {
      return [];
    }

    const dependencies: Set<string> = new Set();
    const refinementAnnotations = blueprint.refinementAnnotations || {};

    // Extract dependencies from preconditions
    const preconditions = annotation.preconditions || [];
    preconditions.forEach((precondition: any) => {
      const functionCalls =
        this.extractFunctionCallsFromCondition(precondition);
      functionCalls.forEach((func) => dependencies.add(func));
    });

    // Extract dependencies from postconditions
    const postconditions = annotation.postconditions || [];
    postconditions.forEach((postcondition: any) => {
      const functionCalls =
        this.extractFunctionCallsFromCondition(postcondition);
      functionCalls.forEach((func) => dependencies.add(func));
    });

    // Extract dependencies from implementation
    const implementation = annotation.implementation || '';
    const implementationCalls =
      this.extractFunctionCallsFromImplementation(implementation);
    implementationCalls.forEach((func) => dependencies.add(func));

    // Recursively resolve dependencies if needed
    if (depth < options.maxDependencyDepth) {
      const allDependencies = new Set<string>(dependencies);

      dependencies.forEach((dep) => {
        if (!visited.has(dep) && refinementAnnotations[dep]) {
          visited.add(dep);

          const nestedDeps = this.identifyDependencies(
            refinementAnnotations[dep],
            blueprint,
            options,
            depth + 1,
            visited
          );

          nestedDeps.forEach((nestedDep) => allDependencies.add(nestedDep));
        }
      });

      return Array.from(allDependencies);
    }

    return Array.from(dependencies);
  }

  /**
   * Extracts function calls from a condition string
   * @param condition The condition to analyze
   * @returns Array of function names called in the condition
   */
  private extractFunctionCallsFromCondition(condition: any): string[] {
    if (typeof condition !== 'string') {
      return [];
    }

    // Simple regex to extract function calls
    // This is a simplified approach and might not catch all cases
    const functionCallRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    const matches = condition.matchAll(functionCallRegex);

    return Array.from(matches, (match) => match[1]);
  }

  /**
   * Extracts function calls from an implementation string
   * @param implementation The implementation to analyze
   * @returns Array of function names called in the implementation
   */
  private extractFunctionCallsFromImplementation(
    implementation: string
  ): string[] {
    if (!implementation) {
      return [];
    }

    // Simple regex to extract function calls
    // This is a simplified approach and might not catch all cases
    const functionCallRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    const matches = implementation.matchAll(functionCallRegex);

    return Array.from(matches, (match) => match[1]);
  }

  /**
   * Creates a minimal viable module from an extracted capability
   * @param extractedCapability The extracted capability
   * @param sourceBlueprint The source blueprint
   * @param options Extraction options
   * @returns A new blueprint containing the minimal viable module
   */
  createMinimalViableModule(
    extractedCapability: any,
    sourceBlueprint: any,
    options: ExtractionOptions
  ): any {
    // Create a new blueprint with the extracted capability
    const moduleBlueprint: any = {
      id: uuidv4(),
      name: `${options.selector} Module`,
      description: `Extracted ${options.selectorType} module for ${options.selector}`,
    };

    // Add intent based on the selector
    moduleBlueprint.intent = {
      description: `Provide ${options.selector} functionality`,
      tags: [options.selector],
    };

    // Add capabilities
    moduleBlueprint.capabilities = {};

    if (extractedCapability.capability) {
      // Direct capability extraction
      moduleBlueprint.capabilities[extractedCapability.capability] =
        extractedCapability.definition;
    } else if (extractedCapability.capabilities) {
      // Intent tag extraction
      moduleBlueprint.capabilities = { ...extractedCapability.capabilities };
    } else if (extractedCapability.function) {
      // Function extraction
      const capabilityName = extractedCapability.function;
      moduleBlueprint.capabilities[capabilityName] = {
        description: `Provides ${capabilityName} functionality`,
        tags: [options.selector],
      };
    } else if (extractedCapability.class) {
      // Class extraction
      const capabilityName = extractedCapability.class;
      moduleBlueprint.capabilities[capabilityName] = {
        description: `Provides ${capabilityName} class functionality`,
        tags: [options.selector],
      };
    }

    // Add refinement annotations
    moduleBlueprint.refinementAnnotations = {};

    if (extractedCapability.annotation) {
      // Direct function extraction
      moduleBlueprint.refinementAnnotations[extractedCapability.function] =
        extractedCapability.annotation;

      // Add dependencies
      if (extractedCapability.dependencies) {
        extractedCapability.dependencies.forEach((dep: any) => {
          moduleBlueprint.refinementAnnotations[dep.function] = dep.annotation;
        });
      }
    } else if (extractedCapability.refinementAnnotations) {
      // Intent tag or capability extraction
      moduleBlueprint.refinementAnnotations = {
        ...extractedCapability.refinementAnnotations,
      };
    } else if (extractedCapability.methods) {
      // Class extraction
      extractedCapability.methods.forEach((method: any) => {
        moduleBlueprint.refinementAnnotations[method.function] =
          method.annotation;
      });

      // Add dependencies
      if (extractedCapability.dependencies) {
        extractedCapability.dependencies.forEach((dep: any) => {
          moduleBlueprint.refinementAnnotations[dep.function] = dep.annotation;
        });
      }
    }

    // Add metadata
    if (options.includeMetadata) {
      moduleBlueprint.metadata = {
        extractedAt: new Date().toISOString(),
        extractedFrom: sourceBlueprint.id || 'unknown',
        extractionSelector: options.selector,
        extractionSelectorType: options.selectorType,
      };
    }

    // Add a minimal dominant sequence if needed
    if (Object.keys(moduleBlueprint.refinementAnnotations).length > 0) {
      moduleBlueprint.dominantSequence = {
        steps: [
          {
            description: `Execute ${options.selector} functionality`,
            implementation: Object.keys(
              moduleBlueprint.refinementAnnotations
            )[0],
          },
        ],
      };
    }

    return moduleBlueprint;
  }
}
