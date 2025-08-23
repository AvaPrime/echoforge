/**
 * EchoForge Codebase Assessment & Living Documentation System
 * Assessment Runner
 *
 * This script runs the codebase assessment process by:
 * 1. Executing static analysis tools
 * 2. Collecting and processing results
 * 3. Activating the Assessment Agent
 * 4. Generating/updating living documentation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { EchoCore } = require('@echoforge/echocore');
const { Codalism } = require('@echoforge/codalism');

// Load configuration
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'agent-config.json'), 'utf8')
);
const baseDir = __dirname;
const repoPath = path.resolve(process.cwd());

/**
 * Runs static analysis tools and collects results
 */
async function runStaticAnalysis() {
  console.log('Running static analysis tools...');

  try {
    // Run SonarQube scan
    console.log('Running SonarQube analysis...');
    execSync('sonar-scanner', { cwd: repoPath, stdio: 'inherit' });

    // Run ESLint
    console.log('Running ESLint...');
    const eslintResult = execSync('npx eslint . --format=json', {
      cwd: repoPath,
    }).toString();
    fs.writeFileSync(
      path.join(baseDir, 'analysis/eslint-results.json'),
      eslintResult
    );

    // Run Semgrep for security scanning
    console.log('Running Semgrep security scan...');
    const semgrepResult = execSync('semgrep --config=p/owasp-top-ten --json', {
      cwd: repoPath,
    }).toString();
    fs.writeFileSync(
      path.join(baseDir, 'analysis/semgrep-results.json'),
      semgrepResult
    );

    // Run JSCPD for code duplication
    console.log('Running JSCPD for duplication detection...');
    const jscpdResult = execSync('npx jscpd . --reporters=json', {
      cwd: repoPath,
    }).toString();
    fs.writeFileSync(
      path.join(baseDir, 'analysis/jscpd-results.json'),
      jscpdResult
    );

    // Run CLOC for code metrics
    console.log('Running CLOC for code metrics...');
    const clocResult = execSync('npx cloc . --json', {
      cwd: repoPath,
    }).toString();
    fs.writeFileSync(
      path.join(baseDir, 'analysis/cloc-results.json'),
      clocResult
    );

    console.log('Static analysis complete.');
  } catch (error) {
    console.error('Error during static analysis:', error.message);
    console.log('Continuing with available results...');
  }
}

/**
 * Runs architecture analysis tools
 */
async function runArchitectureAnalysis() {
  console.log('Running architecture analysis...');

  try {
    // Generate dependency graph with Madge
    console.log('Generating dependency graph with Madge...');
    const madgeResult = execSync('npx madge --json .', {
      cwd: repoPath,
    }).toString();
    fs.writeFileSync(
      path.join(baseDir, 'analysis/madge-results.json'),
      madgeResult
    );

    // Generate architecture visualization with Arkit
    console.log('Generating architecture visualization with Arkit...');
    execSync('npx arkit -o architecture-diagram.svg', { cwd: repoPath });

    // Copy the generated diagram to the analysis directory
    fs.copyFileSync(
      path.join(repoPath, 'architecture-diagram.svg'),
      path.join(baseDir, 'analysis/architecture-diagram.svg')
    );

    console.log('Architecture analysis complete.');
  } catch (error) {
    console.error('Error during architecture analysis:', error.message);
    console.log('Continuing with available results...');
  }
}

/**
 * Processes analysis results and prepares data for the Assessment Agent
 */
