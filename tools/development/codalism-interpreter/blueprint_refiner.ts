import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { CodalBlueprint } from './codalism_example';

/**
 * Refinement annotation structure for capturing user intent
 */
export interface RefinementAnnotation {
  intent: string;
  archetype: string;
  agent_name?: string;
  notes?: string;
}

/**
 * Blueprint node with refinement data
 */
export interface RefinedBlueprintNode {
  name: string;
  type: 'function' | 'class' | 'module';
  raw: string;
  refinement?: RefinementAnnotation;
}

/**
 * Options for the blueprint refinement process
 */
export interface BlueprintRefinerOptions {
  interactive: boolean;
  batch: boolean;
  headless: boolean;
  saveMemory: boolean;
  outputPath?: string;
}

/**
 * BlueprintRefiner - Handles the interactive refinement process for Codalism blueprints
 */
export class BlueprintRefiner {
  private options: BlueprintRefinerOptions;

  constructor(options: Partial<BlueprintRefinerOptions> = {}) {
    this.options = {
      interactive: options.interactive ?? true,
      batch: options.batch ?? false,
      headless: options.headless ?? false,
      saveMemory: options.saveMemory ?? false,
      outputPath: options.outputPath,
    };
  }

  /**
   * Refine a blueprint through interactive prompts or batch processing
   */
  async refineBlueprint(blueprint: CodalBlueprint): Promise<CodalBlueprint> {
    console.log(chalk.blue('🔄 Starting blueprint refinement process'));
    console.log(chalk.gray('-'.repeat(50)));

    // Create a deep copy to avoid modifying the original
    const refinedBlueprint = JSON.parse(JSON.stringify(blueprint));

    // Initialize refinement field if it doesn't exist
    if (!refinedBlueprint.refinement) {
      refinedBlueprint.refinement = {};
    }

    if (this.options.batch) {
      console.log(chalk.yellow('⚡ Batch mode: Using default refinements'));
      return this.applyDefaultRefinements(refinedBlueprint);
    }

    if (this.options.headless) {
      return this.handleHeadlessMode(refinedBlueprint);
    }

    // Interactive mode
    if (this.options.interactive) {
      // Add interactive prompt selection
      const modeSelection = await inquirer.prompt([
        {
          type: 'list',
          name: 'mode',
          message: 'How would you like to refine this blueprint?',
          choices: [
            { name: 'Interactive Q&A', value: 'interactive' },
            { name: 'Edit JSON directly', value: 'edit' },
            { name: 'Skip refinement', value: 'skip' },
          ],
        },
      ]);

      if (modeSelection.mode === 'skip') {
        console.log(chalk.yellow('⏩ Skipping refinement'));
        return refinedBlueprint;
      } else if (modeSelection.mode === 'edit') {
        return this.handleHeadlessMode(refinedBlueprint);
      } else {
        return this.handleInteractiveMode(refinedBlueprint);
      }
    }

    return refinedBlueprint;
  }

  /**
   * Apply default refinements in batch mode
   */
  private applyDefaultRefinements(blueprint: CodalBlueprint): CodalBlueprint {
    // In batch mode, we use the existing blueprint data to create basic refinements
    const refinedBlueprint = { ...blueprint };

    // Use the suggested agent name and intent from the blueprint
    refinedBlueprint.refinement = {
      intent: blueprint.intent,
      archetype: blueprint.suggestedAgent,
      agent_name: blueprint.name,
      notes: 'Auto-generated refinement',
    };

    return refinedBlueprint;
  }

  /**
   * Handle headless mode by outputting the blueprint to a file for manual editing
   */
  private async handleHeadlessMode(
    blueprint: CodalBlueprint
  ): Promise<CodalBlueprint> {
    const outputPath =
      this.options.outputPath || `${blueprint.name}.blueprint.json`;

    console.log(
      chalk.yellow(`📝 Headless mode: Writing blueprint to ${outputPath}`)
    );

    // Write the blueprint to a file
    fs.writeFileSync(outputPath, JSON.stringify(blueprint, null, 2));

    // Also save to .codessa directory for integration with Codessa IDE/Forge
    this.saveToCodessaDirectory(blueprint);

    console.log(chalk.green(`✅ Blueprint written to ${outputPath}`));
    console.log(chalk.yellow('📋 Edit the file and then use:'));
    console.log(`   codessa generate --blueprint ${outputPath}`);

    return blueprint;
  }

