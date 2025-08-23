/**
 * coverage-analyzer.js
 *
 * A tool to analyze test coverage and identify areas for improvement
 * in the recomposer package.
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
  coveragePath: path.join(__dirname, '..', 'coverage', 'coverage-summary.json'),
  srcPath: path.join(__dirname, '..', 'src'),
  thresholds: {
    statements: 75,
    branches: 70,
    functions: 80,
    lines: 75,
  },
  excludePatterns: ['interfaces', '__tests__', '.d.ts'],
};

/**
 * Main function to run the coverage analyzer
 */
async function main() {
  console.log(
    `${colors.bright}${colors.cyan}EchoForge Recomposer - Coverage Analyzer${colors.reset}\n`
  );

  // Check if coverage data exists, if not run the tests
  if (!fs.existsSync(config.coveragePath)) {
    console.log(
      `${colors.yellow}No coverage data found. Running tests...${colors.reset}`
    );
    try {
      execSync('npm run test:coverage', { stdio: 'inherit' });
    } catch (error) {
      console.error(
        `${colors.red}Failed to run tests:${colors.reset}`,
        error.message
      );
      process.exit(1);
    }
  }

  // Read coverage data
  let coverageData;
  try {
    coverageData = JSON.parse(fs.readFileSync(config.coveragePath, 'utf8'));
  } catch (error) {
    console.error(
      `${colors.red}Failed to read coverage data:${colors.reset}`,
      error.message
    );
    process.exit(1);
  }

  // Analyze overall coverage
  analyzeOverallCoverage(coverageData.total);

  // Analyze file-level coverage
  analyzeFileCoverage(coverageData);

  // Generate recommendations
  generateRecommendations(coverageData);
}

/**
 * Analyze and display overall coverage metrics
 */
function analyzeOverallCoverage(totalCoverage) {
  console.log(`${colors.bright}Overall Coverage:${colors.reset}`);

  const metrics = [
    {
      name: 'Statements',
      value: totalCoverage.statements.pct,
      threshold: config.thresholds.statements,
    },
    {
      name: 'Branches',
      value: totalCoverage.branches.pct,
      threshold: config.thresholds.branches,
    },
    {
      name: 'Functions',
      value: totalCoverage.functions.pct,
      threshold: config.thresholds.functions,
    },
    {
      name: 'Lines',
      value: totalCoverage.lines.pct,
      threshold: config.thresholds.lines,
    },
  ];

  const table = metrics
    .map((metric) => {
      const status =
        metric.value >= metric.threshold
          ? `${colors.green}✓${colors.reset}`
          : `${colors.red}✗${colors.reset}`;

      const colorCode =
        metric.value >= metric.threshold ? colors.green : colors.red;

      return `  ${status} ${metric.name.padEnd(12)} ${colorCode}${metric.value.toFixed(2)}%${colors.reset} (threshold: ${metric.threshold}%)`;
    })
    .join('\n');

  console.log(table);
  console.log();
}

/**
 * Analyze and display file-level coverage
 */
function analyzeFileCoverage(coverageData) {
  console.log(`${colors.bright}File Coverage:${colors.reset}`);

  const fileEntries = Object.entries(coverageData)
    .filter(([key]) => key !== 'total' && !isExcluded(key))
    .map(([filePath, data]) => {
      const relativePath = filePath.replace(path.dirname(config.srcPath), '');
      return {
        path: relativePath,
        statements: data.statements.pct,
        branches: data.branches.pct,
        functions: data.functions.pct,
        lines: data.lines.pct,
        // Calculate average coverage
        average:
          (data.statements.pct +
            data.branches.pct +
            data.functions.pct +
            data.lines.pct) /
          4,
      };
    })
    .sort((a, b) => a.average - b.average); // Sort by average coverage, lowest first

  // Display the 5 files with lowest coverage
  console.log(`${colors.yellow}Files with lowest coverage:${colors.reset}`);

  if (fileEntries.length === 0) {
    console.log('  No files found in coverage report');
  } else {
    const lowCoverageFiles = fileEntries.slice(
      0,
      Math.min(5, fileEntries.length)
    );

    lowCoverageFiles.forEach((file) => {
      const colorCode =
        file.average < 50
          ? colors.red
          : file.average < 75
            ? colors.yellow
            : colors.green;

      console.log(`  ${colorCode}${file.path}${colors.reset}`);
      console.log(`    Statements: ${formatPercentage(file.statements)}`);
      console.log(`    Branches:   ${formatPercentage(file.branches)}`);
      console.log(`    Functions:  ${formatPercentage(file.functions)}`);
      console.log(`    Lines:      ${formatPercentage(file.lines)}`);
      console.log();
    });
  }
}

