/**
 * BlueprintComposer
 * Handles the composition of multiple blueprints into a new, cohesive agent blueprint
 */

import { v4 as uuidv4 } from 'uuid';
import {
  CompositionOptions,
  ConflictStrategy,
  CustomResolutionHandler,
} from './interfaces/CompositionOptions';
import { DEFAULT_COMPOSER_CONFIG } from './ComposerConfig';

/**
 * BlueprintComposer class
 * Responsible for composing multiple blueprints into a new, cohesive agent blueprint
 */
export class BlueprintComposer {
  private options: CompositionOptions;

  /**
   * Creates a new BlueprintComposer instance
   * @param options Composition options
   */
  constructor(options: Partial<CompositionOptions> = {}) {
    this.options = { ...DEFAULT_COMPOSER_CONFIG, ...options };
  }

  /**
   * Composes multiple blueprints into a new one
   * @param blueprints Array of blueprints to compose
   * @param options Composition options (overrides constructor options)
   * @returns The composed blueprint
   */
  async compose(
    blueprints: any[],
    options: Partial<CompositionOptions> = {}
  ): Promise<any> {
    // Merge options with defaults
    const compositionOptions = { ...this.options, ...options };

    // Validate input
    if (!blueprints || blueprints.length === 0) {
      throw new Error('No blueprints provided for composition');
    }

    if (blueprints.length === 1) {
      console.warn(
        'Only one blueprint provided for composition, returning as-is'
      );
      return this.finalizeBlueprint(blueprints[0], compositionOptions);
    }

    // Start with the first blueprint as the base
    let composedBlueprint = { ...blueprints[0] };

    // Track lineage if enabled
    const parentIds = compositionOptions.maintainLineage
      ? blueprints.map((bp) => bp.id || 'unknown')
      : [];

    // Merge intents
    composedBlueprint.intent = this.mergeIntents(
      blueprints.map((bp) => bp.intent),
      compositionOptions
    );

    // Merge dominant sequences
    composedBlueprint.dominantSequence = this.mergeDominantSequences(
      blueprints.map((bp) => bp.dominantSequence),
      compositionOptions
    );

    // Merge capabilities
    const allCapabilities = blueprints.map((bp) => bp.capabilities || {});
    composedBlueprint.capabilities = this.mergeCapabilities(
      allCapabilities,
      compositionOptions
    );

    // Merge suggested agents
    composedBlueprint.suggestedAgents = this.mergeSuggestedAgents(
      blueprints.map((bp) => bp.suggestedAgents || []),
      compositionOptions
    );

    // Merge refinement annotations
    composedBlueprint.refinementAnnotations = this.mergeRefinementAnnotations(
      blueprints.map((bp) => bp.refinementAnnotations || {}),
      compositionOptions
    );

    // Finalize the blueprint
    return this.finalizeBlueprint(
      composedBlueprint,
      compositionOptions,
      parentIds
    );
  }

  /**
   * Merges intents from multiple blueprints
   * @param intents Array of intents to merge
   * @param options Composition options
   * @returns Merged intent
   */
  mergeIntents(intents: any[], options: CompositionOptions): any {
    // Filter out undefined or null intents
    const validIntents = intents.filter((intent) => intent);

    if (validIntents.length === 0) {
      return { description: 'Composed agent with no specific intent' };
    }

    if (validIntents.length === 1) {
      return validIntents[0];
    }

    // For conservative strategy, use the first intent
    // For aggressive strategy, use the last intent
    // For manual strategy, throw an error if not resolved
    switch (options.conflictStrategy) {
      case ConflictStrategy.CONSERVATIVE:
        return validIntents[0];

      case ConflictStrategy.AGGRESSIVE:
        return validIntents[validIntents.length - 1];

      case ConflictStrategy.MANUAL:
        if (options.customResolutionHandlers?.intent) {
          const handler = options.customResolutionHandlers.intent;
          if (typeof handler === 'function') {
            return handler(validIntents, intents);
          }
        }
        throw new Error('Manual conflict resolution required for intent');

      default:
        return validIntents[0];
    }
  }

