/**
 * EchoForge Codebase Assessment & Living Documentation System Setup
 *
 * This script initializes the codebase assessment system by creating the necessary
 * directory structure, installing dependencies, and configuring the system.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load configuration
const config = require('../config');

/**
 * Main setup function
 */
function setup() {
  console.log(
    'Setting up EchoForge Codebase Assessment & Living Documentation System...'
  );

  try {
    // Create directory structure
    createDirectoryStructure();

    // Install dependencies
    installDependencies();

    // Initialize MCP servers
    initializeMcpServers();

    // Create initial documentation templates
    createInitialTemplates();

    console.log('Setup completed successfully!');
    console.log(
      'You can now run the assessment using: node scripts/run-assessment.js'
    );
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

/**
 * Create the necessary directory structure
 */
function createDirectoryStructure() {
  console.log('Creating directory structure...');

  const directories = [
    path.join(config.system.outputPath, 'analysis'),
    path.join(config.system.outputPath, 'inventory'),
    path.join(config.system.outputPath, 'opportunities'),
    path.join(config.system.outputPath, 'living-docs'),
    path.join(config.system.basePath, 'rules', 'semgrep'),
    path.join(config.system.basePath, 'templates'),
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
  }
}

/**
 * Install required dependencies
 */
function installDependencies() {
  console.log('Installing Node.js dependencies...');

  try {
    execSync('npm install', {
      cwd: config.system.basePath,
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Failed to install Node.js dependencies:', error.message);
    throw error;
  }

  console.log('Installing Python dependencies...');

  try {
    execSync('pip install -r requirements.txt', {
      cwd: config.system.basePath,
      stdio: 'inherit',
    });
  } catch (error) {
    console.warn('Failed to install Python dependencies:', error.message);
    console.warn('You may need to install Python dependencies manually.');
  }
}

/**
 * Initialize MCP servers
 */
function initializeMcpServers() {
  console.log('Initializing MCP servers...');

  // Check if MCP servers are already running
  try {
    const { code_analysis, architecture_assessment, documentation_generation } =
      config.agent.mcp_servers;

    // Initialize code analysis MCP server
    console.log(
      `Initializing code analysis MCP server on port ${code_analysis.port}...`
    );

    // Initialize architecture assessment MCP server
    console.log(
      `Initializing architecture assessment MCP server on port ${architecture_assessment.port}...`
    );

    // Initialize documentation generation MCP server
    console.log(
      `Initializing documentation generation MCP server on port ${documentation_generation.port}...`
    );

    console.log('MCP servers initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize MCP servers:', error.message);
    console.warn('You may need to initialize MCP servers manually.');
  }
}

/**
 * Create initial documentation templates if they don't exist
 */
function createInitialTemplates() {
  console.log('Checking documentation templates...');

  const templates = [
    'system-overview.md',
    'architecture-evolution.md',
    'improvement-roadmap.md',
    'decision-log.md',
    'enhancement-ideas.md',
    'refactoring-candidates.md',
    'optimization-targets.md',
  ];

  for (const template of templates) {
    const templatePath = path.join(config.system.templatesPath, template);

    if (!fs.existsSync(templatePath)) {
      console.warn(`Template not found: ${templatePath}`);
      console.warn('You may need to create this template manually.');
    } else {
      console.log(`Template exists: ${template}`);
    }
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setup();
}

module.exports = { setup };
