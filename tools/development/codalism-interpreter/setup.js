#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function executeCommand(command, errorMessage) {
  try {
    log(`\n> ${command}`, colors.dim);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`\n❌ ${errorMessage || error.message}`, colors.red);
    return false;
  }
}

function checkDependency(dependency) {
  try {
    require.resolve(dependency);
    return true;
  } catch (e) {
    return false;
  }
}

log('\n🚀 Setting up Codalism Interpreter...', colors.bright + colors.blue);
log('='.repeat(50), colors.dim);

// Step 1: Install dependencies
log('\n📦 Installing dependencies...', colors.cyan);

if (!executeCommand('npm install', 'Failed to install dependencies')) {
  log('\nTrying with --force flag...', colors.yellow);
  executeCommand(
    'npm install --force',
    'Failed to install dependencies even with force flag'
  );
}

// Step 2: Install tree-sitter language parsers
log('\n🌳 Installing Tree-sitter language parsers...', colors.cyan);

const treeLanguages = [
  'tree-sitter-python',
  'tree-sitter-javascript',
  'tree-sitter-typescript',
];
let allTreeSitterInstalled = true;

for (const lang of treeLanguages) {
  if (!checkDependency(lang)) {
    log(`Installing ${lang}...`, colors.yellow);
    if (!executeCommand(`npm install ${lang}`, `Failed to install ${lang}`)) {
      allTreeSitterInstalled = false;
    }
  } else {
    log(`✅ ${lang} already installed`, colors.green);
  }
}

// Step 3: Compile TypeScript
log('\n🔧 Compiling TypeScript...', colors.cyan);

if (!fs.existsSync('tsconfig.json')) {
  log('tsconfig.json not found, creating one...', colors.yellow);
  // This will be created by our previous step, but just in case
}

executeCommand('npx tsc', 'Failed to compile TypeScript');

// Step 4: Test the CLI
log('\n🧪 Testing the CLI...', colors.cyan);

if (fs.existsSync('dist/codalism_cli.js')) {
  log('✅ CLI compiled successfully', colors.green);
  log('\nYou can now run the CLI with:', colors.bright);
  log('node dist/codalism_cli.js <command> [options]', colors.yellow);
  log('\nExample commands:', colors.bright);
  log('node dist/codalism_cli.js analyze ./codalism_example.ts', colors.yellow);
  log('node dist/codalism_cli.js primitives', colors.yellow);
} else {
  log('❌ CLI compilation failed or output file not found', colors.red);
}

// Final instructions
log('\n🎉 Setup complete!', colors.bright + colors.green);
log('\nNext steps:', colors.bright);
log(
  '1. Run the CLI to analyze code: node dist/codalism_cli.js analyze <file>',
  colors.reset
);
log(
  '2. Scan a project: node dist/codalism_cli.js scan <project_dir>',
  colors.reset
);
log(
  '3. Generate agents: node dist/codalism_cli.js generate <project_dir>',
  colors.reset
);

log('\nFor global installation:', colors.bright);
log('npm link', colors.yellow);
log('Then you can use: codessa <command> [options]', colors.reset);
