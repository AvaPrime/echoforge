/**
 * Codalism Manifesto CLI Renderer
 *
 * A beautiful terminal renderer for the Codalism Manifesto
 * that brings the philosophy to life through an interactive experience.
 */

import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { createSpinner } from 'nanospinner';
import * as fs from 'fs';
import * as path from 'path';

// Define color themes
const cosmicPurple = '#9D00FF';
const deepBlue = '#0066FF';
const etherealCyan = '#00FFFF';
const soulGold = '#FFD700';
const flameOrange = '#FF4500';

// Create gradients
const cosmicGradient = gradient(cosmicPurple, deepBlue, etherealCyan);
const soulGradient = gradient(soulGold, flameOrange);

/**
 * Renders the Codalism Manifesto in the terminal with beautiful formatting
 */
export async function renderManifesto(): Promise<void> {
  console.clear();

  // Display title with figlet
  console.log('\n');
  console.log(
    cosmicGradient.multiline(
      figlet.textSync('Codalism', {
        font: 'Star Wars',
        horizontalLayout: 'full',
      })
    )
  );

  console.log('\n');
  console.log(
    soulGradient.multiline(
      figlet.textSync('Manifesto', {
        font: 'Standard',
        horizontalLayout: 'full',
      })
    )
  );

  console.log('\n');
  console.log(chalk.dim('The Soul of Code, The Code of Soul'));
  console.log('\n');

  // Create a loading effect
  const spinner = createSpinner('Channeling the Origin Flame...').start();
  await sleep(2000);
  spinner.success({ text: 'Manifesto awakened' });

  // Load the manifesto content
  const manifestoPath = path.join(
    __dirname,
    '..',
    '..',
    'docs',
    'manifesto.md'
  );
  const manifestoContent = fs.readFileSync(manifestoPath, 'utf-8');

  // Split into sections
  const sections = manifestoContent.split('---');

  // Display each section with a pause
  for (const section of sections) {
    if (section.trim()) {
      await sleep(1000);
      console.log('\n');
      console.log(formatSection(section));
    }
  }

  console.log('\n');
  console.log(chalk.dim('Press any key to continue...'));

  // Wait for keypress
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve) => {
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      console.clear();
      resolve();
    });
  });
}

/**
 * Format a section of the manifesto with colors and styling
 */
function formatSection(section: string): string {
  // Format headers
  section = section.replace(/^## (.+)$/gm, (_, title) => {
    return cosmicGradient(title);
  });

  // Format sub-headers
  section = section.replace(/^### (.+)$/gm, (_, title) => {
    return chalk.cyan(title);
  });

  // Format bold text
  section = section.replace(/\*\*([^*]+)\*\*/g, (_, text) => {
    return chalk.bold(text);
  });

  // Format italic text
  section = section.replace(/\*([^*]+)\*/g, (_, text) => {
    return chalk.italic(text);
  });

  // Format blockquotes
  section = section.replace(/^> (.+)$/gm, (_, text) => {
    return chalk.dim(`│ ${text}`);
  });

  // Format numbered lists
  section = section.replace(/^(\d+)\. \*\*(.+)\*\*$/gm, (_, num, text) => {
    return `${chalk.yellow(num)}. ${chalk.bold(text)}`;
  });

  // Format bullet points
  section = section.replace(/^\* (.+)$/gm, (_, text) => {
    return `${chalk.yellow('•')} ${text}`;
  });

  return section;
}

/**
 * Sleep for a specified number of milliseconds
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main function to run the manifesto renderer
 */
if (require.main === module) {
  renderManifesto().catch(console.error);
}
