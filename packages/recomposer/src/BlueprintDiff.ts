/**
 * BlueprintDiff
 * Compares original and recomposed blueprints for auditing and cognitive tracing
 */

import {
  DiffResult,
  CapabilityChange,
  ChangeType,
} from './interfaces/DiffResult';

/**
 * BlueprintDiff class
 * Responsible for comparing original and recomposed blueprints
 */
export class BlueprintDiff {
  private originalBlueprint: any;
  private recomposedBlueprint: any;
  private diffResult: DiffResult;

  /**
   * Creates a new BlueprintDiff instance
   * @param original The original blueprint
   * @param recomposed The recomposed blueprint
   */
  constructor(original: any, recomposed: any) {
    this.originalBlueprint = original;
    this.recomposedBlueprint = recomposed;

    // Initialize the diff result
    this.diffResult = {
      originalId: original.id || 'unknown',
      recomposedId: recomposed.id || 'unknown',
      intentChanges: [],
      dominantSequenceChanges: [],
      capabilityChanges: {},
      suggestedAgentChanges: [],
      refinementAnnotationChanges: [],
      similarityScore: 0,
      timestamp: new Date().toISOString(),
    };

    // Perform the diff
    this.performDiff();
  }

  /**
   * Static method to compare two blueprints
   * @param original The original blueprint
   * @param recomposed The recomposed blueprint
   * @returns A new BlueprintDiff instance
   */
  static compare(original: any, recomposed: any): BlueprintDiff {
    return new BlueprintDiff(original, recomposed);
  }

  /**
   * Gets the diff result
   * @returns The diff result
   */
  getDiffResult(): DiffResult {
    return this.diffResult;
  }

  /**
   * Performs the diff between the original and recomposed blueprints
   */
  private performDiff(): void {
    // Diff intent
    this.diffIntent();

    // Diff dominant sequence
    this.diffDominantSequence();

    // Diff capabilities
    this.diffCapabilities();

    // Diff suggested agents
    this.diffSuggestedAgents();

    // Diff refinement annotations
    this.diffRefinementAnnotations();

    // Calculate similarity score
    this.calculateSimilarityScore();
  }

  /**
   * Diffs the intent between the original and recomposed blueprints
   */
  private diffIntent(): void {
    const original = this.originalBlueprint.intent || {};
    const recomposed = this.recomposedBlueprint.intent || {};

    // Compare description
    if (original.description !== recomposed.description) {
      this.diffResult.intentChanges.push({
        type: recomposed.description
          ? original.description
            ? ChangeType.MODIFIED
            : ChangeType.ADDED
          : ChangeType.REMOVED,
        path: 'intent.description',
        originalValue: original.description,
        newValue: recomposed.description,
        importance: 0.8,
      });
    }

    // Compare tags
    const originalTags = original.tags || [];
    const recomposedTags = recomposed.tags || [];

    // Find added tags
    recomposedTags.forEach((tag: string) => {
      if (!originalTags.includes(tag)) {
        this.diffResult.intentChanges.push({
          type: ChangeType.ADDED,
          path: `intent.tags[${tag}]`,
          newValue: tag,
          importance: 0.5,
        });
      }
    });

    // Find removed tags
    originalTags.forEach((tag: string) => {
      if (!recomposedTags.includes(tag)) {
        this.diffResult.intentChanges.push({
          type: ChangeType.REMOVED,
          path: `intent.tags[${tag}]`,
          originalValue: tag,
          importance: 0.5,
        });
      }
    });
  }