/**
 * Generate recommendations for improving test coverage
 */
function generateRecommendations(coverageData) {
  console.log(`${colors.bright}Recommendations:${colors.reset}`);

  const fileEntries = Object.entries(coverageData).filter(
    ([key]) => key !== 'total' && !isExcluded(key)
  );

  // Find files with no tests
  const filesWithNoTests = fileEntries
    .filter(
      ([_, data]) => data.functions.total > 0 && data.functions.covered === 0
    )
    .map(([filePath]) => filePath.replace(path.dirname(config.srcPath), ''));

  if (filesWithNoTests.length > 0) {
    console.log(`${colors.red}Files with no function coverage:${colors.reset}`);
    filesWithNoTests.forEach((file) => console.log(`  - ${file}`));
    console.log();
  }

  // Find files with low branch coverage
  const filesWithLowBranchCoverage = fileEntries
    .filter(
      ([_, data]) =>
        data.branches.total > 0 &&
        data.branches.pct < config.thresholds.branches &&
        data.branches.pct > 0
    )
    .map(([filePath, data]) => ({
      path: filePath.replace(path.dirname(config.srcPath), ''),
      coverage: data.branches.pct,
      missed: data.branches.total - data.branches.covered,
    }))
    .sort((a, b) => a.coverage - b.coverage);

  if (filesWithLowBranchCoverage.length > 0) {
    console.log(
      `${colors.yellow}Files with low branch coverage:${colors.reset}`
    );
    filesWithLowBranchCoverage.forEach((file) => {
      console.log(
        `  - ${file.path} (${file.coverage.toFixed(2)}%, missing ${file.missed} branches)`
      );
    });
    console.log();
  }

  // General recommendations
  console.log(`${colors.cyan}General recommendations:${colors.reset}`);

  const recommendations = [];

  if (filesWithNoTests.length > 0) {
    recommendations.push('Create tests for files with no coverage');
  }

  if (filesWithLowBranchCoverage.length > 0) {
    recommendations.push(
      'Improve branch coverage by testing conditional logic'
    );
  }

  const overallCoverage = coverageData.total;
  if (overallCoverage.functions.pct < config.thresholds.functions) {
    recommendations.push(
      'Focus on testing more functions to meet the function coverage threshold'
    );
  }

  if (overallCoverage.branches.pct < config.thresholds.branches) {
    recommendations.push('Add tests for edge cases to improve branch coverage');
  }

  if (recommendations.length === 0) {
    console.log(
      `  ${colors.green}✓ All coverage thresholds are met!${colors.reset}`
    );
  } else {
    recommendations.forEach((rec) => console.log(`  - ${rec}`));
  }
}

/**
 * Format a percentage value with color coding
 */
function formatPercentage(value) {
  if (value === undefined) return `${colors.dim}N/A${colors.reset}`;

  const colorCode =
    value >= 75 ? colors.green : value >= 50 ? colors.yellow : colors.red;

  return `${colorCode}${value.toFixed(2)}%${colors.reset}`;
}

/**
 * Check if a file should be excluded from analysis
 */
function isExcluded(filePath) {
  return config.excludePatterns.some((pattern) => filePath.includes(pattern));
}

// Run the analyzer
main().catch((error) => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
