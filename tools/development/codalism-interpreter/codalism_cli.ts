#!/usr/bin/env node

// Codessa CLI: Local Project Integration with Codalism Interpreter
import * as fs from 'fs';
import * as path from 'path';
import { CodalismTester, CodalBlueprint } from './codalism_example';
import { CodalRegistry } from './codal_primitives';
import { CodalismASTAnalyzer, ASTAnalysisResult } from './ast_analyzer';
import { BlueprintRefiner, BlueprintRefinerOptions } from './blueprint_refiner';
import chalk from 'chalk';
import ora from 'ora';
import { Listr } from 'listr2';
import { CodalismInterpreter } from './codalism_interpreter';
import { CODAL_PRIMITIVES } from './codal_primitives';

interface ProjectScanResult {
  path: string;
  type: 'file' | 'directory';
  language?: string;
  functions?: string[];
  blueprint?: CodalBlueprint;
}

interface CodessaConfig {
  include: string[];
  exclude: string[];
  languages: string[];
  autoGenerate: boolean;
  outputDir: string;
}

export class CodessaCLI {
  private tester: CodalismTester;
  private config: CodessaConfig;
  private astAnalyzer: CodalismASTAnalyzer;

  constructor() {
    this.tester = new CodalismTester();
    this.config = this.loadConfig();
    this.astAnalyzer = new CodalismASTAnalyzer();
  }

  /**
   * Main CLI entry point
   */
  async run(args: string[]): Promise<void> {
    const command = args[0];
    const target = args[1];
    const options = args.slice(2);

    console.log(`🌐 Codessa CLI - v1.0`);
    console.log(`🧠 Cognitive Code Integration\n`);

    switch (command) {
      case 'scan':
        await this.scanProject(target);
        break;
      case 'analyze':
        await this.analyzeFile(target);
        break;
      case 'refine':
        await this.refineBlueprint(target, options);
        break;
      case 'generate':
        await this.generateAgents(target);
        break;
      case 'init':
        await this.initProject(target);
        break;
      case 'status':
        await this.showStatus();
        break;
      case 'primitives':
        this.showPrimitives();
        break;
      default:
        this.showHelp();
    }
  }

  /**
   * Scan a project directory for integration opportunities
   */
  async scanProject(projectPath: string): Promise<void> {
    if (!projectPath) {
      console.error(chalk.red('❌ Please provide a project path'));
      return;
    }

    console.log(chalk.blue(`🔍 Scanning project: ${projectPath}`));
    console.log(chalk.gray('-'.repeat(50)));

    const spinner = ora('Analyzing project structure...').start();

    try {
      const results = await this.walkDirectory(projectPath);
      const codeFiles = results.filter((r) => r.type === 'file' && r.language);

      spinner.succeed('Project structure analyzed');

      console.log(chalk.green(`\n📊 Scan Results:`));
      console.log(`   Total files: ${results.length}`);
      console.log(`   Code files: ${codeFiles.length}`);
      console.log(
        `   Languages: ${chalk.cyan([...new Set(codeFiles.map((f) => f.language))].join(', '))}`
      );

      // Group by language
      const byLanguage = this.groupBy(codeFiles, 'language');

      console.log(chalk.green(`\n📋 Detailed Breakdown:`));
      for (const [lang, files] of Object.entries(byLanguage)) {
        console.log(`\n  ${chalk.yellow(lang)}:`);
        for (const file of files.slice(0, 10)) {
          // Show first 10
          const relativePath = path.relative(projectPath, file.path);
          const functionCount = file.functions?.length || 0;
          console.log(
            `    📄 ${chalk.cyan(relativePath)} (${chalk.yellow(functionCount.toString())} functions)`
          );
        }
        if (files.length > 10) {
          console.log(`    ... and ${files.length - 10} more files`);
        }
      }

      // Suggest next steps
      console.log(`\n🚀 Suggested Actions:`);
      console.log(
        `   codessa analyze ${projectPath}/main.py    # Analyze specific file`
      );
      console.log(
        `   codessa generate ${projectPath}           # Generate all agents`
      );
      console.log(
        `   codessa init ${projectPath}               # Create .codessa config`
      );
    } catch (error) {
      console.error(`❌ Error scanning project: ${error}`);
    }
  }

