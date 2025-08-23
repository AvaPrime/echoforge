/**
 * Regression Test Runner for EchoForge
 *
 * This script automates the regression testing process for the SoulMeshProtocol
 * conflict resolution system and other critical components. It runs a series of
 * tests and generates a report of the results.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { performance } = require('perf_hooks');

// Configuration
const config = {
  testSuites: [
    {
      name: 'SoulMeshProtocol',
      path: 'packages/echocore/tests/memory/consolidation/codesig/soulmesh',
      critical: true,
    },
    {
      name: 'ConflictResolution',
      path: 'packages/echocore/tests/metrics',
      critical: true,
    },
    {
      name: 'MetricsEngine',
      path: 'packages/echocore/tests/metrics',
      critical: true,
    },
    {
      name: 'Orchestrator',
      path: 'packages/echocore/tests/orchestrator',
      critical: true,
    },
  ],
  emergenceSimulations: [
    {
      name: 'ConflictCascade',
      config: {
        nodes: 5,
        conflictProbability: 0.3,
        desyncProbability: 0.2,
        simulationDurationMs: 30000,
        componentTargets: [
          'memory.consciousness',
          'memory.proposals',
          'memory.codesig',
        ],
      },
    },
    {
      name: 'VectorClockDivergence',
      config: {
        nodes: 3,
        conflictProbability: 0.1,
        desyncProbability: 0.4,
        simulationDurationMs: 20000,
        componentTargets: ['memory.consciousness'],
      },
    },
    {
      name: 'RollbackChain',
      config: {
        nodes: 4,
        conflictProbability: 0.2,
        desyncProbability: 0.3,
        simulationDurationMs: 25000,
        componentTargets: ['memory.proposals', 'memory.codesig'],
      },
    },
  ],
  outputDir: 'reports',
  logFile: 'regression_test_results.md',
};

/**
 * Runs a test suite and returns the results
 * @param {Object} suite - The test suite to run
 * @returns {Object} - The test results
 */
function runTestSuite(suite) {
  console.log(`Running test suite: ${suite.name}`);

  const startTime = performance.now();
  let output;
  let success = false;
  let errorMessage = '';

  try {
    // Run the tests using Jest
    output = execSync(`npx jest --testPathPattern=${suite.path}`, {
      encoding: 'utf8',
    });
    success = !output.includes('FAIL');
  } catch (error) {
    success = false;
    errorMessage = error.message;
    output = error.stdout || '';
  }

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Parse test results
  const passedTests = (output.match(/PASS/g) || []).length;
  const failedTests = (output.match(/FAIL/g) || []).length;
  const totalTests = passedTests + failedTests;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return {
    name: suite.name,
    success,
    passedTests,
    failedTests,
    totalTests,
    successRate,
    duration,
    output,
    errorMessage,
    critical: suite.critical,
  };
}

/**
 * Runs an emergence simulation and returns the results
 * @param {Object} simulation - The simulation to run
 * @returns {Object} - The simulation results
 */
