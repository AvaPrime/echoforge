/**
 * compose-blueprints.js
 * Example script demonstrating how to use the BlueprintComposer
 */

const fs = require('fs');
const path = require('path');
const {
  BlueprintComposer,
  CapabilityExtractor,
  BlueprintDiff,
} = require('@echoforge/recomposer');

// Load blueprints
function loadBlueprint(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(content);
}

// Save blueprint to file
function saveBlueprint(blueprint, filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  fs.writeFileSync(fullPath, JSON.stringify(blueprint, null, 2), 'utf8');
  console.log(`Blueprint saved to ${fullPath}`);
}

// Main function
async function main() {
  console.log('Blueprint Composition Example');
  console.log('============================');

  // Load blueprints
  console.log('\nLoading blueprints...');
  const agent1 = loadBlueprint('./example-blueprints/agent1.json');
  const agent2 = loadBlueprint('./example-blueprints/agent2.json');

  console.log(`Loaded ${agent1.name} (${agent1.id})`);
  console.log(`Loaded ${agent2.name} (${agent2.id})`);

  // 1. Compose blueprints
  console.log('\n1. Composing blueprints...');
  const composer = new BlueprintComposer({
    conflictStrategy: 'CONSERVATIVE',
    autoRefine: true,
    maintainLineage: true,
  });

  const composedBlueprint = await composer.compose([agent1, agent2]);
  console.log(
    `Created composed blueprint: ${composedBlueprint.name} (${composedBlueprint.id})`
  );
  console.log(
    `Combined ${Object.keys(composedBlueprint.capabilities).length} capabilities`
  );

  // Save the composed blueprint
  saveBlueprint(composedBlueprint, './output/composed-blueprint.json');

  // 2. Extract a capability
  console.log('\n2. Extracting a capability...');
  const extractor = new CapabilityExtractor();

  const extractedCapability = await extractor.extract(agent1, {
    selector: 'analyze_sentiment',
    selectorType: 'FUNCTION',
    includeRelatedFunctions: true,
    generateMinimalViableModule: true,
  });

  console.log(
    `Extracted capability: ${extractedCapability.name} (${extractedCapability.id})`
  );
  console.log(
    `Extracted ${Object.keys(extractedCapability.capabilities).length} capabilities`
  );

  // Save the extracted capability
  saveBlueprint(extractedCapability, './output/extracted-capability.json');

  // 3. Generate a diff
  console.log('\n3. Generating blueprint diff...');
  const diff = BlueprintDiff.compare(agent1, composedBlueprint);
  const narrative = diff.generateNarrative();

  console.log('Diff Summary:');
  console.log(`- Similarity Score: ${diff.similarityScore.toFixed(2)}`);
  console.log(
    `- Added Capabilities: ${diff.changes.filter((c) => c.type === 'ADDED').length}`
  );
  console.log(
    `- Modified Capabilities: ${diff.changes.filter((c) => c.type === 'MODIFIED').length}`
  );
  console.log(
    `- Unchanged Capabilities: ${diff.changes.filter((c) => c.type === 'UNCHANGED').length}`
  );

  // Save the diff narrative
  fs.writeFileSync(
    path.resolve(__dirname, './output/blueprint-diff.txt'),
    narrative,
    'utf8'
  );
  console.log('Diff narrative saved to ./output/blueprint-diff.txt');

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