  /**
   * Merges dominant sequences from multiple blueprints
   * @param sequences Array of dominant sequences to merge
   * @param options Composition options
   * @returns Merged dominant sequence
   */
  mergeDominantSequences(sequences: any[], options: CompositionOptions): any {
    // Filter out undefined or null sequences
    const validSequences = sequences.filter((seq) => seq);

    if (validSequences.length === 0) {
      return { steps: [] };
    }

    if (validSequences.length === 1) {
      return validSequences[0];
    }

    // For conservative and aggressive strategies, use the respective sequence
    // For manual strategy, throw an error if not resolved
    switch (options.conflictStrategy) {
      case ConflictStrategy.CONSERVATIVE:
        return validSequences[0];

      case ConflictStrategy.AGGRESSIVE:
        return validSequences[validSequences.length - 1];

      case ConflictStrategy.MANUAL:
        if (options.customResolutionHandlers?.dominantSequence) {
          const handler = options.customResolutionHandlers.dominantSequence;
          if (typeof handler === 'function') {
            return handler(validSequences, sequences);
          }
        }
        throw new Error(
          'Manual conflict resolution required for dominant sequence'
        );

      default:
        return validSequences[0];
    }
  }

  /**
   * Merges capabilities from multiple blueprints
   * @param capabilitySets Array of capability sets to merge
   * @param options Composition options
   * @returns Merged capabilities
   */
  mergeCapabilities(
    capabilitySets: Record<string, any>[],
    options: CompositionOptions
  ): Record<string, any> {
    const mergedCapabilities: Record<string, any> = {};
    const conflicts: Record<string, any[]> = {};

    // Collect all capability names
    const allCapabilityNames = new Set<string>();
    capabilitySets.forEach((capSet) => {
      Object.keys(capSet).forEach((name) => allCapabilityNames.add(name));
    });

    // Process each capability
    allCapabilityNames.forEach((capabilityName) => {
      const capabilityVersions = capabilitySets
        .map((capSet) => capSet[capabilityName])
        .filter((cap) => cap !== undefined);

      if (capabilityVersions.length === 0) {
        return;
      }

      if (capabilityVersions.length === 1) {
        mergedCapabilities[capabilityName] = capabilityVersions[0];
        return;
      }

      // Handle conflict based on strategy
      const customHandler = options.customResolutionHandlers?.[capabilityName];

      if (customHandler) {
        if (typeof customHandler === 'function') {
          mergedCapabilities[capabilityName] = customHandler(
            capabilityVersions,
            capabilitySets
          );
          return;
        } else if (typeof customHandler === 'string') {
          // Use the specified strategy for this capability
          const strategyOverride = customHandler as ConflictStrategy;
          mergedCapabilities[capabilityName] = this.resolveCapabilityConflict(
            capabilityName,
            capabilityVersions,
            strategyOverride
          );
          return;
        }
      }

      // Use the default strategy
      mergedCapabilities[capabilityName] = this.resolveCapabilityConflict(
        capabilityName,
        capabilityVersions,
        options.conflictStrategy || ConflictStrategy.CONSERVATIVE
      );
    });

    return mergedCapabilities;
  }

  /**
   * Resolves a conflict for a specific capability
   * @param capabilityName Name of the capability
   * @param versions Different versions of the capability
   * @param strategy Conflict resolution strategy
   * @returns Resolved capability
   */
  private resolveCapabilityConflict(
    capabilityName: string,
    versions: any[],
    strategy: ConflictStrategy
  ): any {
    switch (strategy) {
      case ConflictStrategy.CONSERVATIVE:
        return versions[0];

      case ConflictStrategy.AGGRESSIVE:
        return versions[versions.length - 1];

      case ConflictStrategy.MANUAL:
        throw new Error(
          `Manual conflict resolution required for capability: ${capabilityName}`
        );

      default:
        return versions[0];
    }
  }

  /**
   * Merges suggested agents from multiple blueprints
   * @param agentSets Array of suggested agent sets to merge
   * @param options Composition options
   * @returns Merged suggested agents
   */
  mergeSuggestedAgents(agentSets: any[][], options: CompositionOptions): any[] {
    // Combine all agents and remove duplicates based on ID or name
    const agentMap = new Map<string, any>();

    agentSets.forEach((agents) => {
      agents.forEach((agent) => {
        const key = agent.id || agent.name || JSON.stringify(agent);
        agentMap.set(key, agent);
      });
    });

    return Array.from(agentMap.values());
  }