function runEmergenceSimulation(simulation) {
  console.log(`Running emergence simulation: ${simulation.name}`);

  const startTime = performance.now();
  let output;
  let success = false;
  let errorMessage = '';

  try {
    // Write simulation config to a temporary file
    const configPath = path.join(
      'temp',
      `${simulation.name.toLowerCase()}_config.json`
    );
    fs.mkdirSync('temp', { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(simulation.config, null, 2));

    // Run the simulation
    // Note: This is a placeholder. The actual command would depend on your simulation framework
    output = execSync(
      `node packages/echocore/scripts/run_simulation.js --config=${configPath}`,
      { encoding: 'utf8' }
    );
    success = !output.includes('SIMULATION FAILED');
  } catch (error) {
    success = false;
    errorMessage = error.message;
    output = error.stdout || '';
  }

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Parse simulation results
  // This is a placeholder. The actual parsing would depend on your simulation output format
  const detectedPatterns = (output.match(/PATTERN DETECTED/g) || []).length;
  const resolvedPatterns = (output.match(/PATTERN RESOLVED/g) || []).length;
  const resolutionRate =
    detectedPatterns > 0 ? (resolvedPatterns / detectedPatterns) * 100 : 0;

  return {
    name: simulation.name,
    success,
    detectedPatterns,
    resolvedPatterns,
    resolutionRate,
    duration,
    output,
    errorMessage,
    config: simulation.config,
  };
}

/**
 * Generates a markdown report of the test results
 * @param {Array} testResults - The results of the test suites
 * @param {Array} simulationResults - The results of the emergence simulations
 * @returns {string} - The markdown report
 */
function generateReport(testResults, simulationResults) {
  const timestamp = new Date().toISOString();
  const overallTestSuccess = testResults.every(
    (result) => result.success || !result.critical
  );
  const criticalTestSuccess = testResults
    .filter((result) => result.critical)
    .every((result) => result.success);
  const overallSimulationSuccess = simulationResults.every(
    (result) => result.success
  );

  let report = `# EchoForge Regression Test Report

`;
  report += `**Date:** ${timestamp}\n`;
  report += `**Overall Status:** ${overallTestSuccess && overallSimulationSuccess ? '✅ PASS' : '❌ FAIL'}\n`;
  report += `**Critical Tests:** ${criticalTestSuccess ? '✅ PASS' : '❌ FAIL'}\n\n`;

  // Test Suite Results
  report += `## Test Suite Results\n\n`;
  report += `| Test Suite | Status | Success Rate | Duration (ms) | Critical |\n`;
  report += `|------------|--------|--------------|---------------|----------|\n`;

  testResults.forEach((result) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const critical = result.critical ? '✅ Yes' : '❌ No';
    report += `| ${result.name} | ${status} | ${result.successRate.toFixed(2)}% | ${result.duration.toFixed(2)} | ${critical} |\n`;
  });

  report += `\n`;

  // Emergence Simulation Results
  report += `## Emergence Simulation Results\n\n`;
  report += `| Simulation | Status | Resolution Rate | Duration (ms) |\n`;
  report += `|------------|--------|-----------------|---------------|\n`;

  simulationResults.forEach((result) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    report += `| ${result.name} | ${status} | ${result.resolutionRate.toFixed(2)}% | ${result.duration.toFixed(2)} |\n`;
  });

  report += `\n`;

  // Detailed Test Results
  report += `## Detailed Test Results\n\n`;

  testResults.forEach((result) => {
    report += `### ${result.name}\n\n`;
    report += `**Status:** ${result.success ? '✅ PASS' : '❌ FAIL'}\n`;
    report += `**Passed Tests:** ${result.passedTests}\n`;
    report += `**Failed Tests:** ${result.failedTests}\n`;
    report += `**Success Rate:** ${result.successRate.toFixed(2)}%\n`;
    report += `**Duration:** ${result.duration.toFixed(2)} ms\n\n`;

    if (!result.success) {
      report += `**Error Message:**\n\`\`\`\n${result.errorMessage}\n\`\`\`\n\n`;
    }
  });

  // Detailed Simulation Results
  report += `## Detailed Simulation Results\n\n`;

  simulationResults.forEach((result) => {
    report += `### ${result.name}\n\n`;
    report += `**Status:** ${result.success ? '✅ PASS' : '❌ FAIL'}\n`;
    report += `**Detected Patterns:** ${result.detectedPatterns}\n`;
    report += `**Resolved Patterns:** ${result.resolvedPatterns}\n`;
    report += `**Resolution Rate:** ${result.resolutionRate.toFixed(2)}%\n`;
    report += `**Duration:** ${result.duration.toFixed(2)} ms\n\n`;

    report += `**Configuration:**\n\`\`\`json\n${JSON.stringify(result.config, null, 2)}\n\`\`\`\n\n`;

    if (!result.success) {
      report += `**Error Message:**\n\`\`\`\n${result.errorMessage}\n\`\`\`\n\n`;
    }
  });

  return report;
}

/**
 * Main function to run all tests and generate a report
 */
async function main() {
  console.log('Starting regression tests...');

  // Create output directory if it doesn't exist
  fs.mkdirSync(config.outputDir, { recursive: true });

  // Run test suites
  const testResults = [];
  for (const suite of config.testSuites) {
    const result = runTestSuite(suite);
    testResults.push(result);
  }

  // Run emergence simulations
  const simulationResults = [];
  for (const simulation of config.emergenceSimulations) {
    const result = runEmergenceSimulation(simulation);
    simulationResults.push(result);
  }

  // Generate report
  const report = generateReport(testResults, simulationResults);

  // Write report to file
  const reportPath = path.join(config.outputDir, config.logFile);
  fs.writeFileSync(reportPath, report);

  console.log(`Regression tests completed. Report written to ${reportPath}`);

  // Update emergence simulation log
  updateEmergenceSimulationLog(simulationResults);

  // Check if all critical tests passed
  const criticalTestSuccess = testResults
    .filter((result) => result.critical)
    .every((result) => result.success);

  if (!criticalTestSuccess) {
    console.error('Critical tests failed. See report for details.');
    process.exit(1);
  }

  console.log('All critical tests passed.');
}

/**
 * Updates the emergence simulation log with the results of the simulations
 * @param {Array} simulationResults - The results of the emergence simulations
 */
function updateEmergenceSimulationLog(simulationResults) {
  const logPath = path.join('docs', 'emergence_simulation_log.md');

  // Read existing log
  let log = fs.readFileSync(logPath, 'utf8');

  // Update simulation summary table
  const timestamp = new Date().toISOString().split('T')[0];

  simulationResults.forEach((result) => {
    const testId = `${result.name}-${Date.now().toString(36)}`;
    const severity =
      result.detectedPatterns > 5
        ? 'High'
        : result.detectedPatterns > 2
          ? 'Medium'
          : 'Low';

    // Create new table row
    const newRow = `| ${timestamp} | ${testId} | ${result.name} | ${severity} | ${result.duration.toFixed(2)} ms |\n`;

    // Insert into summary table
    const tableStart = log.indexOf(
      '| Date | Test ID | Pattern Type | Severity | Resolution Time |'
    );
    const tableEnd = log.indexOf('\n\n', tableStart);
    const tableHeader = log.substring(tableStart, tableEnd + 2);
    const tableParts = log.split(tableHeader);

    log = tableParts[0] + tableHeader + newRow + tableParts[1];
  });

  // Write updated log
  fs.writeFileSync(logPath, log);

  console.log('Updated emergence simulation log.');
}

// Run the main function
main().catch((error) => {
  console.error('Error running regression tests:', error);
  process.exit(1);
});