  /**
   * Diffs the dominant sequence between the original and recomposed blueprints
   */
  private diffDominantSequence(): void {
    const original = this.originalBlueprint.dominantSequence || { steps: [] };
    const recomposed = this.recomposedBlueprint.dominantSequence || {
      steps: [],
    };

    const originalSteps = original.steps || [];
    const recomposedSteps = recomposed.steps || [];

    // Compare step count
    if (originalSteps.length !== recomposedSteps.length) {
      this.diffResult.dominantSequenceChanges.push({
        type:
          originalSteps.length < recomposedSteps.length
            ? ChangeType.ADDED
            : ChangeType.REMOVED,
        path: 'dominantSequence.steps.length',
        originalValue: originalSteps.length,
        newValue: recomposedSteps.length,
        importance: 0.7,
      });
    }

    // Compare individual steps
    const maxSteps = Math.max(originalSteps.length, recomposedSteps.length);

    for (let i = 0; i < maxSteps; i++) {
      const originalStep = i < originalSteps.length ? originalSteps[i] : null;
      const recomposedStep =
        i < recomposedSteps.length ? recomposedSteps[i] : null;

      if (!originalStep && recomposedStep) {
        // Step added
        this.diffResult.dominantSequenceChanges.push({
          type: ChangeType.ADDED,
          path: `dominantSequence.steps[${i}]`,
          newValue: recomposedStep,
          importance: 0.6,
        });
      } else if (originalStep && !recomposedStep) {
        // Step removed
        this.diffResult.dominantSequenceChanges.push({
          type: ChangeType.REMOVED,
          path: `dominantSequence.steps[${i}]`,
          originalValue: originalStep,
          importance: 0.6,
        });
      } else if (originalStep && recomposedStep) {
        // Compare step properties
        if (originalStep.description !== recomposedStep.description) {
          this.diffResult.dominantSequenceChanges.push({
            type: ChangeType.MODIFIED,
            path: `dominantSequence.steps[${i}].description`,
            originalValue: originalStep.description,
            newValue: recomposedStep.description,
            importance: 0.4,
          });
        }

        if (originalStep.implementation !== recomposedStep.implementation) {
          this.diffResult.dominantSequenceChanges.push({
            type: ChangeType.MODIFIED,
            path: `dominantSequence.steps[${i}].implementation`,
            originalValue: originalStep.implementation,
            newValue: recomposedStep.implementation,
            importance: 0.7,
          });
        }
      }
    }
  }

  /**
   * Diffs the capabilities between the original and recomposed blueprints
   */
  private diffCapabilities(): void {
    const original = this.originalBlueprint.capabilities || {};
    const recomposed = this.recomposedBlueprint.capabilities || {};

    // Get all capability names
    const allCapabilityNames = new Set<string>([
      ...Object.keys(original),
      ...Object.keys(recomposed),
    ]);

    // Compare each capability
    allCapabilityNames.forEach((name) => {
      const originalCapability = original[name];
      const recomposedCapability = recomposed[name];

      // Initialize capability changes array
      this.diffResult.capabilityChanges[name] = [];

      if (!originalCapability && recomposedCapability) {
        // Capability added
        this.diffResult.capabilityChanges[name].push({
          type: ChangeType.ADDED,
          path: `capabilities.${name}`,
          newValue: recomposedCapability,
          importance: 0.8,
        });
      } else if (originalCapability && !recomposedCapability) {
        // Capability removed
        this.diffResult.capabilityChanges[name].push({
          type: ChangeType.REMOVED,
          path: `capabilities.${name}`,
          originalValue: originalCapability,
          importance: 0.8,
        });
      } else if (originalCapability && recomposedCapability) {
        // Compare capability properties
        this.diffCapabilityProperties(
          name,
          originalCapability,
          recomposedCapability
        );
      }

      // Remove empty capability changes
      if (this.diffResult.capabilityChanges[name].length === 0) {
        delete this.diffResult.capabilityChanges[name];
      }
    });
  }

