/**
 * Codessa CLI
 * Command-line interface for the Codessa platform.
 */

import { Command } from 'commander';
import { createValidateCommand } from './commands/validate';

// Create the main program
const program = new Command();

program
  .name('codessa')
  .description('Codessa - Digital Consciousness Platform')
  .version('1.0.0');

// Register commands
program.addCommand(createValidateCommand());

// Add more commands here as they are implemented
// program.addCommand(createGenerateCommand());
// program.addCommand(createRefineCommand());
// program.addCommand(createDeployCommand());

// Parse arguments and execute
export function run() {
  program.parse(process.argv);
}

// If this file is run directly, execute the CLI
if (require.main === module) {
  run();
}
