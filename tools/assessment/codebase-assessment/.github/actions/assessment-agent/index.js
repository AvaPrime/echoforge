/**
 * GitHub Action for EchoForge Codebase Assessment Agent
 *
 * This action runs the assessment agent on analysis results and generates reports.
 */

const core = require('@actions/core');
const github = require('@actions/github');
const path = require('path');
const fs = require('fs');

// Import the assessment agent
let createAssessmentAgent;
try {
  // Try to import from the repository
  createAssessmentAgent = require('../../../lib/agent').createAssessmentAgent;
} catch (error) {
  // Fall back to the action's bundled version
  createAssessmentAgent = require('./lib/agent').createAssessmentAgent;
}

/**
 * Main function to run the action
 */
async function run() {
  try {
    // Get inputs
    const analysisResultsPaths = core
      .getInput('analysis-results')
      .split('\n')
      .filter(Boolean);
    const outputDir = core.getInput('output-dir');
    const configPath = core.getInput('config-path');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Load configuration
    const config = loadConfig(configPath);

    // Load analysis results
    const analysisResults = loadAnalysisResults(analysisResultsPaths);

    // Create assessment agent
    const agent = createAssessmentAgent(config);

    // Run assessment
    core.info('Running codebase assessment...');
    const assessment = await agent.analyzeCodebase(analysisResults);

    // Save assessment results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(outputDir, `assessment-${timestamp}.json`);

    fs.writeFileSync(outputPath, JSON.stringify(assessment, null, 2));
    core.info(`Assessment results saved to ${outputPath}`);

    // Set outputs
    core.setOutput('assessment-path', outputPath);

    // Generate summary
    generateSummary(assessment);
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

/**
 * Load configuration from the specified path
 * @param {string} configPath - Path to configuration file
 * @returns {Object} Configuration object
 */
function loadConfig(configPath) {
  try {
    // Check if the config file exists
    if (fs.existsSync(configPath)) {
      // If it's a JavaScript file
      if (configPath.endsWith('.js')) {
        return require(path.resolve(configPath));
      }

      // If it's a JSON file
      if (configPath.endsWith('.json')) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    }

    // Fall back to default configuration
    return require('../../../config');
  } catch (error) {
    core.warning(`Failed to load config from ${configPath}: ${error.message}`);
    core.warning('Using default configuration');
    return {};
  }
}

/**
 * Load analysis results from the specified paths
 * @param {string[]} paths - Paths to analysis result files
 * @returns {Object} Analysis results
 */
function loadAnalysisResults(paths) {
  const results = {};

  for (const filePath of paths) {
    try {
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        core.warning(`Analysis result file not found: ${filePath}`);
        continue;
      }

      // Get the tool name from the file name
      const fileName = path.basename(filePath);
      const toolName = fileName
        .split('-')[0]
        .replace('.json', '')
        .replace('.xml', '');

      // Load the file content
      let content;
      if (filePath.endsWith('.json')) {
        content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } else if (filePath.endsWith('.xml')) {
        // For XML files, just store the raw content for now
        // In a real implementation, you would parse the XML
        content = fs.readFileSync(filePath, 'utf8');
      } else {
        // For other file types, store as string
        content = fs.readFileSync(filePath, 'utf8');
      }

      // Store the result
      results[toolName] = content;
    } catch (error) {
      core.warning(
        `Failed to load analysis result from ${filePath}: ${error.message}`
      );
    }
  }

  return results;
}

/**
 * Generate a summary of the assessment
 * @param {Object} assessment - Assessment results
 */
function generateSummary(assessment) {
  // Create a summary markdown file for PR comments
  const summary = [
    '# Codebase Assessment Summary',
    '',
    '## Architecture Assessment',
    '',
    `- **Patterns**: ${assessment.architectureAssessment.patterns.identified_patterns.join(', ')}`,
    `- **Anti-patterns**: ${assessment.architectureAssessment.patterns.anti_patterns.join(', ')}`,
    `- **Consistency Score**: ${assessment.architectureAssessment.patterns.consistency_score}/10`,
    '',
    '## Code Quality',
    '',
    `- **Maintainability Index**: ${assessment.codeQualityMatrix.maintainability_index}/100`,
    `- **Average Complexity**: ${assessment.codeQualityMatrix.cyclomatic_complexity.average}`,
    `- **Test Coverage**: ${assessment.codeQualityMatrix.code_coverage.unit_tests}%`,
    `- **Duplication**: ${assessment.codeQualityMatrix.duplication_percentage}%`,
    '',
    '## Opportunities',
    '',
    '### Refactoring Candidates',
    '',
  ];

  // Add refactoring candidates
  for (const candidate of assessment.opportunities.refactoringCandidates.slice(
    0,
    3
  )) {
    summary.push(`- **${candidate.name}**: ${candidate.description}`);
  }

  summary.push('');
  summary.push('### Enhancement Ideas');
  summary.push('');

  // Add enhancement ideas
  for (const idea of assessment.opportunities.enhancementIdeas.slice(0, 3)) {
    summary.push(`- **${idea.name}**: ${idea.description}`);
  }

  // Write the summary file
  fs.writeFileSync('assessment-summary.md', summary.join('\n'));
  core.info('Assessment summary generated');
}

// Run the action
run();
