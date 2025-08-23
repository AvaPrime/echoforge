/**
 * Basic example of using the Codalism Interpreter
 */

import { CodalismInterpreter } from '../interpreter/CodalismInterpreter';

/**
 * A simple example showing how to use the Codalism Interpreter
 * to transform natural language into a semantic blueprint
 */
async function runExample() {
  // Create an interpreter instance
  const interpreter = new CodalismInterpreter();

  // Define a system through natural language
  const input =
    'Create a system that reads user input from a CLI, stores it in a searchable memory, and analyzes it for emotional tone.';

  console.log('Input:', input);
  console.log('\nInterpreting...');

  // Generate a semantic blueprint
  const blueprint = await interpreter.interpret(input);

  // Display the results
  console.log('\nGenerated Blueprint:\n');
  console.log(`Name: ${blueprint.name}`);
  console.log(`Description: ${blueprint.description}`);

  console.log('\nIntents:');
  blueprint.intents.forEach((intent) => {
    console.log(`- ${intent.description}`);
  });

  console.log('\nModules:');
  blueprint.modules.forEach((module) => {
    console.log(`- ${module.name}: ${module.description}`);
    console.log(`  Responsibilities:`);
    module.responsibilities.forEach((resp) => {
      console.log(`  * ${resp}`);
    });
  });

  console.log('\nRelationships:');
  blueprint.relationships.forEach((rel) => {
    console.log(`- ${rel.description}`);
  });
}

// Run the example
runExample().catch((error) => {
  console.error('Error running example:', error);
});
