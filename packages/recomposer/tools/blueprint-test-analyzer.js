/**
 * blueprint-test-analyzer.js
 *
 * A specialized tool to analyze test coverage for agent blueprints
 * and ensure all blueprint components are properly tested.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Configuration
const config = {
  testDir: path.join(__dirname, '..', 'src', '__tests__'),
  examplesDir: path.join(__dirname, '..', 'examples'),
  blueprintComponents: [
    'intent',
    'dominantSequence',
    'capabilities',
    'suggestedAgents',
    'refinementAnnotations',
    'metadata',
  ],
  composerOperations: [
    'compose',
    'mergeCapabilities',
    'mergeIntents',
    'mergeDominantSequences',
    'mergeSuggestedAgents',
    'mergeRefinementAnnotations',
  ],
  extractorOperations: [
    'extract',
    'identifyDependencies',
    'createMinimalViableModule',
  ],
  diffOperations: [
    'performDiff',
    'generateNarrative',
    'getCapabilityChanges',
    'getSimilarityScore',
  ],
};

/**
 * Main function to run the blueprint test analyzer
 */
async function main() {
  console.log(
    `${colors.bright}${colors.cyan}EchoForge Recomposer - Blueprint Test Analyzer${colors.reset}\n`
  );

  // Analyze test files
  const testFiles = findTestFiles();
  console.log(
    `${colors.bright}Found ${testFiles.length} test files:${colors.reset}`
  );
  testFiles.forEach((file) =>
    console.log(`  - ${path.relative(__dirname, file)}`)
  );
  console.log();

  // Analyze example blueprints
  const exampleBlueprints = findExampleBlueprints();
  console.log(
    `${colors.bright}Found ${exampleBlueprints.length} example blueprints:${colors.reset}`
  );
  exampleBlueprints.forEach((file) =>
    console.log(`  - ${path.relative(__dirname, file)}`)
  );
  console.log();

  // Analyze test coverage for blueprint components
  analyzeComponentCoverage(testFiles);

  // Analyze test coverage for operations
  analyzeOperationCoverage(testFiles);

  // Generate recommendations
  generateRecommendations(testFiles, exampleBlueprints);
}

/**
 * Find all test files in the test directory
 */
function findTestFiles() {
  const testFiles = [];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.test.ts')) {
        testFiles.push(fullPath);
      }
    }
  }

  scanDir(config.testDir);
  return testFiles;
}

/**
 * Find all example blueprint files
 */
function findExampleBlueprints() {
  const blueprintFiles = [];

  if (fs.existsSync(config.examplesDir)) {
    const entries = fs.readdirSync(config.examplesDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(config.examplesDir, entry.name);

      if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          // Check if it looks like a blueprint
          if (content.intent && content.capabilities) {
            blueprintFiles.push(fullPath);
          }
        } catch (error) {
          // Not a valid JSON file, skip
        }
      }
    }
  }

  return blueprintFiles;
}

/**
 * Analyze test coverage for blueprint components
 */
function analyzeComponentCoverage(testFiles) {
  console.log(
    `${colors.bright}Blueprint Component Test Coverage:${colors.reset}`
  );

  const componentCoverage = {};

  // Initialize component coverage
  for (const component of config.blueprintComponents) {
    componentCoverage[component] = {
      tested: false,
      files: [],
    };
  }

  // Scan test files for component references
  for (const file of testFiles) {
    const content = fs.readFileSync(file, 'utf8');

    for (const component of config.blueprintComponents) {
      if (content.includes(component)) {
        componentCoverage[component].tested = true;
        componentCoverage[component].files.push(path.relative(__dirname, file));
      }
    }
  }

  // Display component coverage
  for (const [component, coverage] of Object.entries(componentCoverage)) {
    const status = coverage.tested
      ? `${colors.green}✓${colors.reset}`
      : `${colors.red}✗${colors.reset}`;

    console.log(
      `  ${status} ${component.padEnd(20)} ${coverage.tested ? 'Tested' : 'Not tested'}`
    );

    if (coverage.tested && coverage.files.length > 0) {
      console.log(
        `    ${colors.dim}Found in: ${coverage.files.join(', ')}${colors.reset}`
      );
    }
  }

  console.log();
}