  /**
   * Diffs the properties of a capability
   * @param name The name of the capability
   * @param original The original capability
   * @param recomposed The recomposed capability
   */
  private diffCapabilityProperties(
    name: string,
    original: any,
    recomposed: any
  ): void {
    // Compare description
    if (original.description !== recomposed.description) {
      this.diffResult.capabilityChanges[name].push({
        type: ChangeType.MODIFIED,
        path: `capabilities.${name}.description`,
        originalValue: original.description,
        newValue: recomposed.description,
        importance: 0.5,
      });
    }

    // Compare tags
    const originalTags = original.tags || [];
    const recomposedTags = recomposed.tags || [];

    // Find added tags
    recomposedTags.forEach((tag: string) => {
      if (!originalTags.includes(tag)) {
        this.diffResult.capabilityChanges[name].push({
          type: ChangeType.ADDED,
          path: `capabilities.${name}.tags[${tag}]`,
          newValue: tag,
          importance: 0.3,
        });
      }
    });

    // Find removed tags
    originalTags.forEach((tag: string) => {
      if (!recomposedTags.includes(tag)) {
        this.diffResult.capabilityChanges[name].push({
          type: ChangeType.REMOVED,
          path: `capabilities.${name}.tags[${tag}]`,
          originalValue: tag,
          importance: 0.3,
        });
      }
    });

    // Compare other properties
    const allPropertyNames = new Set<string>([
      ...Object.keys(original),
      ...Object.keys(recomposed),
    ]);

    allPropertyNames.forEach((prop) => {
      if (prop !== 'description' && prop !== 'tags') {
        const originalValue = original[prop];
        const recomposedValue = recomposed[prop];

        // Simple comparison for primitive values
        if (
          typeof originalValue !== 'object' &&
          typeof recomposedValue !== 'object'
        ) {
          if (originalValue !== recomposedValue) {
            this.diffResult.capabilityChanges[name].push({
              type:
                recomposedValue !== undefined
                  ? originalValue !== undefined
                    ? ChangeType.MODIFIED
                    : ChangeType.ADDED
                  : ChangeType.REMOVED,
              path: `capabilities.${name}.${prop}`,
              originalValue,
              newValue: recomposedValue,
              importance: 0.4,
            });
          }
        }
        // For objects, we could implement a deep comparison if needed
      }
    });
  }

  /**
   * Diffs the suggested agents between the original and recomposed blueprints
   */
  private diffSuggestedAgents(): void {
    const original = this.originalBlueprint.suggestedAgents || [];
    const recomposed = this.recomposedBlueprint.suggestedAgents || [];

    // Create maps for easier comparison
    const originalMap = new Map<string, any>();
    const recomposedMap = new Map<string, any>();

    original.forEach((agent: any) => {
      const key = agent.id || agent.name || JSON.stringify(agent);
      originalMap.set(key, agent);
    });

    recomposed.forEach((agent: any) => {
      const key = agent.id || agent.name || JSON.stringify(agent);
      recomposedMap.set(key, agent);
    });

    // Find added agents
    recomposedMap.forEach((agent, key) => {
      if (!originalMap.has(key)) {
        this.diffResult.suggestedAgentChanges.push({
          type: ChangeType.ADDED,
          path: `suggestedAgents[${key}]`,
          newValue: agent,
          importance: 0.6,
        });
      }
    });

    // Find removed agents
    originalMap.forEach((agent, key) => {
      if (!recomposedMap.has(key)) {
        this.diffResult.suggestedAgentChanges.push({
          type: ChangeType.REMOVED,
          path: `suggestedAgents[${key}]`,
          originalValue: agent,
          importance: 0.6,
        });
      }
    });

    // For agents that exist in both, we could implement a detailed comparison if needed
  }

  /**
   * Diffs the refinement annotations between the original and recomposed blueprints
   */
  private diffRefinementAnnotations(): void {
    const original = this.originalBlueprint.refinementAnnotations || {};
    const recomposed = this.recomposedBlueprint.refinementAnnotations || {};

    // Get all function names
    const allFunctionNames = new Set<string>([
      ...Object.keys(original),
      ...Object.keys(recomposed),
    ]);

    // Compare each function's annotations
    allFunctionNames.forEach((name) => {
      const originalAnnotation = original[name];
      const recomposedAnnotation = recomposed[name];

      if (!originalAnnotation && recomposedAnnotation) {
        // Annotation added
        this.diffResult.refinementAnnotationChanges.push({
          type: ChangeType.ADDED,
          path: `refinementAnnotations.${name}`,
          newValue: recomposedAnnotation,
          importance: 0.7,
        });
      } else if (originalAnnotation && !recomposedAnnotation) {
        // Annotation removed
        this.diffResult.refinementAnnotationChanges.push({
          type: ChangeType.REMOVED,
          path: `refinementAnnotations.${name}`,
          originalValue: originalAnnotation,
          importance: 0.7,
        });
      } else if (originalAnnotation && recomposedAnnotation) {
        // Compare annotation properties
        this.diffAnnotationProperties(
          name,
          originalAnnotation,
          recomposedAnnotation
        );
      }
    });
  }