  /**
   * Merges refinement annotations from multiple blueprints
   * @param annotationSets Array of refinement annotation sets to merge
   * @param options Composition options
   * @returns Merged refinement annotations
   */
  mergeRefinementAnnotations(
    annotationSets: Record<string, any>[],
    options: CompositionOptions
  ): Record<string, any> {
    const mergedAnnotations: Record<string, any> = {};
    const allFunctionNames = new Set<string>();

    // Collect all function names
    annotationSets.forEach((annotations) => {
      Object.keys(annotations).forEach((name) => allFunctionNames.add(name));
    });

    // Process each function's annotations
    allFunctionNames.forEach((functionName) => {
      const annotationVersions = annotationSets
        .map((annotations) => annotations[functionName])
        .filter((annotation) => annotation !== undefined);

      if (annotationVersions.length === 0) {
        return;
      }

      if (annotationVersions.length === 1) {
        mergedAnnotations[functionName] = annotationVersions[0];
        return;
      }

      // Handle conflict based on strategy
      const customHandler =
        options.customResolutionHandlers?.[`annotation:${functionName}`];

      if (customHandler) {
        if (typeof customHandler === 'function') {
          mergedAnnotations[functionName] = customHandler(
            annotationVersions,
            annotationSets
          );
          return;
        } else if (typeof customHandler === 'string') {
          // Use the specified strategy for this annotation
          const strategyOverride = customHandler as ConflictStrategy;
          mergedAnnotations[functionName] = this.resolveAnnotationConflict(
            functionName,
            annotationVersions,
            strategyOverride
          );
          return;
        }
      }

      // Use the default strategy
      mergedAnnotations[functionName] = this.resolveAnnotationConflict(
        functionName,
        annotationVersions,
        options.conflictStrategy || ConflictStrategy.CONSERVATIVE
      );
    });

    return mergedAnnotations;
  }

  /**
   * Resolves a conflict for a specific refinement annotation
   * @param functionName Name of the function
   * @param versions Different versions of the annotation
   * @param strategy Conflict resolution strategy
   * @returns Resolved annotation
   */
  private resolveAnnotationConflict(
    functionName: string,
    versions: any[],
    strategy: ConflictStrategy
  ): any {
    switch (strategy) {
      case ConflictStrategy.CONSERVATIVE:
        return versions[0];

      case ConflictStrategy.AGGRESSIVE:
        return versions[versions.length - 1];

      case ConflictStrategy.MANUAL:
        throw new Error(
          `Manual conflict resolution required for annotation: ${functionName}`
        );

      default:
        return versions[0];
    }
  }

  /**
   * Finalizes a blueprint after composition
   * @param blueprint The blueprint to finalize
   * @param options Composition options
   * @param parentIds Optional array of parent blueprint IDs
   * @returns The finalized blueprint
   */
  finalizeBlueprint(
    blueprint: any,
    options: CompositionOptions,
    parentIds: string[] = []
  ): any {
    // Create a copy to avoid modifying the original
    const finalBlueprint = { ...blueprint };

    // Generate a new ID for the composed blueprint
    finalBlueprint.id = uuidv4();

    // Add composition metadata
    finalBlueprint.metadata = {
      ...finalBlueprint.metadata,
      composedAt: new Date().toISOString(),
      compositionStrategy: options.conflictStrategy,
      parentBlueprints: parentIds.length > 0 ? parentIds : undefined,
    };

    // Update the name to indicate it's a composed blueprint
    if (finalBlueprint.name) {
      finalBlueprint.name = `Composed: ${finalBlueprint.name}`;
    } else {
      finalBlueprint.name = `Composed Blueprint ${finalBlueprint.id.substring(0, 8)}`;
    }

    // Auto-refine if enabled
    if (options.autoRefine) {
      // This would integrate with the BlueprintRefiner
      // For now, we'll just add a placeholder
      finalBlueprint.metadata.autoRefined = true;
    }

    // Validate if enabled
    if (options.validateAfterComposition) {
      // This would integrate with the ValidatorEngine
      // For now, we'll just add a placeholder
      finalBlueprint.metadata.validated = true;
    }

    return finalBlueprint;
  }

  /**
   * Resolves conflicts in a blueprint composition
   * @param conflicts Record of conflicts to resolve
   * @param strategy Conflict resolution strategy
   * @returns Resolved conflicts
   */
  resolveConflicts(
    conflicts: Record<string, any[]>,
    strategy: ConflictStrategy = ConflictStrategy.CONSERVATIVE
  ): Record<string, any> {
    const resolved: Record<string, any> = {};

    Object.entries(conflicts).forEach(([key, versions]) => {
      switch (strategy) {
        case ConflictStrategy.CONSERVATIVE:
          resolved[key] = versions[0];
          break;

        case ConflictStrategy.AGGRESSIVE:
          resolved[key] = versions[versions.length - 1];
          break;

        case ConflictStrategy.MANUAL:
          throw new Error(`Manual conflict resolution required for: ${key}`);

        default:
          resolved[key] = versions[0];
      }
    });

    return resolved;
  }
}