/**
 * Analyze test coverage for operations
 */
function analyzeOperationCoverage(testFiles) {
  console.log(`${colors.bright}Operation Test Coverage:${colors.reset}`);

  const categories = [
    { name: 'Composer Operations', operations: config.composerOperations },
    { name: 'Extractor Operations', operations: config.extractorOperations },
    { name: 'Diff Operations', operations: config.diffOperations },
  ];

  for (const category of categories) {
    console.log(`  ${colors.cyan}${category.name}:${colors.reset}`);

    const operationCoverage = {};

    // Initialize operation coverage
    for (const operation of category.operations) {
      operationCoverage[operation] = {
        tested: false,
        files: [],
      };
    }

    // Scan test files for operation references
    for (const file of testFiles) {
      const content = fs.readFileSync(file, 'utf8');

      for (const operation of category.operations) {
        if (content.includes(operation)) {
          operationCoverage[operation].tested = true;
          operationCoverage[operation].files.push(
            path.relative(__dirname, file)
          );
        }
      }
    }

    // Display operation coverage
    for (const [operation, coverage] of Object.entries(operationCoverage)) {
      const status = coverage.tested
        ? `${colors.green}✓${colors.reset}`
        : `${colors.red}✗${colors.reset}`;

      console.log(
        `    ${status} ${operation.padEnd(25)} ${coverage.tested ? 'Tested' : 'Not tested'}`
      );
    }

    console.log();
  }
}

/**
 * Generate recommendations for improving blueprint test coverage
 */
function generateRecommendations(testFiles, exampleBlueprints) {
  console.log(`${colors.bright}Recommendations:${colors.reset}`);

  const recommendations = [];

  // Check if all components are tested
  const untestedComponents = config.blueprintComponents.filter((component) => {
    const isTested = testFiles.some((file) => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes(component);
    });
    return !isTested;
  });

  if (untestedComponents.length > 0) {
    recommendations.push(
      `Add tests for untested blueprint components: ${untestedComponents.join(', ')}`
    );
  }

  // Check if all operations are tested
  const allOperations = [
    ...config.composerOperations,
    ...config.extractorOperations,
    ...config.diffOperations,
  ];

  const untestedOperations = allOperations.filter((operation) => {
    const isTested = testFiles.some((file) => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes(operation);
    });
    return !isTested;
  });

  if (untestedOperations.length > 0) {
    recommendations.push(
      `Add tests for untested operations: ${untestedOperations.join(', ')}`
    );
  }

  // Check if example blueprints are used in tests
  if (exampleBlueprints.length > 0) {
    const unusedBlueprints = exampleBlueprints.filter((blueprint) => {
      const blueprintName = path.basename(blueprint);
      const isUsed = testFiles.some((file) => {
        const content = fs.readFileSync(file, 'utf8');
        return content.includes(blueprintName);
      });
      return !isUsed;
    });

    if (unusedBlueprints.length > 0) {
      const unusedNames = unusedBlueprints.map((bp) => path.basename(bp));
      recommendations.push(
        `Use example blueprints in tests: ${unusedNames.join(', ')}`
      );
    }
  }

  // Add general recommendations
  if (testFiles.length < 3) {
    recommendations.push(
      'Create more test files to cover different aspects of blueprint handling'
    );
  }

  if (recommendations.length === 0) {
    console.log(
      `  ${colors.green}✓ All blueprint components and operations appear to be well tested!${colors.reset}`
    );
  } else {
    recommendations.forEach((rec) => console.log(`  - ${rec}`));
  }
}

// Run the analyzer
main().catch((error) => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