async function processResults() {
  console.log('Processing analysis results...');

  // Combine results into a unified format
  const analysisData = {
    timestamp: new Date().toISOString(),
    codebase: {
      path: repoPath,
      name: path.basename(repoPath),
    },
    staticAnalysis: {},
    architectureAnalysis: {},
    metrics: {},
  };

  // Load and process ESLint results
  try {
    const eslintResults = JSON.parse(
      fs.readFileSync(
        path.join(baseDir, 'analysis/eslint-results.json'),
        'utf8'
      )
    );
    analysisData.staticAnalysis.eslint = {
      issueCount: eslintResults.length || 0,
      errorCount: eslintResults.reduce(
        (count, file) => count + file.errorCount,
        0
      ),
      warningCount: eslintResults.reduce(
        (count, file) => count + file.warningCount,
        0
      ),
      files: eslintResults.map((file) => ({
        filePath: file.filePath,
        errorCount: file.errorCount,
        warningCount: file.warningCount,
      })),
    };
  } catch (error) {
    console.log('ESLint results not available or invalid');
  }

  // Load and process Semgrep results
  try {
    const semgrepResults = JSON.parse(
      fs.readFileSync(
        path.join(baseDir, 'analysis/semgrep-results.json'),
        'utf8'
      )
    );
    analysisData.staticAnalysis.semgrep = {
      issueCount: semgrepResults.results ? semgrepResults.results.length : 0,
      securityIssues: semgrepResults.results
        ? semgrepResults.results.map((result) => ({
            rule: result.check_id,
            severity: result.extra.severity,
            file: result.path,
            line: result.start.line,
          }))
        : [],
    };
  } catch (error) {
    console.log('Semgrep results not available or invalid');
  }

  // Load and process JSCPD results
  try {
    const jscpdResults = JSON.parse(
      fs.readFileSync(path.join(baseDir, 'analysis/jscpd-results.json'), 'utf8')
    );
    analysisData.metrics.duplication = {
      percentage: jscpdResults.statistics
        ? jscpdResults.statistics.total.percentage
        : 0,
      duplicatedLines: jscpdResults.statistics
        ? jscpdResults.statistics.total.duplicatedLines
        : 0,
      totalLines: jscpdResults.statistics
        ? jscpdResults.statistics.total.lines
        : 0,
    };
  } catch (error) {
    console.log('JSCPD results not available or invalid');
  }

  // Load and process CLOC results
  try {
    const clocResults = JSON.parse(
      fs.readFileSync(path.join(baseDir, 'analysis/cloc-results.json'), 'utf8')
    );
    analysisData.metrics.codeSize = {
      languages: Object.entries(clocResults)
        .filter(([key]) => key !== 'header')
        .map(([lang, data]) => ({
          language: lang,
          files: data.nFiles,
          blankLines: data.blank,
          commentLines: data.comment,
          codeLines: data.code,
        })),
      total: {
        files: clocResults.SUM ? clocResults.SUM.nFiles : 0,
        blankLines: clocResults.SUM ? clocResults.SUM.blank : 0,
        commentLines: clocResults.SUM ? clocResults.SUM.comment : 0,
        codeLines: clocResults.SUM ? clocResults.SUM.code : 0,
      },
    };
  } catch (error) {
    console.log('CLOC results not available or invalid');
  }

  // Load and process Madge results
  try {
    const madgeResults = JSON.parse(
      fs.readFileSync(path.join(baseDir, 'analysis/madge-results.json'), 'utf8')
    );
    analysisData.architectureAnalysis.dependencies = {
      modules: Object.keys(madgeResults).length,
      connections: Object.values(madgeResults).reduce(
        (count, deps) => count + deps.length,
        0
      ),
      circularDependencies: [], // Would need additional processing to detect
    };
  } catch (error) {
    console.log('Madge results not available or invalid');
  }

  // Save the processed results
  const resultsPath = path.join(baseDir, 'analysis/processed-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(analysisData, null, 2));
  console.log(`Processed results saved to: ${resultsPath}`);

  return analysisData;
}

/**
 * Activates the Assessment Agent to analyze results and generate documentation
 */
async function activateAssessmentAgent(analysisData) {
  console.log('Activating Assessment Agent...');

  try {
    // Initialize EchoForge core
    const echoCore = new EchoCore();
    const codalism = new Codalism();

    // Load the agent
    const agent = echoCore.getAgent(config.name);
    if (!agent) {
      throw new Error(
        `Agent ${config.name} not found. Please run setup.js first.`
      );
    }

    // Set the assessment context with Codalism intention framework
    codalism.setIntentionContext(config.name, {
      task: 'codebase_assessment',
      data: analysisData,
      outputPath: baseDir,
    });

    // Activate the agent with MCP functions
    console.log('Agent analyzing codebase...');
    await agent.activate({
      mcpFunctions: [
        // Core MCP functions
        'store',
        'retrieve',
        'reflect',
        'integrate',
        // Advanced MCP operations
        'recontextualize',
        'prioritize',
      ],
      context: analysisData,
    });

    // Generate the living documentation
    console.log('Generating living documentation...');
    await agent.executeTask('generate_living_documentation', {
      analysisData,
      outputPath: path.join(baseDir, 'living-docs'),
      templatePath: path.join(baseDir, '../docs/5_codebase_assessment.md'),
    });

    console.log(
      'Assessment Agent completed analysis and documentation generation.'
    );
  } catch (error) {
    console.error('Error during Assessment Agent activation:', error);
  }
}

/**
 * Main assessment function
 */
async function runAssessment() {
  console.log('Starting codebase assessment...');
  console.log(`Repository: ${repoPath}`);
  console.log(`Assessment data directory: ${baseDir}`);
  console.log('-----------------------------------');

  // Run static analysis
  await runStaticAnalysis();

  // Run architecture analysis
  await runArchitectureAnalysis();

  // Process results
  const analysisData = await processResults();

  // Activate Assessment Agent
  await activateAssessmentAgent(analysisData);

  console.log('\nAssessment complete!');
  console.log(
    `\nLiving documentation is available in: ${path.join(baseDir, 'living-docs')}`
  );
  console.log(
    `Opportunities identified in: ${path.join(baseDir, 'opportunities')}`
  );
}

// Run assessment
runAssessment().catch((error) => {
  console.error('Assessment failed:', error);
  process.exit(1);
});
