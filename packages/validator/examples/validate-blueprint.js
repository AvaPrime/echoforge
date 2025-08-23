#!/usr/bin/env node

/**
 * Simple example script to validate a blueprint using the Blueprint Test Validator Engine
 *
 * Usage:
 * node validate-blueprint.js path/to/blueprint.json
 */

const fs = require('fs');
const path = require('path');
const { ValidatorEngine, ValidationStatus } = require('../dist');

// Get the blueprint path from command line arguments
const blueprintPath = process.argv[2];

if (!blueprintPath) {
  console.error('Error: Please provide a path to a blueprint JSON file');
  console.error('Usage: node validate-blueprint.js path/to/blueprint.json');
  process.exit(1);
}

// Load the blueprint
let blueprint;
try {
  const fullPath = path.resolve(blueprintPath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  blueprint = JSON.parse(content);
} catch (error) {
  console.error(`Error loading blueprint: ${error.message}`);
  process.exit(1);
}

// Create a validator engine
const validator = new ValidatorEngine();

// Validate the blueprint
console.log(`Validating blueprint: ${blueprint.name} (${blueprint.id})`);

validator
  .validateBlueprint(blueprint)
  .then((result) => {
    console.log('\n=== Validation Result ===');
    console.log(`Status: ${result.status}`);
    console.log('\nSummary:');
    console.log(`Total: ${result.summary.total}`);
    console.log(`Passed: ${result.summary.passed}`);
    console.log(`Failed: ${result.summary.failed}`);
    console.log(`Errors: ${result.summary.errors}`);
    console.log(`Warnings: ${result.summary.warnings}`);
    console.log(`Skipped: ${result.summary.skipped}`);

    console.log('\nExecution Time:');
    console.log(`${result.executionTime}ms`);

    if (result.assertionResults && result.assertionResults.length > 0) {
      console.log('\nAssertion Results:');

      for (const assertionResult of result.assertionResults) {
        const assertion = assertionResult.assertion;

        console.log(`\n[${assertionResult.status}] ${assertion.description}`);
        console.log(`Type: ${assertion.type}`);
        console.log(`Target Function: ${assertion.targetFunction}`);
        console.log(
          `Expected Outcome: ${JSON.stringify(assertion.expectedOutcome)}`
        );

        if (assertionResult.actualOutcome !== undefined) {
          console.log(
            `Actual Outcome: ${JSON.stringify(assertionResult.actualOutcome)}`
          );
        }

        if (assertionResult.errorMessage) {
          console.log(`Error: ${assertionResult.errorMessage}`);
        }

        if (
          assertionResult.suggestions &&
          assertionResult.suggestions.length > 0
        ) {
          console.log('\nSuggestions:');
          for (const suggestion of assertionResult.suggestions) {
            console.log(`- ${suggestion}`);
          }
        }
      }
    }

    // Set exit code based on validation result
    if (result.status === ValidationStatus.PASSED) {
      console.log('\nValidation passed!');
      process.exit(0);
    } else {
      console.error('\nValidation failed!');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error(`Error validating blueprint: ${error.message}`);
    process.exit(1);
  });