  /**
   * Analyze a specific file using the AST analyzer
   */
  async analyzeFile(filePath: string): Promise<void> {
    if (!filePath) {
      console.error(chalk.red('❌ Please provide a file path'));
      return;
    }

    if (!fs.existsSync(filePath)) {
      console.error(chalk.red(`❌ File not found: ${filePath}`));
      return;
    }

    console.log(chalk.blue(`🔍 Analyzing file: ${filePath}`));
    console.log(chalk.gray('-'.repeat(50)));

    const spinner = ora('Parsing code and building AST...').start();

    try {
      const sourceCode = fs.readFileSync(filePath, 'utf8');
      const language = this.detectLanguage(filePath);

      if (!language) {
        spinner.fail('Unsupported file type');
        console.error(chalk.red(`❌ Unsupported file type: ${filePath}`));
        return;
      }

      // Use the AST analyzer instead of regex
      const astResult = await this.astAnalyzer.analyzeSource(
        sourceCode,
        language,
        filePath
      );
      spinner.succeed(
        `AST analysis complete: ${astResult.nodes.length} nodes identified`
      );

      console.log(chalk.green(`\n📊 Analysis Results:`));
      console.log(
        `   Functions/Classes: ${chalk.yellow(astResult.nodes.length.toString())}`
      );
      console.log(
        `   Imports: ${chalk.yellow(astResult.imports.length.toString())}`
      );
      console.log(
        `   Complexity: ${chalk.yellow(astResult.complexity.toString())}`
      );

      if (astResult.nodes.length === 0) {
        console.log(
          chalk.yellow('⚠️  No functions or classes detected in this file')
        );
        return;
      }

      // Process each node through Codalism interpreter
      const tasks = new Listr(
        astResult.nodes.map((node) => ({
          title: `Analyzing ${node.type}: ${node.name}`,
          task: async (ctx, task) => {
            // Create a code context from the AST node
            const codeContext = {
              imports: astResult.imports,
              functions: astResult.nodes.map((n) => n.name),
              keywords: [],
              callPatterns: [],
              dataStructures: [],
              hasAsyncPattern: node.isAsync,
              hasErrorHandling: node.hasErrorHandling,
              hasResponseHandling: false,
            };

            // Analyze with Codalism
            const result = await this.tester.analyzeCode(node.name, node.raw);
            task.output = `Intent: ${result.blueprint.intent}`;
            return result;
          },
        })),
        {
          concurrent: false,
          rendererOptions: { collapse: false, collapseErrors: false },
        }
      );

      const results = await tasks.run();

      // Display detailed results for each node
      for (let i = 0; i < astResult.nodes.length; i++) {
        const node = astResult.nodes[i];
        const result = results[i];

        console.log(
          chalk.cyan(
            `\n📌 ${node.type}: ${node.name} (lines ${node.startLine}-${node.endLine})`
          )
        );
        console.log(`   🎯 Intent: ${chalk.white(result.blueprint.intent)}`);
        console.log(
          `   🤖 Agent: ${chalk.green(result.blueprint.suggestedAgent)}`
        );
        console.log(
          `   📊 Confidence: ${chalk.cyan((result.blueprint.metadata.confidenceScore * 100).toFixed(1))}%`
        );

        const topPrimitives = result.blueprint.primitives.slice(0, 3);
        console.log(
          `   🧬 Top Primitives: ${chalk.yellow(topPrimitives.map((p) => p.primitive).join(', '))}`
        );

        if (result.blueprint.dominantSequence) {
          console.log(
            `   🔗 Pattern: ${chalk.magenta(result.blueprint.dominantSequence.sequence.join(' → '))}`
          );
        }
      }

      // Ask if user wants to generate agents
      console.log(`\n🚀 Generate Codessa agents? (y/n)`);
      // In a real CLI, this would wait for user input
    } catch (error) {
      spinner?.fail('Analysis failed');
      console.error(chalk.red(`❌ Error analyzing file: ${error}`));
    }
  }

