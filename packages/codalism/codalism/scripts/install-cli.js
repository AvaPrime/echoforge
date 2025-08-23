#!/usr/bin/env node

/**
 * This script installs the Codalism CLI globally after building
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the package directory
const packageDir = path.resolve(__dirname, '..');

// Ensure the package is built
console.log('Building the package...');
try {
  execSync('pnpm run build', { cwd: packageDir, stdio: 'inherit' });
} catch (error) {
  console.error('Failed to build the package:', error);
  process.exit(1);
}

// Make the CLI executable
console.log('Making the CLI executable...');
try {
  const cliPath = path.join(packageDir, 'dist', 'cli', 'index.js');

  // Add shebang if it doesn't exist
  let content = fs.readFileSync(cliPath, 'utf8');
  if (!content.startsWith('#!/usr/bin/env node')) {
    content = '#!/usr/bin/env node\n' + content;
    fs.writeFileSync(cliPath, content);
  }

  // Make executable
  try {
    fs.chmodSync(cliPath, '755');
  } catch (error) {
    // On Windows, chmod doesn't work, but it's not needed
    if (process.platform !== 'win32') {
      console.warn('Warning: Could not make CLI executable:', error);
    }
  }
} catch (error) {
  console.error('Failed to prepare the CLI:', error);
  process.exit(1);
}

// Install globally
console.log('Installing the CLI globally...');
try {
  execSync('pnpm link --global', { cwd: packageDir, stdio: 'inherit' });
  console.log('\nCodealism CLI installed globally!');
  console.log('You can now run the CLI with: codalism');
} catch (error) {
  console.error('Failed to install the CLI globally:', error);
  process.exit(1);
}
