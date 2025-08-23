#!/usr/bin/env node

/**
 * This script makes the CLI executable after building
 */

const fs = require('fs');
const path = require('path');

// Get the CLI path
const cliPath = path.resolve(__dirname, '..', 'dist', 'cli', 'index.js');

console.log(`Making CLI executable: ${cliPath}`);

try {
  // Check if the file exists
  if (!fs.existsSync(cliPath)) {
    console.error(`CLI file not found: ${cliPath}`);
    console.error('Make sure to build the project first with: pnpm run build');
    process.exit(1);
  }

  // Add shebang if it doesn't exist
  let content = fs.readFileSync(cliPath, 'utf8');
  if (!content.startsWith('#!/usr/bin/env node')) {
    content = '#!/usr/bin/env node\n' + content;
    fs.writeFileSync(cliPath, content);
    console.log('Added shebang to CLI file');
  }

  // Make executable on Unix-like systems
  if (process.platform !== 'win32') {
    try {
      fs.chmodSync(cliPath, '755');
      console.log('Made CLI file executable');
    } catch (error) {
      console.warn(`Warning: Could not make CLI executable: ${error.message}`);
    }
  } else {
    console.log('On Windows, no need to change file permissions');
  }

  console.log('CLI is ready to use!');
} catch (error) {
  console.error(`Error making CLI executable: ${error.message}`);
  process.exit(1);
}
