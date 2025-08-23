/**
 * Living Documentation Update Script
 *
 * This script updates the living documentation based on the latest assessment results.
 * It is designed to be run as part of the CI/CD pipeline or manually.
 */

const path = require('path');
const fs = require('fs');
const { createAssessmentAgent } = require('../lib/agent');
const { generateDocumentation } = require('../lib/documentation-generator');
const config = require('../config');

/**
 * Update living documentation based on latest assessment results
 */
async function updateLivingDocumentation() {
  console.log('Updating living documentation...');

  // Load the latest assessment results
  const assessmentResults = loadLatestAssessmentResults();

  if (!assessmentResults) {
    console.error('No assessment results found. Run an assessment first.');
    process.exit(1);
  }

  // Create assessment agent
  const agent = createAssessmentAgent(config);

  // Generate documentation
  const documentation = await agent.generateDocumentation(assessmentResults);

  // Save documentation to output directory
  saveDocumentation(documentation);

  // Generate summary
  generateSummary(documentation);

  console.log('Living documentation updated successfully.');
}

/**
 * Load the latest assessment results from the output directory
 * @returns {Object} Latest assessment results
 */
function loadLatestAssessmentResults() {
  const analysisDir = path.join(__dirname, '../output/analysis');

  // Find the latest assessment result file
  const files = fs
    .readdirSync(analysisDir)
    .filter((file) => file.startsWith('assessment-') && file.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    return null;
  }

  // Load the latest assessment results
  const latestFile = path.join(analysisDir, files[0]);
  return JSON.parse(fs.readFileSync(latestFile, 'utf8'));
}

/**
 * Save documentation to output directory
 * @param {Object} documentation - Generated documentation
 */
function saveDocumentation(documentation) {
  const outputDir = path.join(__dirname, '../output/living-docs');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save each document
  for (const [docName, content] of Object.entries(documentation)) {
    const filePath = path.join(outputDir, `${docName}.md`);
    fs.writeFileSync(filePath, content);
    console.log(`Saved ${docName} to ${filePath}`);
  }

  // Save metadata
  const metadata = {
    lastUpdated: new Date().toISOString(),
    documents: Object.keys(documentation),
  };

  fs.writeFileSync(
    path.join(outputDir, 'documentation-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
}

/**
 * Generate a summary of the documentation updates
 * @param {Object} documentation - Generated documentation
 */
function generateSummary(documentation) {
  const summaryPath = path.join(__dirname, '../assessment-summary.md');

  // Create a summary of the documentation updates
  const summary = [
    '# Codebase Assessment Summary',
    '',
    `**Generated**: ${new Date().toISOString()}`,
    '',
    '## Updated Documentation',
    '',
  ];

  // Add each document to the summary
  for (const docName of Object.keys(documentation)) {
    summary.push(
      `- ${docName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`
    );
  }

  // Add a link to the full documentation
  summary.push('');
  summary.push('## View Full Documentation');
  summary.push('');
  summary.push(
    'The complete living documentation is available in the `output/living-docs` directory.'
  );

  // Save the summary
  fs.writeFileSync(summaryPath, summary.join('\n'));
  console.log(`Generated assessment summary at ${summaryPath}`);
}

// Run the update if this script is executed directly
if (require.main === module) {
  updateLivingDocumentation().catch((error) => {
    console.error('Error updating living documentation:', error);
    process.exit(1);
  });
}

module.exports = {
  updateLivingDocumentation,
};