  /**
   * Refine a blueprint with interactive prompts
   */
  async refineBlueprint(filePath: string, options: string[]): Promise<void> {
    if (!filePath) {
      console.error(chalk.red('❌ Please provide a file path'));
      return;
    }

    console.log(chalk.blue(`🔧 Refining blueprint for: ${filePath}`));
    console.log(chalk.gray('-'.repeat(50)));

    const spinner = ora('Analyzing file...').start();

    try {
      const sourceCode = fs.readFileSync(filePath, 'utf8');
      const language = this.detectLanguage(filePath);

      if (!language) {
        spinner.fail('Unsupported file type');
        console.error(chalk.red(`❌ Unsupported file type: ${filePath}`));
        return;
      }

      // Analyze the file first
      const astResult = await this.astAnalyzer.analyzeSource(
        sourceCode,
        language,
        filePath
      );
      spinner.succeed(
        `Analysis complete: ${astResult.nodes.length} nodes identified`
      );

      if (astResult.nodes.length === 0) {
        console.log(
          chalk.yellow('⚠️  No functions or classes detected in this file')
        );
        return;
      }

      // Select a function to refine
      console.log(chalk.green('\n📋 Select a function to refine:'));
      astResult.nodes.forEach((node, index) => {
        console.log(`   ${index + 1}. ${node.type}: ${chalk.cyan(node.name)}`);
      });

      // In a real CLI, this would prompt for user selection
      const selectedIndex = 0; // First function for demo
      const selectedNode = astResult.nodes[selectedIndex];

      console.log(
        chalk.green(`\n🔍 Refining: ${chalk.cyan(selectedNode.name)}`)
      );

      // Generate initial blueprint
      spinner.start('Generating initial blueprint...');
      const result = await this.tester.analyzeCode(
        selectedNode.name,
        selectedNode.raw
      );
      spinner.succeed('Initial blueprint generated');

      // Configure refiner options
      const refinerOptions: BlueprintRefinerOptions = {
        interactive: !options.includes('--batch'),
        batch: options.includes('--batch'),
        headless: options.includes('--headless'),
        saveMemory: options.includes('--save-memory'),
      };

      // Create blueprint refiner
      const refiner = new BlueprintRefiner(refinerOptions);

      // Start refinement process
      console.log(chalk.blue('\n🧠 Starting refinement process...'));
      const refinedBlueprint = await refiner.refineBlueprint(result.blueprint);

      // Output the refined blueprint
      console.log(chalk.green('\n✅ Blueprint refinement complete!'));
      console.log(chalk.cyan('\n📝 Refined Blueprint:'));
      console.log(chalk.gray('-'.repeat(50)));
      console.log(JSON.stringify(refinedBlueprint, null, 2));

      // Save the refined blueprint
      const outputDir = path.join(path.dirname(filePath), '.codessa');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(
        outputDir,
        `${selectedNode.name}.blueprint.json`
      );
      fs.writeFileSync(outputPath, JSON.stringify(refinedBlueprint, null, 2));

      console.log(chalk.green(`\n💾 Blueprint saved to: ${outputPath}`));
      console.log(chalk.blue(`\n🚀 Next steps:`));
      console.log(`   1. Review the blueprint in ${outputPath}`);
      console.log(
        `   2. Generate agent with: codessa generate --blueprint ${outputPath}`
      );
    } catch (error) {
      spinner?.fail('Refinement failed');
      console.error(chalk.red(`❌ Error refining blueprint: ${error.message}`));
    }
  }

