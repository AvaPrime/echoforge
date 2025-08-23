#!/usr/bin/env node

/**
 * CI/CD pipeline script to validate blueprints
 *
 * This script can be used in a CI/CD pipeline to validate all blueprints in a directory
 * and fail the build if any blueprint fails validation.
 *
 * Usage:
 * node ci-validation.js path/to/blueprints/directory
 */

const fs = require('fs');
const path = require('path');
const { ValidatorEngine, ValidationStatus } = require('../dist');

// Get the blueprints directory from command line arguments
const blueprintsDir = process.argv[2];

if (!blueprintsDir) {
  console.error(
    'Error: Please provide a path to a directory containing blueprint JSON files'
  );
  console.error('Usage: node ci-validation.js path/to/blueprints/directory');
  process.exit(1);
}

// Load all blueprints from the directory
let blueprints = [];
try {
  const fullPath = path.resolve(blueprintsDir);
  const files = fs.readdirSync(fullPath);

  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(fullPath, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const blueprint = JSON.parse(content);
        blueprints.push(blueprint);
      } catch (error) {
        console.warn(
          `Skipping invalid blueprint file ${file}: ${error.message}`
        );
      }
    }
  }
} catch (error) {
  console.error(`Error loading blueprints: ${error.message}`);
  process.exit(1);
}

if (blueprints.length === 0) {
  console.error('Error: No valid blueprint files found in the directory');
  process.exit(1);
}

console.log(`Found ${blueprints.length} blueprint(s) to validate`);

// Create a validator engine in headless mode for CI/CD
const validator = ValidatorEngine.createHeadless({
  continueOnFailure: true, // Continue validation even if assertions fail
});

// Validate all blueprints
console.log('Starting validation...');

validator
  .validateBlueprintBatch(blueprints)
  .then((results) => {
    console.log('\n=== Validation Results ===');

    let totalPassed = 0;
    let totalFailed = 0;

    for (const result of results) {
      const blueprint = blueprints.find((bp) => bp.id === result.blueprintId);
      const blueprintName = blueprint ? blueprint.name : result.blueprintId;

      console.log(`\n${blueprintName}: ${result.status}`);
      console.log(
        `Passed: ${result.summary.passed}, Failed: ${result.summary.failed}, Errors: ${result.summary.errors}`
      );

      if (result.status === ValidationStatus.PASSED) {
        totalPassed++;
      } else {
        totalFailed++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total Blueprints: ${results.length}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);

    // Set exit code based on validation results
    if (totalFailed > 0) {
      console.error('\nValidation failed!');
      process.exit(1);
    } else {
      console.log('\nAll blueprints passed validation!');
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error(`Error validating blueprints: ${error.message}`);
    process.exit(1);
  });
