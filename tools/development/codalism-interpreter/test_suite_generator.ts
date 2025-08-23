import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { CodalBlueprint } from './codalism_interpreter';

/**
 * Test Suite Generator - Creates test suites for refined blueprints
 */
export class TestSuiteGenerator {
  private outputDir: string;

  constructor(outputDir?: string) {
    this.outputDir = outputDir || path.join(process.cwd(), 'test-suites');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate a test suite for a refined blueprint
   */
  generateTestSuite(blueprint: CodalBlueprint): string {
    console.log(chalk.blue(`🧪 Generating test suite for ${blueprint.name}`));

    // Create test file path
    const testFilePath = path.join(this.outputDir, `${blueprint.name}.test.js`);

    // Generate test content based on blueprint
    const testContent = this.createTestContent(blueprint);

    // Write test file
    fs.writeFileSync(testFilePath, testContent);

    console.log(chalk.green(`✅ Test suite generated at ${testFilePath}`));

    return testFilePath;
  }

  /**
   * Generate test suites for multiple blueprints
   */
  generateTestSuites(blueprints: CodalBlueprint[]): string[] {
    const testFiles: string[] = [];

    for (const blueprint of blueprints) {
      const testFile = this.generateTestSuite(blueprint);
      testFiles.push(testFile);
    }

    return testFiles;
  }

  /**
   * Create test content based on blueprint
   */
  private createTestContent(blueprint: CodalBlueprint): string {
    // Extract agent name and intent from blueprint
    const agentName = blueprint.name;
    const intent = blueprint.intent;
    const capabilities = blueprint.capabilities || [];

    // Create test template
    return `
/**
 * Test Suite for ${agentName}
 * Intent: ${intent}
 * Generated automatically by TestSuiteGenerator
 */

const { ${agentName} } = require('../agents/${agentName}');

describe('${agentName} Tests', () => {
  let agent;

  beforeEach(() => {
    agent = new ${agentName}();
  });

  test('Agent should initialize correctly', () => {
    expect(agent).toBeDefined();
  });

${this.generateCapabilityTests(capabilities, agentName)}

  test('Agent should fulfill its primary intent', async () => {
    // TODO: Implement test for primary intent: ${intent}
    // This is a placeholder for a more specific test
    expect(agent.execute).toBeDefined();
  });
});
`;
  }

  /**
   * Generate test cases for each capability
   */
  private generateCapabilityTests(
    capabilities: string[],
    agentName: string
  ): string {
    if (!capabilities || capabilities.length === 0) {
      return '  // No specific capabilities to test';
    }

    return capabilities
      .map((capability) => {
        const testName = capability
          .replace(/[^a-zA-Z0-9]/g, ' ')
          .trim()
          .replace(/\s+/g, ' ');

        return `
  test('Should have capability: ${testName}', () => {
    // TODO: Implement test for capability: ${capability}
    // This is a placeholder for a more specific test
    expect(agent).toHaveProperty('execute');
  });`;
      })
      .join('\n');
  }
}
