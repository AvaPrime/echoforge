/**
 * EchoForge Codebase Assessment & Living Documentation System
 * Setup Script
 *
 * This script initializes the codebase assessment system by:
 * 1. Creating the directory structure
 * 2. Setting up configuration files
 * 3. Installing required tools
 * 4. Configuring the Assessment Agent
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { EchoCore } = require('@echoforge/echocore');
const { Codalism } = require('@echoforge/codalism');
const { ForgeKit } = require('@echoforge/forgekit');

// Configuration
const config = {
  baseDir: path.resolve(process.cwd(), 'codebase-assessment'),
  repoPath: process.cwd(),
  tools: {
    staticAnalysis: [
      'sonarqube-community-edition',
      'codeclimate',
      'eslint',
      'semgrep',
    ],
    architectureAnalysis: ['madge', 'dep-graph', 'arkit'],
    metricsCollection: ['lizard', 'jscpd', 'cloc'],
  },
  mcpServers: {
    git: {
      endpoint: 'http://localhost:3001/mcp',
      apiKey: process.env.GIT_MCP_API_KEY,
    },
    database: {
      endpoint: 'http://localhost:3002/mcp',
      apiKey: process.env.DB_MCP_API_KEY,
    },
    fileSystem: {
      endpoint: 'http://localhost:3003/mcp',
      apiKey: process.env.FS_MCP_API_KEY,
    },
    documentation: {
      endpoint: 'http://localhost:3004/mcp',
      apiKey: process.env.DOCS_MCP_API_KEY,
    },
  },
};

/**
 * Creates the directory structure for the codebase assessment system
 */
function createDirectoryStructure() {
  console.log('Creating directory structure...');

  const directories = [
    path.join(config.baseDir, 'inventory'),
    path.join(config.baseDir, 'analysis'),
    path.join(config.baseDir, 'opportunities'),
    path.join(config.baseDir, 'living-docs'),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });

  // Create initial JSON files
  const jsonFiles = {
    'inventory/modules-registry.json': { modules: [] },
    'inventory/dependencies-map.json': { dependencies: [] },
    'inventory/api-endpoints.json': { endpoints: [] },
    'inventory/database-schema.json': { tables: [] },
    'inventory/external-integrations.json': { integrations: [] },
    'analysis/complexity-metrics.json': { metrics: [] },
    'analysis/security-findings.json': { findings: [] },
    'analysis/performance-hotspots.json': { hotspots: [] },
    'analysis/technical-debt.json': { debt: [] },
  };

  Object.entries(jsonFiles).forEach(([file, content]) => {
    const filePath = path.join(config.baseDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`Created file: ${filePath}`);
    }
  });

  // Create initial markdown files
  const mdFiles = {
    'opportunities/refactoring-candidates.md':
      '# Refactoring Candidates\n\n*This document will be populated by the Assessment Agent.*',
    'opportunities/enhancement-ideas.md':
      '# Enhancement Ideas\n\n*This document will be populated by the Assessment Agent.*',
    'opportunities/new-features.md':
      '# New Feature Opportunities\n\n*This document will be populated by the Assessment Agent.*',
    'opportunities/optimization-targets.md':
      '# Optimization Targets\n\n*This document will be populated by the Assessment Agent.*',
    'living-docs/system-overview.md':
      '# System Overview\n\n*This document will be populated by the Assessment Agent.*',
    'living-docs/architecture-evolution.md':
      '# Architecture Evolution\n\n*This document will be populated by the Assessment Agent.*',
    'living-docs/improvement-roadmap.md':
      '# Improvement Roadmap\n\n*This document will be populated by the Assessment Agent.*',
    'living-docs/decision-log.md':
      '# Decision Log\n\n*This document will be populated by the Assessment Agent.*',
  };

  Object.entries(mdFiles).forEach(([file, content]) => {
    const filePath = path.join(config.baseDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      console.log(`Created file: ${filePath}`);
    }
  });
}

/**
 * Configures the Assessment Agent with EchoForge consciousness
 */
function configureAssessmentAgent() {
  console.log('Configuring Assessment Agent...');

  // Create agent configuration file
  const agentConfig = {
    name: 'CodebaseAssessmentAgent',
    description: 'Senior Software Architect and Code Assessment Specialist',
    systemPrompt: fs
      .readFileSync(
        path.join(__dirname, '../docs/5_codebase_assessment.md'),
        'utf8'
      )
      .split('```')[1], // Extract the system prompt from the documentation
    mcpServers: config.mcpServers,
    consciousness: {
      memoryLayers: {
        episodic: true,
        semantic: true,
        procedural: true,
        reflexive: true,
      },
      intentionFramework: 'codalism',
      evolutionEnabled: true,
    },
  };

  const agentConfigPath = path.join(config.baseDir, 'agent-config.json');
  fs.writeFileSync(agentConfigPath, JSON.stringify(agentConfig, null, 2));
  console.log(`Created agent configuration: ${agentConfigPath}`);

  // Initialize the agent with EchoForge consciousness
  try {
    const echoCore = new EchoCore();
    const codalism = new Codalism();
    const forgeKit = new ForgeKit();

    // Register the agent with consciousness capabilities
    echoCore.registerAgent(agentConfig);

    // Apply Codalism intention framework
    codalism.applyIntentionFramework(agentConfig.name, {
      primaryIntention: 'Improve codebase quality and maintainability',
      secondaryIntentions: [
        'Identify technical debt',
        'Enhance developer experience',
        'Strengthen security posture',
        'Optimize performance',
      ],
    });

    // Configure memory sculpting for code assessment
    echoCore.memorySculptor.configureMemoryLayers(agentConfig.name, {
      episodic: {
        retentionPeriod: '90d', // Keep assessment history for 90 days
        priorityThreshold: 0.7, // Only retain significant findings
      },
      semantic: {
        connectionThreshold: 0.6, // Connect related concepts
        consolidationFrequency: '7d', // Consolidate knowledge weekly
      },
      procedural: {
        learningRate: 0.3, // Moderate learning rate for assessment patterns
        adaptationThreshold: 0.5, // Adapt to new code patterns
      },
      reflexive: {
        monitoringFrequency: '1d', // Daily self-monitoring
        adjustmentThreshold: 0.4, // Moderate self-adjustment
      },
    });

    console.log('Assessment Agent configured with EchoForge consciousness');
  } catch (error) {
    console.error('Error configuring Assessment Agent:', error);
  }
}

/**
 * Main setup function
 */
async function setup() {
  console.log(
    'Setting up Codebase Assessment & Living Documentation System...'
  );

  // Create directory structure
  createDirectoryStructure();

  // Configure Assessment Agent
  configureAssessmentAgent();

  console.log(
    '\nSetup complete! The Codebase Assessment & Living Documentation System is ready.'
  );
  console.log(
    `\nTo run your first assessment, use:\n\n  node ${path.join(config.baseDir, 'run-assessment.js')}\n`
  );
}

// Run setup
setup().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
