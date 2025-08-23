/**
 * compose.ts
 * CLI command for blueprint composition and capability extraction
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { BlueprintComposer, CapabilityExtractor } from '@echoforge/recomposer';
import { ValidatorEngine } from '@echoforge/validator';

/**
 * Loads a blueprint from a file
 * @param filePath Path to the blueprint file
 * @returns The loaded blueprint
 */
async function loadBlueprint(filePath: string): Promise<any> {
  try {
    const fullPath = path.resolve(filePath);
    const content = await fs.promises.readFile(fullPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(chalk.red(`Error loading blueprint from ${filePath}:`));
    console.error(chalk.red(error));
    throw error;
  }
}

/**
 * Saves a blueprint to a file
 * @param blueprint The blueprint to save
 * @param filePath Path to save the blueprint to
 */
async function saveBlueprint(blueprint: any, filePath: string): Promise<void> {
  try {
    const fullPath = path.resolve(filePath);
    const dirPath = path.dirname(fullPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }

    await fs.promises.writeFile(
      fullPath,
      JSON.stringify(blueprint, null, 2),
      'utf8'
    );

    console.log(chalk.green(`Blueprint saved to ${fullPath}`));
  } catch (error) {
    console.error(chalk.red(`Error saving blueprint to ${filePath}:`));
    console.error(chalk.red(error));
    throw error;
  }
}

/**
 * Creates the compose command
 * @returns The compose command
 */
export function createComposeCommand(): Command {
  const command = new Command('compose')
    .description('Compose multiple blueprints or extract capabilities')
    .option(
      '-b, --blueprints <paths>',
      'Comma-separated list of blueprint files to compose',
      (val) => val.split(',')
    )
    .option(
      '-o, --output <path>',
      'Output file path for the composed blueprint',
      'composed-blueprint.json'
    )
    .option(
      '-s, --strategy <strategy>',
      'Conflict resolution strategy (conservative, aggressive, manual)',
      'conservative'
    )
    .option(
      '-a, --auto-refine',
      'Automatically refine the composed blueprint',
      false
    )
    .option(
      '-l, --lineage',
      'Maintain agent ID lineage and capability provenance',
      true
    )
    .option(
      '-v, --validate',
      'Validate the composed blueprint after composition',
      true
    )
    .option('-e, --extract <selector>', 'Extract a capability from a blueprint')
    .option(
      '-t, --selector-type <type>',
      'Type of selector for extraction (function, class, intent_tag, capability)',
      'function'
    )
    .option(
      '-d, --diff',
      'Generate a diff between the original and composed blueprints',
      false
    )
    .option(
      '-n, --narrate',
      'Generate a narrative of the composition process',
      false
    )
    .action(async (options) => {
      try {
        if (options.extract) {
          // Extract a capability
          await extractCapability(options);
        } else {
          // Compose blueprints
          await composeBlueprints(options);
        }
      } catch (error) {
        console.error(chalk.red('Error:'), error);
        process.exit(1);
      }
    });

  return command;
}

/**
 * Composes multiple blueprints
 * @param options Command options
 */
async function composeBlueprints(options: any): Promise<void> {
  // Validate options
  if (!options.blueprints || options.blueprints.length === 0) {
    console.error(chalk.red('Error: No blueprints specified'));
    console.log(
      chalk.yellow('Usage: codessa compose --blueprints file1.json,file2.json')
    );
    process.exit(1);
  }

  console.log(chalk.blue('Loading blueprints...'));

  // Load blueprints
  const blueprints = [];

  for (const filePath of options.blueprints) {
    try {
      const blueprint = await loadBlueprint(filePath);
      blueprints.push(blueprint);
      console.log(chalk.green(`Loaded blueprint from ${filePath}`));
    } catch (error) {
      console.error(chalk.red(`Error loading blueprint from ${filePath}:`));
      console.error(chalk.red(error));
      process.exit(1);
    }
  }

  console.log(chalk.blue('Composing blueprints...'));

  // Create composer
  const composer = new BlueprintComposer({
    conflictStrategy: options.strategy,
    autoRefine: options.autoRefine,
    maintainLineage: options.lineage,
    validateAfterComposition: options.validate,
  });

  // Compose blueprints
  const composedBlueprint = await composer.compose(blueprints);

  // Save composed blueprint
  await saveBlueprint(composedBlueprint, options.output);

  // Validate if requested
  if (options.validate) {
    console.log(chalk.blue('Validating composed blueprint...'));

    const validator = new ValidatorEngine();
    const validationResult = await validator.validate(composedBlueprint);

    if (validationResult.status === 'success') {
      console.log(chalk.green('Validation successful!'));
      console.log(
        chalk.green(`Passed ${validationResult.summary.passed} assertions`)
      );
    } else {
      console.log(chalk.yellow('Validation failed!'));
      console.log(
        chalk.yellow(
          `Failed ${validationResult.summary.failed} of ${validationResult.summary.total} assertions`
        )
      );

      // Print failed assertions
      validationResult.assertions
        .filter((assertion) => !assertion.passed)
        .forEach((assertion) => {
          console.log(chalk.red(`- ${assertion.description}`));
          console.log(chalk.gray(`  ${assertion.suggestion}`));
        });
    }
  }

  // Generate diff if requested
  if (options.diff && blueprints.length > 0) {
    console.log(chalk.blue('Generating diff...'));

    const { BlueprintDiff } = require('@echoforge/recomposer');
    const diff = BlueprintDiff.compare(blueprints[0], composedBlueprint);
    const narrative = diff.generateNarrative();

    console.log(chalk.cyan('Blueprint Diff:'));
    console.log(narrative);

    // Save diff to file
    const diffPath = options.output.replace(/\.json$/, '-diff.txt');
    await fs.promises.writeFile(diffPath, narrative, 'utf8');
    console.log(chalk.green(`Diff saved to ${diffPath}`));
  }

  // Generate narrative if requested
  if (options.narrate) {
    console.log(chalk.blue('Generating composition narrative...'));

    const narrative = generateCompositionNarrative(
      blueprints,
      composedBlueprint,
      options
    );

    console.log(chalk.cyan('Composition Narrative:'));
    console.log(narrative);

    // Save narrative to file
    const narrativePath = options.output.replace(/\.json$/, '-narrative.txt');
    await fs.promises.writeFile(narrativePath, narrative, 'utf8');
    console.log(chalk.green(`Narrative saved to ${narrativePath}`));
  }

  console.log(chalk.green('Blueprint composition completed successfully!'));
}

/**
 * Extracts a capability from a blueprint
 * @param options Command options
 */
async function extractCapability(options: any): Promise<void> {
  // Validate options
  if (!options.blueprints || options.blueprints.length === 0) {
    console.error(chalk.red('Error: No blueprint specified for extraction'));
    console.log(
      chalk.yellow(
        'Usage: codessa compose --extract functionName --blueprints blueprint.json'
      )
    );
    process.exit(1);
  }

  if (options.blueprints.length > 1) {
    console.warn(
      chalk.yellow(
        'Warning: Multiple blueprints specified, using only the first one for extraction'
      )
    );
  }

  console.log(chalk.blue('Loading blueprint...'));

  // Load blueprint
  const blueprint = await loadBlueprint(options.blueprints[0]);
  console.log(chalk.green(`Loaded blueprint from ${options.blueprints[0]}`));

  console.log(
    chalk.blue(`Extracting ${options.selectorType} '${options.extract}'...`)
  );

  // Create extractor
  const extractor = new CapabilityExtractor();

  // Extract capability
  const extractedCapability = await extractor.extract(blueprint, {
    selector: options.extract,
    selectorType: options.selectorType.toUpperCase(),
    includeRelatedFunctions: true,
    generateMinimalViableModule: true,
  });

  // Save extracted capability
  await saveBlueprint(extractedCapability, options.output);

  // Validate if requested
  if (options.validate) {
    console.log(chalk.blue('Validating extracted capability...'));

    const validator = new ValidatorEngine();
    const validationResult = await validator.validate(extractedCapability);

    if (validationResult.status === 'success') {
      console.log(chalk.green('Validation successful!'));
      console.log(
        chalk.green(`Passed ${validationResult.summary.passed} assertions`)
      );
    } else {
      console.log(chalk.yellow('Validation failed!'));
      console.log(
        chalk.yellow(
          `Failed ${validationResult.summary.failed} of ${validationResult.summary.total} assertions`
        )
      );

      // Print failed assertions
      validationResult.assertions
        .filter((assertion) => !assertion.passed)
        .forEach((assertion) => {
          console.log(chalk.red(`- ${assertion.description}`));
          console.log(chalk.gray(`  ${assertion.suggestion}`));
        });
    }
  }

  console.log(chalk.green('Capability extraction completed successfully!'));
}

/**
 * Generates a narrative of the composition process
 * @param blueprints The input blueprints
 * @param composedBlueprint The composed blueprint
 * @param options Command options
 * @returns A narrative string
 */
function generateCompositionNarrative(
  blueprints: any[],
  composedBlueprint: any,
  options: any
): string {
  let narrative = 'Blueprint Composition Narrative\n';
  narrative += '==============================\n\n';

  // Add blueprint information
  narrative += 'Input Blueprints:\n';

  blueprints.forEach((blueprint, index) => {
    narrative += `- Blueprint ${index + 1}: ${blueprint.name || blueprint.id || 'Unknown'}\n`;
    narrative += `  ID: ${blueprint.id || 'Unknown'}\n`;
    narrative += `  Intent: ${blueprint.intent?.description || 'None'}\n`;
    narrative += `  Capabilities: ${Object.keys(blueprint.capabilities || {}).length}\n`;
    narrative += `  Refinement Annotations: ${Object.keys(blueprint.refinementAnnotations || {}).length}\n`;
  });

  narrative += '\nComposition Options:\n';
  narrative += `- Strategy: ${options.strategy}\n`;
  narrative += `- Auto-Refine: ${options.autoRefine ? 'Yes' : 'No'}\n`;
  narrative += `- Maintain Lineage: ${options.lineage ? 'Yes' : 'No'}\n`;
  narrative += `- Validate After Composition: ${options.validate ? 'Yes' : 'No'}\n`;

  narrative += '\nComposed Blueprint:\n';
  narrative += `- Name: ${composedBlueprint.name || 'Unknown'}\n`;
  narrative += `- ID: ${composedBlueprint.id || 'Unknown'}\n`;
  narrative += `- Intent: ${composedBlueprint.intent?.description || 'None'}\n`;
  narrative += `- Capabilities: ${Object.keys(composedBlueprint.capabilities || {}).length}\n`;
  narrative += `- Refinement Annotations: ${Object.keys(composedBlueprint.refinementAnnotations || {}).length}\n`;
  narrative += `- Composition Timestamp: ${composedBlueprint.metadata?.composedAt || 'Unknown'}\n`;

  if (composedBlueprint.metadata?.parentBlueprints) {
    narrative += `- Parent Blueprints: ${composedBlueprint.metadata.parentBlueprints.join(', ')}\n`;
  }

  return narrative;
}
