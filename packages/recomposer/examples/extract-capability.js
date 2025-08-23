/**
 * extract-capability.js
 * Example script demonstrating how to use the CapabilityExtractor
 */

const fs = require('fs');
const path = require('path');
const { CapabilityExtractor } = require('@echoforge/recomposer');

// Load blueprint
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
  console.log('Capability Extraction Example');
  console.log('============================');

  // Load blueprint
  console.log('\nLoading blueprint...');
  const blueprint = loadBlueprint('./example-blueprints/agent1.json');
  console.log(`Loaded ${blueprint.name} (${blueprint.id})`);

  // Create extractor
  const extractor = new CapabilityExtractor();

  // 1. Extract a single function
  console.log('\n1. Extracting a single function...');
  const singleFunction = await extractor.extract(blueprint, {
    selector: 'analyze_sentiment',
    selectorType: 'FUNCTION',
    includeRelatedFunctions: false,
    generateMinimalViableModule: true,
  });

  console.log(
    `Extracted function: ${Object.keys(singleFunction.capabilities)[0]}`
  );
  saveBlueprint(singleFunction, './output/single-function.json');

  // 2. Extract a function with related functions
  console.log('\n2. Extracting a function with related functions...');
  const functionWithRelated = await extractor.extract(blueprint, {
    selector: 'extract_entities',
    selectorType: 'FUNCTION',
    includeRelatedFunctions: true,
    generateMinimalViableModule: true,
  });

  console.log(
    `Extracted function with related functions: ${Object.keys(functionWithRelated.capabilities).length} capabilities`
  );
  saveBlueprint(functionWithRelated, './output/function-with-related.json');

  // 3. Extract by intent tag
  console.log('\n3. Extracting by intent tag...');
  const intentTagExtraction = await extractor.extract(blueprint, {
    selector: 'sentiment',
    selectorType: 'INTENT_TAG',
    includeRelatedFunctions: true,
    generateMinimalViableModule: true,
  });

  console.log(
    `Extracted by intent tag: ${Object.keys(intentTagExtraction.capabilities).length} capabilities`
  );
  saveBlueprint(intentTagExtraction, './output/intent-tag-extraction.json');

  // 4. Extract a capability
  console.log('\n4. Extracting a capability...');
  const capabilityExtraction = await extractor.extract(blueprint, {
    selector: 'analyze_sentiment',
    selectorType: 'CAPABILITY',
    includeRelatedFunctions: true,
    generateMinimalViableModule: true,
    maxDependencyDepth: 2,
  });

  console.log(
    `Extracted capability: ${Object.keys(capabilityExtraction.capabilities).length} capabilities`
  );
  saveBlueprint(capabilityExtraction, './output/capability-extraction.json');

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
