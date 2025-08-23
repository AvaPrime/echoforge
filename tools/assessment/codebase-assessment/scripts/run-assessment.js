/**
 * EchoForge Codebase Assessment Runner
 *
 * This script runs a complete codebase assessment using the configured tools
 * and generates living documentation based on the results.
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { createAssessmentAgent } = require('../lib/agent');

// Load configuration
const config = require('../config');

/**
 * Main function to run the assessment
 */
async function runAssessment() {
  console.log('Starting EchoForge Codebase Assessment...');

  try {
    // Create output directories if they don't exist
    ensureDirectoriesExist();

    // Run static analysis tools
    const analysisResults = await runAnalysisTools();

    // Create assessment agent
    const agent = createAssessmentAgent(config);

    // Run codebase analysis
    console.log('Running codebase analysis...');
    const assessment = await agent.analyzeCodebase(analysisResults);

    // Store analysis results
    console.log('Storing analysis results...');
    await agent.storeAnalysisResults(assessment);

    // Run multi-dimensional assessments
    console.log('Running architecture assessment...');
    const architectureAssessment = await agent.assessArchitecture(assessment);

    console.log('Running code quality assessment...');
    const codeQualityMatrix = await agent.assessCodeQuality(assessment);

    console.log('Running security assessment...');
    const securityAssessment = await agent.assessSecurity(assessment);

    console.log('Running performance assessment...');
    const performanceAssessment = await agent.assessPerformance(assessment);

    // Identify opportunities
    console.log('Identifying opportunities...');
    const opportunities = await agent.identifyOpportunities({
      architectureAssessment,
      codeQualityMatrix,
      securityAssessment,
      performanceAssessment,
    });

    // Generate living documentation
    console.log('Generating living documentation...');
    const documentation = await agent.generateDocumentation({
      assessment,
      architectureAssessment,
      codeQualityMatrix,
      securityAssessment,
      performanceAssessment,
      opportunities,
    });

    // Save assessment results
    saveAssessmentResults({
      assessment,
      architectureAssessment,
      codeQualityMatrix,
      securityAssessment,
      performanceAssessment,
      opportunities,
      documentation,
    });

    console.log('Codebase assessment completed successfully!');
    console.log(`Results saved to ${config.system.outputPath}`);
  } catch (error) {
    console.error('Error running codebase assessment:', error);
    process.exit(1);
  }
}

/**
 * Ensure all required directories exist
 */