  /**
   * Handle interactive mode with user prompts
   */
  private async handleInteractiveMode(
    blueprint: CodalBlueprint
  ): Promise<CodalBlueprint> {
    console.log(chalk.green(`📊 Blueprint: ${blueprint.name}`));
    console.log(`   🎯 Current Intent: ${chalk.white(blueprint.intent)}`);
    console.log(
      `   🤖 Suggested Agent: ${chalk.green(blueprint.suggestedAgent)}`
    );

    const spinner = ora('Preparing refinement questions...').start();
    spinner.succeed('Ready for refinement');

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'intent',
        message: 'What is the primary intent of this function/class?',
        default: blueprint.intent,
      },
      {
        type: 'input',
        name: 'archetype',
        message: 'What agent archetype best describes this behavior?',
        default: blueprint.suggestedAgent,
      },
      {
        type: 'input',
        name: 'agent_name',
        message: 'Would you like to rename this agent to reflect its role?',
        default: blueprint.name,
      },
      {
        type: 'input',
        name: 'notes',
        message: 'Are there any dependencies or assumptions we should capture?',
        default: '',
      },
    ]);

    // Update the blueprint with refinement data
    const refinedBlueprint = { ...blueprint };
    refinedBlueprint.refinement = answers as RefinementAnnotation;

    // Also update the main blueprint fields if they've changed
    if (answers.intent !== blueprint.intent) {
      refinedBlueprint.intent = answers.intent;
    }

    if (answers.agent_name !== blueprint.name) {
      refinedBlueprint.name = answers.agent_name;
    }

    if (answers.archetype !== blueprint.suggestedAgent) {
      refinedBlueprint.suggestedAgent = answers.archetype;
    }

    console.log(chalk.green('✅ Refinement complete!'));

    // Save to memory if enabled
    if (this.options.saveMemory) {
      this.saveToReflexiveMemory(refinedBlueprint);
    }

    return refinedBlueprint;
  }

  /**
   * Save refinement data to reflexive memory for future use
   */
  private saveToReflexiveMemory(blueprint: CodalBlueprint): void {
    // This is a placeholder for the actual memory storage implementation
    console.log(chalk.blue('💾 Saving refinement to Reflexive Memory'));

    // In a real implementation, this would connect to a persistent storage system
    const memoryPath = path.join(process.cwd(), 'reflexive_memory');
    if (!fs.existsSync(memoryPath)) {
      fs.mkdirSync(memoryPath, { recursive: true });
    }

    const memoryFile = path.join(memoryPath, `${blueprint.name}.memory.json`);
    fs.writeFileSync(
      memoryFile,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          blueprint: blueprint,
        },
        null,
        2
      )
    );

    console.log(chalk.green(`✅ Memory saved to ${memoryFile}`));

    // Also save to .codessa directory for integration with Codessa IDE/Forge
    this.saveToCodessaDirectory(blueprint);
  }

  /**
   * Save refined blueprint to .codessa directory for integration with Codessa IDE/Forge
   */
  private saveToCodessaDirectory(blueprint: CodalBlueprint): void {
    console.log(
      chalk.blue('💾 Saving refined blueprint to .codessa directory')
    );

    // Create .codessa directory if it doesn't exist
    const codessaPath = path.join(process.cwd(), '.codessa', 'blueprints');
    if (!fs.existsSync(codessaPath)) {
      fs.mkdirSync(codessaPath, { recursive: true });
    }

    const blueprintFile = path.join(
      codessaPath,
      `${blueprint.name}.blueprint.json`
    );
    fs.writeFileSync(blueprintFile, JSON.stringify(blueprint, null, 2));

    console.log(chalk.green(`✅ Blueprint saved to ${blueprintFile}`));
  }

  /**
   * Refine multiple blueprints in a batch
   */
  async refineMultipleBlueprints(
    blueprints: CodalBlueprint[]
  ): Promise<CodalBlueprint[]> {
    const refinedBlueprints: CodalBlueprint[] = [];

    for (const blueprint of blueprints) {
      const refined = await this.refineBlueprint(blueprint);
      refinedBlueprints.push(refined);
    }

    return refinedBlueprints;
  }

  /**
   * Generate agents from refined blueprints
   * This method integrates with the agent generation system
   */
  async generateAgents(blueprints: CodalBlueprint[]): Promise<void> {
    console.log(chalk.blue('🤖 Generating agents from refined blueprints'));
    console.log(chalk.gray('-'.repeat(50)));

    // First ensure all blueprints are refined
    const refinedBlueprints = await this.refineMultipleBlueprints(blueprints);

    // Save all blueprints to .codessa directory for agent generation
    for (const blueprint of refinedBlueprints) {
      this.saveToCodessaDirectory(blueprint);
    }

    console.log(
      chalk.green(
        `✅ ${refinedBlueprints.length} blueprints prepared for agent generation`
      )
    );
    console.log(chalk.yellow('📋 To generate agents, use:'));
    console.log(`   codessa generate --blueprints .codessa/blueprints`);

    // Here we would call the actual agent generation system
    // This is a placeholder for the integration with Codessa IDE/Forge
    console.log(
      chalk.blue('🔄 Integration with agent generation system is ready')
    );
  }
}