  /**
   * Diffs the properties of a refinement annotation
   * @param name The name of the function
   * @param original The original annotation
   * @param recomposed The recomposed annotation
   */
  private diffAnnotationProperties(
    name: string,
    original: any,
    recomposed: any
  ): void {
    // Compare preconditions
    this.diffConditions(
      name,
      'preconditions',
      original.preconditions || [],
      recomposed.preconditions || []
    );

    // Compare postconditions
    this.diffConditions(
      name,
      'postconditions',
      original.postconditions || [],
      recomposed.postconditions || []
    );

    // Compare implementation
    if (original.implementation !== recomposed.implementation) {
      this.diffResult.refinementAnnotationChanges.push({
        type: ChangeType.MODIFIED,
        path: `refinementAnnotations.${name}.implementation`,
        originalValue: original.implementation,
        newValue: recomposed.implementation,
        importance: 0.9,
      });
    }

    // Compare other properties
    const allPropertyNames = new Set<string>([
      ...Object.keys(original),
      ...Object.keys(recomposed),
    ]);

    allPropertyNames.forEach((prop) => {
      if (
        prop !== 'preconditions' &&
        prop !== 'postconditions' &&
        prop !== 'implementation'
      ) {
        const originalValue = original[prop];
        const recomposedValue = recomposed[prop];

        // Simple comparison for primitive values
        if (
          typeof originalValue !== 'object' &&
          typeof recomposedValue !== 'object'
        ) {
          if (originalValue !== recomposedValue) {
            this.diffResult.refinementAnnotationChanges.push({
              type:
                recomposedValue !== undefined
                  ? originalValue !== undefined
                    ? ChangeType.MODIFIED
                    : ChangeType.ADDED
                  : ChangeType.REMOVED,
              path: `refinementAnnotations.${name}.${prop}`,
              originalValue,
              newValue: recomposedValue,
              importance: 0.5,
            });
          }
        }
        // For objects, we could implement a deep comparison if needed
      }
    });
  }

  /**
   * Diffs conditions (preconditions or postconditions) of a refinement annotation
   * @param name The name of the function
   * @param conditionType The type of condition ('preconditions' or 'postconditions')
   * @param original The original conditions
   * @param recomposed The recomposed conditions
   */
  private diffConditions(
    name: string,
    conditionType: string,
    original: string[],
    recomposed: string[]
  ): void {
    // Find added conditions
    recomposed.forEach((condition, index) => {
      if (!original.includes(condition)) {
        this.diffResult.refinementAnnotationChanges.push({
          type: ChangeType.ADDED,
          path: `refinementAnnotations.${name}.${conditionType}[${index}]`,
          newValue: condition,
          importance: 0.6,
        });
      }
    });

    // Find removed conditions
    original.forEach((condition, index) => {
      if (!recomposed.includes(condition)) {
        this.diffResult.refinementAnnotationChanges.push({
          type: ChangeType.REMOVED,
          path: `refinementAnnotations.${name}.${conditionType}[${index}]`,
          originalValue: condition,
          importance: 0.6,
        });
      }
    });
  }

