/**
 * Codebase Assessment & Living Documentation System
 * Main Entry Point
 *
 * This file serves as the main entry point for the EchoForge
 * Codebase Assessment & Living Documentation System.
 */

const path = require('path');
const fs = require('fs-extra');
const config = require('./config');
const { runAssessment } = require('./run-assessment');

/**
 * Initialize the Codebase Assessment System
 * @param {Object} options - Configuration options
 * @returns {Promise<void>}
 */
async function initialize(options = {}) {
  console.log('Initializing EchoForge Codebase Assessment System...');

  // Merge provided options with default config
  const mergedConfig = {
    ...config,
    ...options,
  };

  // Ensure required directories exist
  await ensureDirectories(mergedConfig);

  console.log('Initialization complete. System ready for assessment.');
  return mergedConfig;
}

/**
 * Ensure all required directories exist
 * @param {Object} config - System configuration
 * @returns {Promise<void>}
 */
async function ensureDirectories(config) {
  const dirs = [
    config.system.outputPath,
    path.join(config.system.outputPath, 'analysis'),
    path.join(config.system.outputPath, 'inventory'),
    path.join(config.system.outputPath, 'opportunities'),
    path.join(config.system.outputPath, 'living-docs'),
  ];

  for (const dir of dirs) {
    await fs.ensureDir(dir);
  }
}

/**
 * Run a complete codebase assessment
 * @param {Object} options - Assessment options
 * @returns {Promise<Object>} Assessment results
 */
async function assess(options = {}) {
  const mergedConfig = await initialize(options);
  return runAssessment(mergedConfig);
}

/**
 * Generate living documentation only (without running analysis)
 * @param {Object} options - Documentation options
 * @returns {Promise<Object>} Documentation results
 */
async function generateDocumentation(options = {}) {
  const mergedConfig = await initialize(options);
  return runAssessment({
    ...mergedConfig,
    docsOnly: true,
  });
}

/**
 * Run static analysis only (without generating documentation)
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Analysis results
 */
async function runAnalysis(options = {}) {
  const mergedConfig = await initialize(options);
  return runAssessment({
    ...mergedConfig,
    analysisOnly: true,
  });
}

/**
 * Get the assessment agent instance
 * @param {Object} options - Agent options
 * @returns {Promise<Object>} Assessment agent instance
 */
async function getAssessmentAgent(options = {}) {
  const mergedConfig = await initialize(options);
  const { createAssessmentAgent } = require('./lib/agent');
  return createAssessmentAgent(mergedConfig);
}

module.exports = {
  initialize,
  assess,
  generateDocumentation,
  runAnalysis,
  getAssessmentAgent,
  config,
};
