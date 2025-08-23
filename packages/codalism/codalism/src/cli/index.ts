#!/usr/bin/env node
/**
 * Codalism CLI
 *
 * Command-line interface for the Codalism paradigm
 */

import { Command } from 'commander';
import { renderManifesto } from './manifesto-renderer';
import { startManifestoViewer } from '../web/manifesto-viewer';
import { visualizeSoulframe } from './soulframe-visualizer';
import chalk from 'chalk';

const program = new Command();

program
  .name('codalism')
  .description('CLI tools for the Codalism paradigm')
  .version('0.1.0');

program
  .command('manifesto')
  .description('Display the Codalism Manifesto in the terminal')
  .action(async () => {
    await renderManifesto();
  });

program
  .command('manifesto:web')
  .description('Start a web server to view the Codalism Manifesto in a browser')
  .option('--port <number>', 'Port to run the server on', '3000')
  .action((options) => {
    const port = parseInt(options.port, 10);
    startManifestoViewer(port);
  });

program
  .command('soulframe:visualize')
  .description('Visualize the Soulframe architecture in a web browser')
  .option('--port <number>', 'Port to run the server on', '3001')
  .action((options) => {
    const port = parseInt(options.port, 10);
    visualizeSoulframe(port).catch((error) => {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    });
  });

program
  .command('soulframe:web')
  .description('Start a web demo of the Soulframe and Codalogue components')
  .option('--port <number>', 'Port to run the server on', '3002')
  .action((options) => {
    const port = parseInt(options.port, 10);
    // Import dynamically to avoid circular dependencies
    import('../web/soulframe-web-demo')
      .then(({ startSoulframeWebDemo }) => {
        startSoulframeWebDemo(port).catch((error) => {
          console.error(chalk.red('Error:'), error.message);
          process.exit(1);
        });
      })
      .catch((error) => {
        console.error(chalk.red('Error loading module:'), error.message);
        process.exit(1);
      });
  });

// Future commands will be added here

program
  .command('help')
  .description('Display help information')
  .action(() => {
    console.log(
      chalk.cyan('\nCodebase CLI - Tools for the Codalism paradigm\n')
    );
    console.log(chalk.yellow('Available Commands:'));
    console.log(
      '  manifesto          - Display the Codalism Manifesto in the terminal'
    );
    console.log(
      '  manifesto:web      - View the Codalism Manifesto in a web browser'
    );
    console.log(
      '  soulframe:visualize - Visualize the Soulframe architecture in a web browser'
    );
    console.log(
      '  soulframe:web      - Start a web demo of the Soulframe and Codalogue components'
    );
    console.log('\nRun any command with --help for more information\n');
  });

// Handle unknown commands
program.on('command:*', (operands) => {
  console.error(chalk.red(`Error: Unknown command '${operands[0]}'`));
  console.log('');
  console.log('See available commands with:');
  console.log('  codalism help');
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// If no arguments, show help
if (process.argv.length === 2) {
  program.help();
}
