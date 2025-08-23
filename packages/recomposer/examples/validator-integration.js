/**
 * validator-integration.js
 * Example script demonstrating integration between the Recomposer and Validator Engine
 */

const fs = require('fs');
const path = require('path');
const { BlueprintComposer } = require('@echoforge/recomposer');
const { ValidatorEngine } = require('@echoforge/validator');

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
  console.log('Recomposer-Validator Integration Example');
  console.log('======================================');

  // Load blueprints
  console.log('\nLoading blueprints...');
  const agent1 = loadBlueprint('./example-blueprints/agent1.json');
  const agent2 = loadBlueprint('./example-blueprints/agent2.json');

  console.log(`Loaded ${agent1.name} (${agent1.id})`);
  console.log(`Loaded ${agent2.name} (${agent2.id})`);

  // 1. Validate individual blueprints first
  console.log('\n1. Validating individual blueprints...');
  const validator = new ValidatorEngine();

  console.log(`\nValidating ${agent1.name}...`);
  const agent1ValidationResult = await validator.validate(agent1);
  printValidationResult(agent1ValidationResult);

  console.log(`\nValidating ${agent2.name}...`);
  const agent2ValidationResult = await validator.validate(agent2);
  printValidationResult(agent2ValidationResult);

  // 2. Compose blueprints with validation
  console.log('\n2. Composing blueprints with validation...');
  const composer = new BlueprintComposer({
    conflictStrategy: 'CONSERVATIVE',
    autoRefine: true,
    maintainLineage: true,
    validateAfterComposition: true, // Enable validation after composition
    validatorEngine: validator, // Use the same validator instance
  });

  const composedBlueprint = await composer.compose([agent1, agent2]);
  console.log(
    `Created composed blueprint: ${composedBlueprint.name} (${composedBlueprint.id})`
  );
  console.log(
    `Combined ${Object.keys(composedBlueprint.capabilities).length} capabilities`
  );

  // Save the composed blueprint
  saveBlueprint(
    composedBlueprint,
    './output/validated-composed-blueprint.json'
  );

  // 3. Validate the composed blueprint again (for demonstration)
  console.log('\n3. Validating the composed blueprint...');
  const composedValidationResult = await validator.validate(composedBlueprint);
  printValidationResult(composedValidationResult);

  // 4. Generate validation report
  console.log('\n4. Generating validation report...');
  const validationReport = generateValidationReport(composedValidationResult);

  // Save validation report
  const reportPath = path.resolve(__dirname, './output/validation-report.txt');
  fs.writeFileSync(reportPath, validationReport, 'utf8');
  console.log(`Validation report saved to ${reportPath}`);

  console.log('\nExample completed successfully!');
}

// Helper function to print validation result
function printValidationResult(result) {
  if (result.status === 'success') {
    console.log(`✅ Validation successful!`);
    console.log(`   Passed ${result.summary.passed} assertions`);
  } else {
    console.log(`❌ Validation failed!`);
    console.log(
      `   Failed ${result.summary.failed} of ${result.summary.total} assertions`
    );

    // Print failed assertions
    const failedAssertions = result.assertions.filter((a) => !a.passed);
    if (failedAssertions.length > 0) {
      console.log('\n   Failed Assertions:');
      failedAssertions.slice(0, 3).forEach((assertion) => {
        console.log(`   - ${assertion.description}`);
        console.log(`     Suggestion: ${assertion.suggestion}`);
      });

      if (failedAssertions.length > 3) {
        console.log(`   ... and ${failedAssertions.length - 3} more failures`);
      }
    }
  }
}

// Generate a validation report
function generateValidationReport(result) {
  let report = 'Blueprint Validation Report\n';
  report += '==========================\n\n';

  report += `Status: ${result.status === 'success' ? 'PASSED' : 'FAILED'}\n`;
  report += `Execution Time: ${result.executionTime}ms\n\n`;

  report += 'Summary:\n';
  report += `- Total Assertions: ${result.summary.total}\n`;
  report += `- Passed: ${result.summary.passed}\n`;
  report += `- Failed: ${result.summary.failed}\n`;
  report += `- Pass Rate: ${((result.summary.passed / result.summary.total) * 100).toFixed(2)}%\n\n`;

  report += 'Assertions:\n';
  result.assertions.forEach((assertion, index) => {
    report += `\n${index + 1}. ${assertion.passed ? '✅' : '❌'} ${assertion.description}\n`;
    if (!assertion.passed) {
      report += `   Suggestion: ${assertion.suggestion}\n`;
    }
  });

  return report;
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