  /**
   * Calculates the similarity score between the original and recomposed blueprints
   */
  private calculateSimilarityScore(): void {
    // Count the total number of changes
    const totalChanges =
      this.diffResult.intentChanges.length +
      this.diffResult.dominantSequenceChanges.length +
      Object.values(this.diffResult.capabilityChanges).reduce(
        (sum, changes) => sum + changes.length,
        0
      ) +
      this.diffResult.suggestedAgentChanges.length +
      this.diffResult.refinementAnnotationChanges.length;

    // Count the total number of elements
    const originalElements = this.countBlueprintElements(
      this.originalBlueprint
    );
    const recomposedElements = this.countBlueprintElements(
      this.recomposedBlueprint
    );
    const totalElements = Math.max(originalElements, recomposedElements);

    // Calculate the similarity score
    if (totalElements === 0) {
      this.diffResult.similarityScore = 1; // Both blueprints are empty
    } else {
      const unchangedElements = totalElements - totalChanges;
      this.diffResult.similarityScore = Math.max(
        0,
        Math.min(1, unchangedElements / totalElements)
      );
    }
  }

  /**
   * Counts the number of elements in a blueprint
   * @param blueprint The blueprint to count elements in
   * @returns The number of elements
   */
  private countBlueprintElements(blueprint: any): number {
    let count = 0;

    // Count intent elements
    const intent = blueprint.intent || {};
    count += 1; // For the description
    count += (intent.tags || []).length;

    // Count dominant sequence steps
    const dominantSequence = blueprint.dominantSequence || { steps: [] };
    count += (dominantSequence.steps || []).length * 2; // Each step has description and implementation

    // Count capabilities
    const capabilities = blueprint.capabilities || {};
    Object.values(capabilities).forEach((capability: any) => {
      count += 1; // For the description
      count += (capability.tags || []).length;
      // Count other properties
      count += Object.keys(capability).filter(
        (key) => key !== 'description' && key !== 'tags'
      ).length;
    });

    // Count suggested agents
    count += (blueprint.suggestedAgents || []).length;

    // Count refinement annotations
    const refinementAnnotations = blueprint.refinementAnnotations || {};
    Object.values(refinementAnnotations).forEach((annotation: any) => {
      count += (annotation.preconditions || []).length;
      count += (annotation.postconditions || []).length;
      count += annotation.implementation ? 1 : 0;
      // Count other properties
      count += Object.keys(annotation).filter(
        (key) =>
          key !== 'preconditions' &&
          key !== 'postconditions' &&
          key !== 'implementation'
      ).length;
    });

    return count;
  }

  /**
   * Generates a narrative of the changes between the original and recomposed blueprints
   * @returns A narrative string describing the changes
   */
  generateNarrative(): string {
    const changes = [];

    // Add intent changes
    if (this.diffResult.intentChanges.length > 0) {
      changes.push(this.generateIntentNarrative());
    }

    // Add dominant sequence changes
    if (this.diffResult.dominantSequenceChanges.length > 0) {
      changes.push(this.generateDominantSequenceNarrative());
    }

    // Add capability changes
    const capabilityChangesCount = Object.values(
      this.diffResult.capabilityChanges
    ).reduce((sum, changes) => sum + changes.length, 0);

    if (capabilityChangesCount > 0) {
      changes.push(this.generateCapabilitiesNarrative());
    }

    // Add suggested agent changes
    if (this.diffResult.suggestedAgentChanges.length > 0) {
      changes.push(this.generateSuggestedAgentsNarrative());
    }

    // Add refinement annotation changes
    if (this.diffResult.refinementAnnotationChanges.length > 0) {
      changes.push(this.generateRefinementAnnotationsNarrative());
    }

    // Generate the overall narrative
    const similarityPercentage = Math.round(
      this.diffResult.similarityScore * 100
    );

    let narrative = `Blueprint Composition Diff (${similarityPercentage}% similarity)\n`;
    narrative += `Original: ${this.diffResult.originalId}\n`;
    narrative += `Recomposed: ${this.diffResult.recomposedId}\n\n`;

    if (changes.length > 0) {
      narrative += changes.join('\n\n');
    } else {
      narrative += 'No significant changes detected between the blueprints.';
    }

    return narrative;
  }

