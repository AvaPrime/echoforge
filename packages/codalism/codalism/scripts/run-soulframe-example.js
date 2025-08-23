/**
 * Script to run the Soulframe example
 */

const { execSync } = require('child_process');
const path = require('path');

// Determine if we need to build first
const args = process.argv.slice(2);
const skipBuild = args.includes('--skip-build');

try {
  // Build the project first (unless skipped)
  if (!skipBuild) {
    console.log('Building the project...');
    execSync('pnpm run build', { stdio: 'inherit' });
  }

  // Run the example
  console.log('\nRunning Soulframe example...');
  execSync('node -r ts-node/register src/examples/soulframe-example.ts', {
    stdio: 'inherit',
  });

  console.log('\nSoulframe example completed successfully!');
} catch (error) {
  console.error('Error running Soulframe example:', error.message);
  process.exit(1);
}
