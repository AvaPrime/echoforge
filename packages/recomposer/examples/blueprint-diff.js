/**
 * blueprint-diff.js
 * Example script demonstrating how to use the BlueprintDiff
 */

const fs = require('fs');
const path = require('path');
const { BlueprintDiff } = require('@echoforge/recomposer');

// Load blueprint
function loadBlueprint(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(content);
}

// Main function
async function main() {
  console.log('Blueprint Diff Example');
  console.log('======================');

  // Load blueprints
  console.log('\nLoading blueprints...');
  const originalBlueprint = loadBlueprint('./example-blueprints/agent1.json');
  const modifiedBlueprint = loadBlueprint('./example-blueprints/agent2.json');

  console.log(
    `Loaded original blueprint: ${originalBlueprint.name} (${originalBlueprint.id})`
  );
  console.log(
    `Loaded modified blueprint: ${modifiedBlueprint.name} (${modifiedBlueprint.id})`
  );

  // Generate diff
  console.log('\nGenerating diff...');
  const diff = BlueprintDiff.compare(originalBlueprint, modifiedBlueprint);

  // Print diff summary
  console.log('\nDiff Summary:');
  console.log(`Similarity Score: ${diff.similarityScore.toFixed(2)}`);
  console.log(`Total Changes: ${diff.changes.length}`);

  // Count changes by type
  const addedCount = diff.changes.filter((c) => c.type === 'ADDED').length;
  const removedCount = diff.changes.filter((c) => c.type === 'REMOVED').length;
  const modifiedCount = diff.changes.filter(
    (c) => c.type === 'MODIFIED'
  ).length;
  const unchangedCount = diff.changes.filter(
    (c) => c.type === 'UNCHANGED'
  ).length;

  console.log(`Added: ${addedCount}`);
  console.log(`Removed: ${removedCount}`);
  console.log(`Modified: ${modifiedCount}`);
  console.log(`Unchanged: ${unchangedCount}`);

  // Generate and print narrative
  console.log('\nDiff Narrative:');
  const narrative = diff.generateNarrative();
  console.log(narrative);

  // Save narrative to file
  const outputPath = path.resolve(
    __dirname,
    './output/blueprint-diff-narrative.txt'
  );
  fs.writeFileSync(outputPath, narrative, 'utf8');
  console.log(`\nNarrative saved to ${outputPath}`);

  // Generate detailed diff report
  console.log('\nGenerating detailed diff report...');
  let detailedReport = 'Blueprint Diff Detailed Report\n';
  detailedReport += '==============================\n\n';

  detailedReport += `Original Blueprint: ${originalBlueprint.name} (${originalBlueprint.id})\n`;
  detailedReport += `Modified Blueprint: ${modifiedBlueprint.name} (${modifiedBlueprint.id})\n\n`;

  detailedReport += `Similarity Score: ${diff.similarityScore.toFixed(2)}\n\n`;

  detailedReport += 'Changes by Category:\n';
  detailedReport += `- Added: ${addedCount}\n`;
  detailedReport += `- Removed: ${removedCount}\n`;
  detailedReport += `- Modified: ${modifiedCount}\n`;
  detailedReport += `- Unchanged: ${unchangedCount}\n\n`;

  detailedReport += 'Detailed Changes:\n';

  // Group changes by type
  const added = diff.changes.filter((c) => c.type === 'ADDED');
  const removed = diff.changes.filter((c) => c.type === 'REMOVED');
  const modified = diff.changes.filter((c) => c.type === 'MODIFIED');

  // Added changes
  if (added.length > 0) {
    detailedReport += '\nADDED:\n';
    added.forEach((change) => {
      detailedReport += `- ${change.path}\n`;
      if (change.importance) {
        detailedReport += `  Importance: ${change.importance}\n`;
      }
    });
  }

  // Removed changes
  if (removed.length > 0) {
    detailedReport += '\nREMOVED:\n';
    removed.forEach((change) => {
      detailedReport += `- ${change.path}\n`;
      if (change.importance) {
        detailedReport += `  Importance: ${change.importance}\n`;
      }
    });
  }

  // Modified changes
  if (modified.length > 0) {
    detailedReport += '\nMODIFIED:\n';
    modified.forEach((change) => {
      detailedReport += `- ${change.path}\n`;
      if (change.importance) {
        detailedReport += `  Importance: ${change.importance}\n`;
      }

      // For modified capabilities, show a simple diff
      if (change.path.startsWith('capabilities.')) {
        detailedReport += `  Original description: ${change.originalValue?.description || 'N/A'}\n`;
        detailedReport += `  New description: ${change.newValue?.description || 'N/A'}\n`;
      }
    });
  }

  // Save detailed report
  const detailedReportPath = path.resolve(
    __dirname,
    './output/blueprint-diff-detailed.txt'
  );
  fs.writeFileSync(detailedReportPath, detailedReport, 'utf8');
  console.log(`Detailed report saved to ${detailedReportPath}`);

  console.log('\nExample completed successfully!');
}

// Create output directory if it doesn't exist
if (!fs.existsSync(path.resolve(__dirname, './output'))) {
  fs.mkdirSync(path.resolve(__dirname, './output'));
}

// Run the example
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