  /**
   * Generates a narrative of the intent changes
   * @returns A narrative string describing the intent changes
   */
  private generateIntentNarrative(): string {
    let narrative = 'Intent Changes:\n';

    this.diffResult.intentChanges.forEach((change) => {
      switch (change.type) {
        case ChangeType.ADDED:
          narrative += `- Added ${change.path}: ${JSON.stringify(change.newValue)}\n`;
          break;

        case ChangeType.REMOVED:
          narrative += `- Removed ${change.path}: ${JSON.stringify(change.originalValue)}\n`;
          break;

        case ChangeType.MODIFIED:
          narrative += `- Modified ${change.path}:\n`;
          narrative += `  From: ${JSON.stringify(change.originalValue)}\n`;
          narrative += `  To: ${JSON.stringify(change.newValue)}\n`;
          break;
      }
    });

    return narrative;
  }

  /**
   * Generates a narrative of the dominant sequence changes
   * @returns A narrative string describing the dominant sequence changes
   */
  private generateDominantSequenceNarrative(): string {
    let narrative = 'Dominant Sequence Changes:\n';

    // Group changes by step index for better readability
    const stepChanges: Record<number, CapabilityChange[]> = {};

    this.diffResult.dominantSequenceChanges.forEach((change) => {
      const match = change.path.match(/dominantSequence\.steps\[(\d+)\]/);

      if (match) {
        const stepIndex = parseInt(match[1]);
        stepChanges[stepIndex] = stepChanges[stepIndex] || [];
        stepChanges[stepIndex].push(change);
      } else {
        // Handle changes to the entire steps array
        narrative += `- ${change.type} ${change.path}: `;
        narrative += `${change.originalValue} -> ${change.newValue}\n`;
      }
    });

    // Process step changes
    Object.entries(stepChanges).forEach(([stepIndex, changes]) => {
      narrative += `- Step ${stepIndex}:\n`;

      changes.forEach((change) => {
        switch (change.type) {
          case ChangeType.ADDED:
            if (change.path.endsWith(`[${stepIndex}]`)) {
              narrative += `  Added new step\n`;
            } else {
              const property = change.path.split('.').pop();
              narrative += `  Added ${property}: ${JSON.stringify(change.newValue)}\n`;
            }
            break;

          case ChangeType.REMOVED:
            if (change.path.endsWith(`[${stepIndex}]`)) {
              narrative += `  Removed step\n`;
            } else {
              const property = change.path.split('.').pop();
              narrative += `  Removed ${property}: ${JSON.stringify(change.originalValue)}\n`;
            }
            break;

          case ChangeType.MODIFIED:
            const property = change.path.split('.').pop();
            narrative += `  Modified ${property}:\n`;
            narrative += `    From: ${JSON.stringify(change.originalValue)}\n`;
            narrative += `    To: ${JSON.stringify(change.newValue)}\n`;
            break;
        }
      });
    });

    return narrative;
  }

  /**
   * Generates a narrative of the capability changes
   * @returns A narrative string describing the capability changes
   */
  private generateCapabilitiesNarrative(): string {
    let narrative = 'Capability Changes:\n';

    Object.entries(this.diffResult.capabilityChanges).forEach(
      ([capabilityName, changes]) => {
        narrative += `- ${capabilityName}:\n`;

        changes.forEach((change) => {
          switch (change.type) {
            case ChangeType.ADDED:
              if (change.path === `capabilities.${capabilityName}`) {
                narrative += `  Added new capability\n`;
              } else {
                const property = change.path.split('.').pop();
                narrative += `  Added ${property}: ${JSON.stringify(change.newValue)}\n`;
              }
              break;

            case ChangeType.REMOVED:
              if (change.path === `capabilities.${capabilityName}`) {
                narrative += `  Removed capability\n`;
              } else {
                const property = change.path.split('.').pop();
                narrative += `  Removed ${property}: ${JSON.stringify(change.originalValue)}\n`;
              }
              break;

            case ChangeType.MODIFIED:
              const property = change.path.split('.').pop();
              narrative += `  Modified ${property}:\n`;
              narrative += `    From: ${JSON.stringify(change.originalValue)}\n`;
              narrative += `    To: ${JSON.stringify(change.newValue)}\n`;
              break;
          }
        });
      }
    );

    return narrative;
  }

