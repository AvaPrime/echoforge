/**
 * ci-test.js
 * Script to run tests in CI environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

console.log(
  `${colors.bright}${colors.cyan}Running EchoForge Recomposer CI Tests${colors.reset}\n`
);

try {
  // Run tests with coverage in CI mode
  console.log(
    `${colors.bright}Running tests with coverage in CI mode...${colors.reset}`
  );
  execSync('npm run test:ci', { stdio: 'inherit' });

  // Check if coverage directory exists
  const coverageDir = path.join(__dirname, 'coverage');
  const lcovReportDir = path.join(coverageDir, 'lcov-report');

  if (fs.existsSync(lcovReportDir)) {
    console.log(
      `\n${colors.bright}${colors.green}✓ Coverage report generated successfully${colors.reset}`
    );

    // Read coverage summary
    const summaryPath = path.join(coverageDir, 'coverage-summary.json');
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      const total = summary.total;

      console.log(`${colors.bright}Coverage Summary:${colors.reset}`);
      console.log(
        `${colors.cyan}Statements:${colors.reset} ${formatCoverage(total.statements.pct)}%`
      );
      console.log(
        `${colors.cyan}Branches:${colors.reset}   ${formatCoverage(total.branches.pct)}%`
      );
      console.log(
        `${colors.cyan}Functions:${colors.reset}  ${formatCoverage(total.functions.pct)}%`
      );
      console.log(
        `${colors.cyan}Lines:${colors.reset}      ${formatCoverage(total.lines.pct)}%\n`
      );

      // Check if coverage thresholds are met
      const thresholds = {
        statements: 75,
        branches: 70,
        functions: 80,
        lines: 75,
      };

      let thresholdsFailed = false;

      if (total.statements.pct < thresholds.statements) {
        console.log(
          `${colors.red}✗ Statement coverage below threshold: ${total.statements.pct}% < ${thresholds.statements}%${colors.reset}`
        );
        thresholdsFailed = true;
      }

      if (total.branches.pct < thresholds.branches) {
        console.log(
          `${colors.red}✗ Branch coverage below threshold: ${total.branches.pct}% < ${thresholds.branches}%${colors.reset}`
        );
        thresholdsFailed = true;
      }

      if (total.functions.pct < thresholds.functions) {
        console.log(
          `${colors.red}✗ Function coverage below threshold: ${total.functions.pct}% < ${thresholds.functions}%${colors.reset}`
        );
        thresholdsFailed = true;
      }

      if (total.lines.pct < thresholds.lines) {
        console.log(
          `${colors.red}✗ Line coverage below threshold: ${total.lines.pct}% < ${thresholds.lines}%${colors.reset}`
        );
        thresholdsFailed = true;
      }

      if (thresholdsFailed) {
        console.log(
          `\n${colors.red}Coverage thresholds not met. CI build failed.${colors.reset}`
        );
        process.exit(1);
      } else {
        console.log(
          `${colors.green}✓ All coverage thresholds met!${colors.reset}`
        );
      }
    }
  } else {
    console.log(
      `\n${colors.yellow}⚠ Coverage report directory not found${colors.reset}`
    );
    process.exit(1);
  }

  console.log(
    `${colors.bright}${colors.green}All tests completed successfully!${colors.reset}`
  );
} catch (error) {
  console.error(
    `\n${colors.bright}${colors.red}Error running tests:${colors.reset}\n`,
    error.message
  );
  process.exit(1);
}

/**
 * Format coverage percentage with color coding
 * @param {number} value - Coverage percentage
 * @returns {string} - Formatted coverage string
 */
function formatCoverage(value) {
  if (value === undefined) return `${colors.yellow}N/A${colors.reset}`;

  const colorCode =
    value >= 80 ? colors.green : value >= 60 ? colors.yellow : colors.red;

  return `${colorCode}${value.toFixed(2)}${colors.reset}`;
}