function ensureDirectoriesExist() {
  const directories = [
    config.system.outputPath,
    path.join(config.system.outputPath, 'analysis'),
    path.join(config.system.outputPath, 'inventory'),
    path.join(config.system.outputPath, 'opportunities'),
    path.join(config.system.outputPath, 'living-docs'),
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Run all configured analysis tools
 * @returns {Promise<Object>} Analysis results
 */
async function runAnalysisTools() {
  const results = {};

  // Run static analysis tools
  if (config.staticAnalysis.enabled) {
    console.log('Running static analysis tools...');

    // Run ESLint
    if (config.staticAnalysis.tools.eslint.enabled) {
      try {
        console.log('Running ESLint...');
        const eslintOutput = execSync(
          `npx eslint "${config.repository.path}/**/*.{js,jsx,ts,tsx}" --ignore-path ${path.join(config.repository.path, '.eslintignore')} -c ${config.staticAnalysis.tools.eslint.configPath} --format json`,
          { encoding: 'utf8' }
        );

        fs.writeFileSync(
          config.staticAnalysis.tools.eslint.outputPath,
          eslintOutput
        );

        results.eslint = JSON.parse(eslintOutput);
      } catch (error) {
        console.warn('ESLint analysis failed:', error.message);
        // Still capture the output even if the command exits with non-zero code
        if (error.stdout) {
          fs.writeFileSync(
            config.staticAnalysis.tools.eslint.outputPath,
            error.stdout
          );
          try {
            results.eslint = JSON.parse(error.stdout);
          } catch (parseError) {
            console.error('Failed to parse ESLint output:', parseError.message);
          }
        }
      }
    }

    // Run Semgrep
    if (config.staticAnalysis.tools.semgrep.enabled) {
      try {
        console.log('Running Semgrep...');
        const semgrepOutput = execSync(
          `npx semgrep --config=${config.staticAnalysis.tools.semgrep.rulesPath} --json ${config.repository.path}`,
          { encoding: 'utf8' }
        );

        fs.writeFileSync(
          config.staticAnalysis.tools.semgrep.outputPath,
          semgrepOutput
        );

        results.semgrep = JSON.parse(semgrepOutput);
      } catch (error) {
        console.warn('Semgrep analysis failed:', error.message);
        if (error.stdout) {
          fs.writeFileSync(
            config.staticAnalysis.tools.semgrep.outputPath,
            error.stdout
          );
          try {
            results.semgrep = JSON.parse(error.stdout);
          } catch (parseError) {
            console.error(
              'Failed to parse Semgrep output:',
              parseError.message
            );
          }
        }
      }
    }

    // Run CLOC
    if (config.staticAnalysis.tools.cloc.enabled) {
      try {
        console.log('Running CLOC...');
        const clocOutput = execSync(
          `npx cloc ${config.repository.path} --exclude-dir=${config.repository.excludePaths.join(',')} --json`,
          { encoding: 'utf8' }
        );

        fs.writeFileSync(
          config.staticAnalysis.tools.cloc.outputPath,
          clocOutput
        );

        results.cloc = JSON.parse(clocOutput);
      } catch (error) {
        console.warn('CLOC analysis failed:', error.message);
      }
    }
  }

  // Run architecture analysis tools
  if (config.architectureAnalysis.enabled) {
    console.log('Running architecture analysis tools...');

    // Run Madge
    if (config.architectureAnalysis.tools.madge.enabled) {
      try {
        console.log('Running Madge...');
        const madgeOutput = execSync(
          `npx madge --json ${config.repository.path}`,
          { encoding: 'utf8' }
        );

        fs.writeFileSync(
          config.architectureAnalysis.tools.madge.outputPath,
          madgeOutput
        );

        // Generate dependency graph
        execSync(
          `npx madge --image ${config.architectureAnalysis.tools.madge.graphOutputPath} ${config.repository.path}`,
          { encoding: 'utf8' }
        );

        results.madge = JSON.parse(madgeOutput);
      } catch (error) {
        console.warn('Madge analysis failed:', error.message);
      }
    }
  }

  return results;
}

/**
 * Save assessment results to output files
 * @param {Object} results Assessment results
 */
function saveAssessmentResults(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Save complete assessment results
  fs.writeFileSync(
    path.join(config.system.outputPath, `assessment-${timestamp}.json`),
    JSON.stringify(results, null, 2)
  );

  // Save individual result components
  fs.writeFileSync(
    path.join(
      config.system.outputPath,
      'analysis',
      `architecture-assessment-${timestamp}.json`
    ),
    JSON.stringify(results.architectureAssessment, null, 2)
  );

  fs.writeFileSync(
    path.join(
      config.system.outputPath,
      'analysis',
      `code-quality-matrix-${timestamp}.json`
    ),
    JSON.stringify(results.codeQualityMatrix, null, 2)
  );

  fs.writeFileSync(
    path.join(
      config.system.outputPath,
      'analysis',
      `security-assessment-${timestamp}.json`
    ),
    JSON.stringify(results.securityAssessment, null, 2)
  );

  fs.writeFileSync(
    path.join(
      config.system.outputPath,
      'analysis',
      `performance-assessment-${timestamp}.json`
    ),
    JSON.stringify(results.performanceAssessment, null, 2)
  );

  fs.writeFileSync(
    path.join(
      config.system.outputPath,
      'opportunities',
      `opportunities-${timestamp}.json`
    ),
    JSON.stringify(results.opportunities, null, 2)
  );
}

// Run the assessment if this script is executed directly
if (require.main === module) {
  runAssessment();
}

module.exports = { runAssessment };
