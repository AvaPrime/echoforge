/**
 * validate.ts
 * CLI command for validating blueprints using the Blueprint Test Validator Engine.
 */

import { Command } from 'commander';
import { ValidatorEngine } from '../../core/validation/ValidatorEngine';
import {
  ValidatorOptions,
  ValidationMode,
  ValidationLevel,
} from '../../core/validation/interfaces/ValidatorOptions';
import { ValidationStatus } from '../../core/validation/interfaces/ValidationResult';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

interface Blueprint {
  id: string;
  name: string;
  intent: string;
  dominantSequence?: string[];
  suggestedAgents?: string[];
  refinementAnnotations?: Record<string, any>;
  // Other blueprint properties
}

/**
 * Loads a blueprint from a file
 * @param blueprintPath Path to the blueprint file
 * @returns The loaded blueprint
 */
async function loadBlueprint(blueprintPath: string): Promise<Blueprint> {
  try {
    const fullPath = path.resolve(blueprintPath);
    const content = await fs.promises.readFile(fullPath, 'utf-8');
    return JSON.parse(content) as Blueprint;
  } catch (error) {
    throw new Error(
      `Failed to load blueprint: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Loads all blueprints from a directory
 * @param directoryPath Path to the directory containing blueprints
 * @returns Array of loaded blueprints
 */
async function loadBlueprintsFromDirectory(
  directoryPath: string
): Promise<Blueprint[]> {
  try {
    const fullPath = path.resolve(directoryPath);
    const files = await fs.promises.readdir(fullPath);
    const blueprints: Blueprint[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(fullPath, file);
        try {
          const blueprint = await loadBlueprint(filePath);
          blueprints.push(blueprint);
        } catch (error) {
          console.warn(
            `Skipping invalid blueprint file ${file}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    return blueprints;
  } catch (error) {
    throw new Error(
      `Failed to load blueprints from directory: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Formats and displays validation results
 * @param results Validation results to display
 */
function displayResults(results: any[]) {
  for (const result of results) {
    console.log('\n' + chalk.bold('='.repeat(50)));
    console.log(chalk.bold(`Blueprint: ${result.blueprintId}`));
    console.log(chalk.bold('='.repeat(50)));

    // Display overall status
    let statusColor;
    switch (result.status) {
      case ValidationStatus.PASSED:
        statusColor = chalk.green;
        break;
      case ValidationStatus.FAILED:
        statusColor = chalk.red;
        break;
      case ValidationStatus.ERROR:
        statusColor = chalk.red;
        break;
      case ValidationStatus.WARNING:
        statusColor = chalk.yellow;
        break;
      case ValidationStatus.SKIPPED:
        statusColor = chalk.gray;
        break;
      default:
        statusColor = chalk.white;
    }

    console.log(statusColor(`Status: ${result.status}`));

    // Display summary
    console.log(chalk.bold('\nSummary:'));
    console.log(`Total: ${result.summary.total}`);
    console.log(chalk.green(`Passed: ${result.summary.passed}`));
    console.log(chalk.red(`Failed: ${result.summary.failed}`));
    console.log(chalk.red(`Errors: ${result.summary.errors}`));
    console.log(chalk.yellow(`Warnings: ${result.summary.warnings}`));
    console.log(chalk.gray(`Skipped: ${result.summary.skipped}`));

    // Display execution time
    console.log(chalk.bold('\nExecution Time:'));
    console.log(`${result.executionTime}ms`);

    // Display assertion results
    if (result.assertionResults && result.assertionResults.length > 0) {
      console.log(chalk.bold('\nAssertion Results:'));

      for (const assertionResult of result.assertionResults) {
        const assertion = assertionResult.assertion;

        let resultColor;
        switch (assertionResult.status) {
          case ValidationStatus.PASSED:
            resultColor = chalk.green;
            break;
          case ValidationStatus.FAILED:
            resultColor = chalk.red;
            break;
          case ValidationStatus.ERROR:
            resultColor = chalk.red;
            break;
          case ValidationStatus.WARNING:
            resultColor = chalk.yellow;
            break;
          case ValidationStatus.SKIPPED:
            resultColor = chalk.gray;
            break;
          default:
            resultColor = chalk.white;
        }

        console.log(
          resultColor(`\n[${assertionResult.status}] ${assertion.description}`)
        );
        console.log(`Type: ${assertion.type}`);
        console.log(`Target Function: ${assertion.targetFunction}`);
        console.log(
          `Expected Outcome: ${JSON.stringify(assertion.expectedOutcome)}`
        );

        if (assertionResult.actualOutcome !== undefined) {
          console.log(
            `Actual Outcome: ${JSON.stringify(assertionResult.actualOutcome)}`
          );
        }

        if (assertionResult.errorMessage) {
          console.log(chalk.red(`Error: ${assertionResult.errorMessage}`));
        }

        if (
          assertionResult.suggestions &&
          assertionResult.suggestions.length > 0
        ) {
          console.log(chalk.yellow('\nSuggestions:'));
          for (const suggestion of assertionResult.suggestions) {
            console.log(`- ${suggestion}`);
          }
        }
      }
    }
  }
}

/**
 * Creates the validate command
 * @returns The validate command
 */
export function createValidateCommand(): Command {
  const validateCommand = new Command('validate')
    .description('Validate a blueprint against expected behaviors')
    .argument('<blueprint>', 'Blueprint file or directory to validate')
    .option('-i, --interactive', 'Run in interactive mode', false)
    .option(
      '-a, --autofix',
      'Attempt to automatically fix validation issues',
      false
    )
    .option(
      '-g, --guild-mode',
      'Compare against Guild behavioral contracts',
      false
    )
    .option(
      '-l, --level <level>',
      'Validation level (strict, normal, relaxed)',
      'normal'
    )
    .option(
      '-m, --store-memory',
      'Store validation results in Reflexive Memory',
      false
    )
    .option(
      '-c, --continue-on-failure',
      'Continue validation even if assertions fail',
      false
    )
    .option(
      '-t, --timeout <timeout>',
      'Timeout for validation in milliseconds',
      '5000'
    )
    .action(async (blueprintPath, options) => {
      try {
        // Parse validation options
        const validatorOptions: Partial<ValidatorOptions> = {
          mode: options.interactive
            ? ValidationMode.INTERACTIVE
            : ValidationMode.HEADLESS,
          validationLevel: options.level.toUpperCase() as ValidationLevel,
          autofix: options.autofix,
          useGuildContracts: options.guildMode,
          storeInReflexiveMemory: options.storeMemory,
          continueOnFailure: options.continueOnFailure,
          timeout: parseInt(options.timeout, 10),
        };

        // Create validator engine
        const validatorEngine = options.interactive
          ? ValidatorEngine.createInteractive(validatorOptions)
          : ValidatorEngine.createHeadless(validatorOptions);

        console.log(chalk.blue('Blueprint Test Validator Engine'));
        console.log(chalk.blue('=============================='));

        // Check if the blueprint path is a file or directory
        const stats = await fs.promises.stat(blueprintPath);

        let results;
        if (stats.isDirectory()) {
          // Validate all blueprints in the directory
          console.log(`Validating blueprints in directory: ${blueprintPath}`);
          const blueprints = await loadBlueprintsFromDirectory(blueprintPath);

          if (blueprints.length === 0) {
            console.log(
              chalk.yellow('No valid blueprint files found in the directory.')
            );
            return;
          }

          console.log(`Found ${blueprints.length} blueprint(s) to validate.`);
          results = await validatorEngine.validateBlueprintBatch(blueprints);
        } else {
          // Validate a single blueprint
          console.log(`Validating blueprint: ${blueprintPath}`);
          const blueprint = await loadBlueprint(blueprintPath);
          results = [await validatorEngine.validateBlueprint(blueprint)];
        }

        // Display results
        displayResults(results);

        // Determine exit code based on validation results
        const hasFailures = results.some(
          (result) =>
            result.status === ValidationStatus.FAILED ||
            result.status === ValidationStatus.ERROR
        );

        if (hasFailures) {
          console.log(chalk.red('\nValidation completed with failures.'));
          process.exit(1);
        } else {
          console.log(chalk.green('\nValidation completed successfully.'));
        }
      } catch (error) {
        console.error(
          chalk.red(
            `Error: ${error instanceof Error ? error.message : String(error)}`
          )
        );
        process.exit(1);
      }
    });

  return validateCommand;
}
