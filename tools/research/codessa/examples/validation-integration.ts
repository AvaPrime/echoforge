/**
 * validation-integration.ts
 * Example of integrating the Blueprint Test Validator Engine with the BlueprintRefiner.
 */

import { ValidatorEngine } from '../core/validation/ValidatorEngine';
import { ValidationStatus } from '../core/validation/interfaces/ValidationResult';

// Assuming BlueprintRefiner is implemented in the codebase
interface BlueprintRefiner {
  refineBlueprint(blueprint: any): Promise<any>;
}

/**
 * Refines and validates a blueprint
 * @param blueprint The blueprint to refine and validate
 * @param refiner The BlueprintRefiner instance
 * @returns The refined and validated blueprint, or null if validation failed
 */
async function refineAndValidateBlueprint(
  blueprint: any,
  refiner: BlueprintRefiner
): Promise<any | null> {
  console.log(`Refining and validating blueprint: ${blueprint.name}`);

  // Step 1: Refine the blueprint
  console.log('Refining blueprint...');
  const refinedBlueprint = await refiner.refineBlueprint(blueprint);
  console.log('Blueprint refined successfully.');

  // Step 2: Validate the refined blueprint
  console.log('Validating refined blueprint...');
  const validator = ValidatorEngine.createHeadless({
    continueOnFailure: true,
    storeInReflexiveMemory: true,
  });

  const validationResult = await validator.validateBlueprint(refinedBlueprint);

  // Step 3: Check validation result
  if (validationResult.status === ValidationStatus.PASSED) {
    console.log('Blueprint validation passed!');
    console.log(`Passed ${validationResult.summary.passed} assertions.`);
    return refinedBlueprint;
  } else {
    console.error('Blueprint validation failed!');
    console.error(
      `Failed ${validationResult.summary.failed} assertions, ${validationResult.summary.errors} errors.`
    );

    // Log detailed assertion failures
    const failures = validationResult.assertionResults.filter(
      (result) =>
        result.status === ValidationStatus.FAILED ||
        result.status === ValidationStatus.ERROR
    );

    for (const failure of failures) {
      console.error(`- [${failure.status}] ${failure.assertion.description}`);
      console.error(`  Target Function: ${failure.assertion.targetFunction}`);
      console.error(
        `  Expected: ${JSON.stringify(failure.assertion.expectedOutcome)}`
      );
      console.error(`  Actual: ${JSON.stringify(failure.actualOutcome)}`);
      if (failure.errorMessage) {
        console.error(`  Error: ${failure.errorMessage}`);
      }
    }

    return null;
  }
}

/**
 * Example usage
 */
async function example() {
  // Load a blueprint
  const blueprint = require('./blueprints/DataHarvesterAgent.json');

  // Create a mock BlueprintRefiner
  const mockRefiner: BlueprintRefiner = {
    refineBlueprint: async (bp) => {
      // In a real implementation, this would call the actual BlueprintRefiner
      // For this example, we'll just return the blueprint with a small modification
      return {
        ...bp,
        refinementAnnotations: {
          ...bp.refinementAnnotations,
          // Add a new refinement annotation
          validateOutput: {
            description: 'Validates the transformed data against schema',
            preconditions: ['Input must be transformed data'],
            postconditions: ['Returns validation result with status'],
            examples: [
              {
                input: { data: { processed: { formatted: '42' } } },
                output: { valid: true, errors: [] },
              },
            ],
          },
        },
      };
    },
  };

  // Refine and validate the blueprint
  const validatedBlueprint = await refineAndValidateBlueprint(
    blueprint,
    mockRefiner
  );

  if (validatedBlueprint) {
    console.log('Blueprint is ready for deployment!');
    // In a real implementation, this would proceed to deploy the agent
  } else {
    console.log('Blueprint requires further refinement before deployment.');
    // In a real implementation, this would trigger a refinement loop
  }
}

// Run the example
example().catch((error) => {
  console.error('Error:', error);
});