  /**
   * Generate Codessa agents for all suitable functions in a project
   */
  async generateAgents(projectPath: string): Promise<void> {
    if (!projectPath) {
      console.error(chalk.red('❌ Please provide a project path'));
      return;
    }

    console.log(chalk.blue(`⚡ Generating Codessa agents for: ${projectPath}`));
    console.log(chalk.gray('-'.repeat(50)));

    const spinner = ora('Scanning project files...').start();

    try {
      const results = await this.walkDirectory(projectPath);
      const codeFiles = results.filter((r) => r.type === 'file' && r.language);

      spinner.succeed(`Found ${codeFiles.length} code files`);

      let totalFunctions = 0;
      let generatedAgents = 0;

      const outputDir = path.join(projectPath, this.config.outputDir);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Create a task list for processing files
      const tasks = new Listr(
        codeFiles.map((file) => ({
          title: `Processing ${path.relative(projectPath, file.path)}`,
          task: async (ctx, task) => {
            const sourceCode = fs.readFileSync(file.path, 'utf8');

            // Use AST analyzer for better function extraction
            const astResult = await this.astAnalyzer.analyzeSource(
              sourceCode,
              file.language!,
              file.path
            );
            totalFunctions += astResult.nodes.length;

            // Create subtasks for each function/class
            return new Listr(
              astResult.nodes.map((node) => ({
                title: `Analyzing ${node.type}: ${node.name}`,
                task: async (subCtx, subTask) => {
                  try {
                    const result = await this.tester.analyzeCode(
                      node.name,
                      node.raw
                    );

                    // Only generate agents for high-confidence analyses
                    if (result.blueprint.metadata.confidenceScore > 0.6) {
                      // Check for refined blueprint
                      const refinedBlueprintPath = path.join(
                        path.dirname(file.path),
                        '.codessa',
                        `${node.name}.blueprint.json`
                      );
                      let blueprint = result.blueprint;

                      if (fs.existsSync(refinedBlueprintPath)) {
                        try {
                          const refinedBlueprint = JSON.parse(
                            fs.readFileSync(refinedBlueprintPath, 'utf8')
                          );
                          subTask.output = `✨ Using refined blueprint for ${node.name}`;
                          blueprint = refinedBlueprint;
                        } catch (error) {
                          subTask.output = `⚠️ Could not load refined blueprint: ${error.message}`;
                        }
                      }

                      const agentFileName = `${blueprint.name}Agent.ts`;
                      const agentPath = path.join(outputDir, agentFileName);

                      fs.writeFileSync(agentPath, result.agentScaffold);

                      // Also save the blueprint
                      const blueprintPath = path.join(
                        outputDir,
                        `${blueprint.name}.codal.yaml`
                      );
                      fs.writeFileSync(blueprintPath, result.yamlBlueprint);

                      subTask.output = `Generated with ${(blueprint.metadata.confidenceScore * 100).toFixed(1)}% confidence`;
                      generatedAgents++;
                      return { success: true, node, result, blueprint };
                    } else {
                      subTask.output = `Low confidence: ${(result.blueprint.metadata.confidenceScore * 100).toFixed(1)}%`;
                      return { success: false, node, result };
                    }
                  } catch (error) {
                    subTask.output = `Error: ${error.message}`;
                    return { success: false, node, error };
                  }
                },
              })),
              { concurrent: false, rendererOptions: { collapse: false } }
            );
          },
        })),
        { concurrent: 2, rendererOptions: { collapse: false } }
      );

      await tasks.run();

      console.log(chalk.green(`\n🎉 Generation complete!`));
      console.log(
        `   📊 Functions analyzed: ${chalk.yellow(totalFunctions.toString())}`
      );
      console.log(
        `   🤖 Agents generated: ${chalk.yellow(generatedAgents.toString())}`
      );
      console.log(`   📁 Output directory: ${chalk.cyan(outputDir)}`);

      if (generatedAgents > 0) {
        console.log(chalk.blue(`\n🚀 Next steps:`));
        console.log(`   1. Review generated agents in ${outputDir}`);
        console.log(`   2. Implement the execute() methods`);
        console.log(`   3. Test agents with: codessa test ${outputDir}`);
      }
    } catch (error) {
      spinner?.fail('Generation failed');
      console.error(chalk.red(`❌ Error generating agents: ${error.message}`));
    }
  }