  /**
   * Generates a narrative of the suggested agent changes
   * @returns A narrative string describing the suggested agent changes
   */
  private generateSuggestedAgentsNarrative(): string {
    let narrative = 'Suggested Agent Changes:\n';

    this.diffResult.suggestedAgentChanges.forEach((change) => {
      switch (change.type) {
        case ChangeType.ADDED:
          const addedAgent = change.newValue;
          const addedName = addedAgent.name || addedAgent.id || 'Unknown';
          narrative += `- Added agent: ${addedName}\n`;
          break;

        case ChangeType.REMOVED:
          const removedAgent = change.originalValue;
          const removedName = removedAgent.name || removedAgent.id || 'Unknown';
          narrative += `- Removed agent: ${removedName}\n`;
          break;
      }
    });

    return narrative;
  }

  /**
   * Generates a narrative of the refinement annotation changes
   * @returns A narrative string describing the refinement annotation changes
   */
  private generateRefinementAnnotationsNarrative(): string {
    let narrative = 'Refinement Annotation Changes:\n';

    // Group changes by function name for better readability
    const functionChanges: Record<string, CapabilityChange[]> = {};

    this.diffResult.refinementAnnotationChanges.forEach((change) => {
      const match = change.path.match(/refinementAnnotations\.([^.\[]+)/);

      if (match) {
        const functionName = match[1];
        functionChanges[functionName] = functionChanges[functionName] || [];
        functionChanges[functionName].push(change);
      }
    });

    // Process function changes
    Object.entries(functionChanges).forEach(([functionName, changes]) => {
      narrative += `- ${functionName}:\n`;

      changes.forEach((change) => {
        switch (change.type) {
          case ChangeType.ADDED:
            if (change.path === `refinementAnnotations.${functionName}`) {
              narrative += `  Added new annotation\n`;
            } else if (change.path.includes('preconditions')) {
              narrative += `  Added precondition: ${JSON.stringify(change.newValue)}\n`;
            } else if (change.path.includes('postconditions')) {
              narrative += `  Added postcondition: ${JSON.stringify(change.newValue)}\n`;
            } else {
              const property = change.path.split('.').pop();
              narrative += `  Added ${property}: ${JSON.stringify(change.newValue)}\n`;
            }
            break;

          case ChangeType.REMOVED:
            if (change.path === `refinementAnnotations.${functionName}`) {
              narrative += `  Removed annotation\n`;
            } else if (change.path.includes('preconditions')) {
              narrative += `  Removed precondition: ${JSON.stringify(change.originalValue)}\n`;
            } else if (change.path.includes('postconditions')) {
              narrative += `  Removed postcondition: ${JSON.stringify(change.originalValue)}\n`;
            } else {
              const property = change.path.split('.').pop();
              narrative += `  Removed ${property}: ${JSON.stringify(change.originalValue)}\n`;
            }
            break;

          case ChangeType.MODIFIED:
            if (change.path.endsWith('implementation')) {
              narrative += `  Modified implementation\n`;
            } else {
              const property = change.path.split('.').pop();
              narrative += `  Modified ${property}:\n`;
              narrative += `    From: ${JSON.stringify(change.originalValue)}\n`;
              narrative += `    To: ${JSON.stringify(change.newValue)}\n`;
            }
            break;
        }
      });
    });

    return narrative;
  }

  /**
   * Gets changes for a specific capability
   * @param capability The name of the capability
   * @returns Array of changes for the capability
   */
  getCapabilityChanges(capability: string): CapabilityChange[] {
    return this.diffResult.capabilityChanges[capability] || [];
  }
}
