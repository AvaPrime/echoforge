/**
 * run-analyzers.js
 *
 * Script to run both the coverage analyzer and blueprint test analyzer
 * to provide a comprehensive view of test coverage.
 */

const { execSync } = require('child_process');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

console.log(
  `${colors.bright}${colors.cyan}EchoForge Recomposer - Test Coverage Analysis${colors.reset}\n`
);

// First run the tests to ensure we have fresh coverage data
console.log(`${colors.bright}Running tests with coverage...${colors.reset}`);
try {
  execSync('npm run test:coverage', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Tests completed successfully${colors.reset}\n`);
} catch (error) {
  console.error(`${colors.red}✗ Tests failed${colors.reset}\n`);
  process.exit(1);
}

// Run the coverage analyzer
console.log(
  `${colors.bright}${colors.cyan}Running Coverage Analyzer...${colors.reset}\n`
);
try {
  execSync('node tools/coverage-analyzer.js', { stdio: 'inherit' });
  console.log();
} catch (error) {
  console.error(`${colors.red}✗ Coverage analyzer failed${colors.reset}\n`);
  console.error(error.message);
}

// Run the blueprint test analyzer
console.log(
  `${colors.bright}${colors.cyan}Running Blueprint Test Analyzer...${colors.reset}\n`
);
try {
  execSync('node tools/blueprint-test-analyzer.js', { stdio: 'inherit' });
  console.log();
} catch (error) {
  console.error(
    `${colors.red}✗ Blueprint test analyzer failed${colors.reset}\n`
  );
  console.error(error.message);
}

console.log(`${colors.bright}${colors.green}Analysis Complete!${colors.reset}`);
console.log(
  `${colors.cyan}Review the results above to identify areas for test improvement.${colors.reset}`
);
console.log(
  `${colors.cyan}For detailed coverage information, see the coverage report at:${colors.reset}`
);
console.log(
  `${colors.yellow}./coverage/lcov-report/index.html${colors.reset}\n`
);