  /**
   * Initialize a project with Codessa configuration
   */
  async initProject(projectPath: string = '.'): Promise<void> {
    console.log(`🔧 Initializing Codessa project: ${projectPath}`);

    const configPath = path.join(projectPath, '.codessa', 'config.json');
    const configDir = path.dirname(configPath);

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const defaultConfig: CodessaConfig = {
      include: ['src/**/*', 'lib/**/*', '*.py', '*.js', '*.ts'],
      exclude: [
        'node_modules/**/*',
        '.git/**/*',
        'dist/**/*',
        '__pycache__/**/*',
      ],
      languages: ['python', 'javascript', 'typescript'],
      autoGenerate: false,
      outputDir: '.codessa/agents',
    };

    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));

    // Create example .codessaignore file
    const ignorePath = path.join(projectPath, '.codessaignore');
    const ignoreContent = `# Codessa ignore file
node_modules/
.git/
dist/
*.min.js
*.bundle.js
__pycache__/
*.pyc
.env
*.log
`;

    fs.writeFileSync(ignorePath, ignoreContent);

    console.log(`✅ Codessa project initialized!`);
    console.log(`   📄 Config: ${configPath}`);
    console.log(`   🚫 Ignore: ${ignorePath}`);
    console.log(`\n🚀 Try: codessa scan ${projectPath}`);
  }

  /**
   * Show project status and Codessa integration health
   */
  async showStatus(): Promise<void> {
    console.log(`📊 Codessa Project Status`);
    console.log('-'.repeat(30));

    const configExists = fs.existsSync('.codessa/config.json');
    const agentsDir = '.codessa/agents';
    const agentsExist = fs.existsSync(agentsDir);

    console.log(
      `🔧 Configuration: ${configExists ? '✅ Found' : '❌ Missing'}`
    );
    console.log(
      `🤖 Generated Agents: ${agentsExist ? '✅ Present' : '❌ None'}`
    );

    if (agentsExist) {
      const agentFiles = fs
        .readdirSync(agentsDir)
        .filter((f) => f.endsWith('.ts'));
      console.log(`   📁 Agent files: ${agentFiles.length}`);
      agentFiles.slice(0, 5).forEach((file) => {
        console.log(`      • ${file}`);
      });
      if (agentFiles.length > 5) {
        console.log(`      ... and ${agentFiles.length - 5} more`);
      }
    }

    console.log(
      `\n🧠 Primitive Registry: ${Object.keys(CodalRegistry.getAllPrimitives()).length} primitives loaded`
    );
  }

  /**
   * Show available Codal primitives
   */
  showPrimitives(): void {
    console.log(`🧬 Codal Primitive Registry`);
    console.log('='.repeat(40));

    const primitives = CodalRegistry.getAllPrimitives();
    const byCategory = this.groupBy(primitives, 'category');

    for (const [category, prims] of Object.entries(byCategory)) {
      console.log(`\n📂 ${category.toUpperCase()}:`);
      for (const prim of prims) {
        console.log(`   • ${prim.name}: ${prim.description}`);
        console.log(`     Examples: ${prim.examples.slice(0, 3).join(', ')}`);
      }
    }
  }

  /**
   * Show CLI help
   */
  showHelp(): void {
    console.log(`🌐 Codessa CLI - Cognitive Code Integration

USAGE:
    codessa <command> [options]

COMMANDS:
    scan <path>        Scan project for integration opportunities
    analyze <file>     Analyze specific file and show detailed breakdown
    refine <file>      Refine blueprint with interactive prompts
    generate <path>    Generate Codessa agents for project functions
    init [path]        Initialize Codessa project (default: current dir)
    status             Show project status and health
    primitives         List all available Codal primitives
    help               Show this help message

REFINE OPTIONS:
    --interactive      Interactive mode with prompts (default)
    --batch            Apply default refinements without prompts
    --headless         Output blueprint to file for manual editing
    --save-memory      Store refinements in reflexive memory

EXAMPLES:
    codessa scan ./my-project
    codessa analyze ./src/scraper.py
    codessa refine ./src/scraper.py
    codessa generate ./my-project
    codessa init
    codessa status

For more information, visit: https://codessa.dev/docs`);
  }

  // Utility methods
  private loadConfig(): CodessaConfig {
    const configPath = '.codessa/config.json';
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    // Default config
    return {
      include: ['**/*'],
      exclude: ['node_modules/**/*', '.git/**/*'],
      languages: ['python', 'javascript', 'typescript'],
      autoGenerate: false,
      outputDir: '.codessa/agents',
    };
  }

  private async walkDirectory(dirPath: string): Promise<ProjectScanResult[]> {
    const results: ProjectScanResult[] = [];

    const walk = async (currentPath: string) => {
      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!this.shouldExclude(fullPath)) {
            results.push({ path: fullPath, type: 'directory' });
            await walk(fullPath); // Recursive
          }
        } else if (stat.isFile()) {
          const language = this.detectLanguage(fullPath);
          if (language && !this.shouldExclude(fullPath)) {
            const functions = await this.extractFunctionNames(fullPath);
            results.push({
              path: fullPath,
              type: 'file',
              language,
              functions,
            });
          }
        }
      }
    };

    await walk(dirPath);
    return results;
  }

  private shouldExclude(filePath: string): boolean {
    return this.config.exclude.some((pattern) =>
      filePath.includes(pattern.replace('/**/*', ''))
    );
  }

  private detectLanguage(filePath: string): string | undefined {
    const ext = path.extname(filePath).toLowerCase();
    const langMap: Record<string, string> = {
      '.py': 'python',
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'javascript',
      '.tsx': 'typescript',
    };
    return langMap[ext];
  }

  private async extractFunctionNames(filePath: string): Promise<string[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const language = this.detectLanguage(filePath);
      const functions = await this.extractFunctions(content, language!);
      return functions.map((f) => f.name);
    } catch {
      return [];
    }
  }

  private async extractFunctions(
    source: string,
    language: string
  ): Promise<Array<{ name: string; code: string }>> {
    try {
      // Use the AST analyzer for more robust parsing
      const astResult = await this.astAnalyzer.analyzeSource(source, language);

      return astResult.nodes.map((node) => ({
        name: node.name,
        code: node.raw,
      }));
    } catch (error) {
      console.error(chalk.red(`Error extracting functions: ${error.message}`));

      // Fallback to regex-based extraction if AST parsing fails
      const functions: Array<{ name: string; code: string }> = [];

      if (language === 'python') {
        const funcRegex = /def\s+(\w+)\s*\([^)]*\):\s*((?:\n[ ]+.*)*)/g;
        let match;

        while ((match = funcRegex.exec(source)) !== null) {
          functions.push({
            name: match[1],
            code: match[0],
          });
        }
      } else if (language === 'javascript' || language === 'typescript') {
        // Simple regex for JS/TS functions - not perfect but works as fallback
        const funcRegex =
          /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:function|\([^)]*\)\s*=>))/g;
        let match;

        while ((match = funcRegex.exec(source)) !== null) {
          const name = match[1] || match[2];
          functions.push({
            name,
            code: match[0],
          });
        }
      }

      return functions;
    }
  }

  /**
   * Generate TypeScript agent code from a blueprint
   */
  private generateAgentCode(name: string, blueprint: any): string {
    // Use refinement data if available
    const refinement = blueprint.refinement;
    const agentName = refinement?.agent_name || `${name}Agent`;
    const agentIntent =
      refinement?.intent || blueprint.intent || `Process ${name}`;
    const agentArchetype =
      refinement?.archetype || blueprint.suggestedAgent || 'Agent';
    const agentNotes = refinement?.notes || '';

    // Generate agent code with refinement data
    return `/**
 * ${agentName} - ${agentArchetype}
 * 
 * Intent: ${agentIntent}
 * ${agentNotes ? `* Notes: ${agentNotes}\n * ` : ''}
 * Generated by Codessa CLI
 */
export class ${agentName} {
  /**
   * Execute the agent's primary function
   */
  async execute(input: any): Promise<any> {
    // TODO: Implement agent logic
    console.log('Executing ${agentName}');
    return input;
  }

  /**
   * Get the agent's metadata
   */
  getMetadata() {
    return {
      name: '${agentName}',
      archetype: '${agentArchetype}',
      intent: '${agentIntent}',
      primitives: ${JSON.stringify(blueprint.primitives || [])}
    };
  }
}
`;
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce(
      (groups, item) => {
        const group = (item[key] as unknown as string) || 'unknown';
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(item);
        return groups;
      },
      {} as Record<string, T[]>
    );
  }
}

// CLI entry point
if (require.main === module) {
  const cli = new CodessaCLI();
  const args = process.argv.slice(2);

  cli.run(args).catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}

export { CodessaCLI };
