#!/usr/bin/env node

// Test script for the Codalism Interpreter CLI Refinement Loop
console.log('🧪 Testing Codalism Interpreter CLI Refinement Loop');
console.log('='.repeat(60));

// Import required modules
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create a test file
const testDir = path.join(__dirname, 'test-refinement');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Create a simple test file
const testFilePath = path.join(testDir, 'test_function.js');
const testFileContent = `
/**
 * A simple function to test the refinement loop
 */
function processData(data) {
  // Validate input
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }
  
  // Extract relevant fields
  const { name, values } = data;
  
  // Process the values
  const result = values.map(val => val * 2);
  
  // Return processed data
  return {
    name,
    processed: result,
    timestamp: new Date().toISOString()
  };
}

// Export the function
module.exports = { processData };
`;

fs.writeFileSync(testFilePath, testFileContent);
console.log(`✅ Created test file: ${testFilePath}`);

// Test the analyze command
console.log('\n🔍 Testing analyze command...');
try {
  const analyzeOutput = execSync(
    `npx ts-node codalism_cli.ts analyze ${testFilePath}`,
    { encoding: 'utf8' }
  );
  console.log('✅ Analyze command successful');
} catch (error) {
  console.error(`❌ Analyze command failed: ${error.message}`);
  process.exit(1);
}

// Test the refine command in batch mode
console.log('\n🔄 Testing refine command in batch mode...');
try {
  const refineOutput = execSync(
    `npx ts-node codalism_cli.ts refine ${testFilePath} --batch`,
    { encoding: 'utf8' }
  );
  console.log('✅ Refine command successful in batch mode');

  // Check if blueprint was created
  const blueprintPath = path.join(
    testDir,
    '.codessa',
    'processData.blueprint.json'
  );
  if (fs.existsSync(blueprintPath)) {
    console.log(`✅ Blueprint file created: ${blueprintPath}`);

    // Read and display the blueprint
    const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
    console.log('\n📝 Blueprint content:');
    console.log('-'.repeat(60));
    console.log(JSON.stringify(blueprint, null, 2));
    console.log('-'.repeat(60));

    // Check if refinement data exists
    if (blueprint.refinement) {
      console.log('\n✅ Refinement data found in blueprint');
    } else {
      console.log('\n⚠️ No refinement data found in blueprint');
    }
  } else {
    console.log(`❌ Blueprint file not created: ${blueprintPath}`);
  }
} catch (error) {
  console.error(`❌ Refine command failed: ${error.message}`);
  process.exit(1);
}

// Test the generate command with the refined blueprint
console.log('\n🔧 Testing generate command with refined blueprint...');
try {
  const generateOutput = execSync(
    `npx ts-node codalism_cli.ts generate ${testDir}`,
    { encoding: 'utf8' }
  );
  console.log('✅ Generate command successful');

  // Check if agent was created
  const agentPath = path.join(
    testDir,
    '.codessa',
    'agents',
    'processDataAgent.ts'
  );
  if (fs.existsSync(agentPath)) {
    console.log(`✅ Agent file created: ${agentPath}`);

    // Read and display the agent
    const agentCode = fs.readFileSync(agentPath, 'utf8');
    console.log('\n📝 Agent code:');
    console.log('-'.repeat(60));
    console.log(agentCode);
    console.log('-'.repeat(60));
  } else {
    console.log(`❌ Agent file not created: ${agentPath}`);
  }
} catch (error) {
  console.error(`❌ Generate command failed: ${error.message}`);
  process.exit(1);
}

console.log('\n🎉 All tests completed successfully!');
