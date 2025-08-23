/**
 * Codebase Assessment & Living Documentation System Configuration
 *
 * This file contains the configuration settings for the EchoForge
 * Codebase Assessment & Living Documentation System.
 */

const path = require('path');

module.exports = {
  // Core system configuration
  system: {
    name: 'EchoForge Codebase Assessment',
    version: '1.0.0',
    basePath: path.resolve(__dirname),
    outputPath: path.resolve(__dirname, 'output'),
    templatesPath: path.resolve(__dirname, 'templates'),
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  },

  // Repository configuration
  repository: {
    path: path.resolve(__dirname, '..'),
    excludePaths: [
      'node_modules',
      'dist',
      'build',
      '.git',
      'coverage',
      'codebase-assessment/output',
    ],
    includeExtensions: [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.json',
      '.md',
      '.css',
      '.scss',
      '.html',
    ],
  },

  // Static analysis tools configuration
  staticAnalysis: {
    enabled: true,
    tools: {
      eslint: {
        enabled: true,
        configPath: path.resolve(__dirname, '..', '.eslintrc.js'),
        outputPath: path.resolve(
          __dirname,
          'output',
          'analysis',
          'eslint-results.json'
        ),
      },
      sonarqube: {
        enabled: true,
        serverUrl: 'http://localhost:9000',
        token: process.env.SONAR_TOKEN || '',
        projectKey: 'echoforge',
        outputPath: path.resolve(
          __dirname,
          'output',
          'analysis',
          'sonar-results.json'
        ),
      },
      semgrep: {
        enabled: true,
        rulesPath: path.resolve(__dirname, 'rules', 'semgrep'),
        outputPath: path.resolve(
          __dirname,
          'output',
          'analysis',
          'semgrep-results.json'
        ),
      },
      jscpd: {
        enabled: true,
        threshold: 5, // Duplication percentage threshold
        outputPath: path.resolve(
          __dirname,
          'output',
          'analysis',
          'jscpd-results.json'
        ),
      },
      cloc: {
        enabled: true,
        outputPath: path.resolve(
          __dirname,
          'output',
          'analysis',
          'cloc-results.json'
        ),
      },
    },
  },

  // Architecture analysis configuration
  architectureAnalysis: {
    enabled: true,
    tools: {
      madge: {
        enabled: true,
        outputPath: path.resolve(
          __dirname,
          'output',
          'analysis',
          'madge-results.json'
        ),
        graphOutputPath: path.resolve(
          __dirname,
          'output',
          'analysis',
          'dependency-graph.svg'
        ),
      },
      arkit: {
        enabled: true,
        outputPath: path.resolve(
          __dirname,
          'output',
          'analysis',
          'arkit-results.json'
        ),
        diagramOutputPath: path.resolve(
          __dirname,
          'output',
          'analysis',
          'architecture-diagram.svg'
        ),
      },
    },
  },

  // Code metrics configuration
  metrics: {
    enabled: true,
    complexity: {
      enabled: true,
      thresholds: {
        cyclomatic: 15,
        maintainability: 65,
        halstead: 30,
      },
      outputPath: path.resolve(
        __dirname,
        'output',
        'analysis',
        'complexity-metrics.json'
      ),
    },
    coverage: {
      enabled: true,
      thresholds: {
        lines: 75,
        functions: 80,
        branches: 70,
        statements: 75,
      },
      outputPath: path.resolve(
        __dirname,
        'output',
        'analysis',
        'coverage-metrics.json'
      ),
    },
  },

  // Assessment agent configuration
  assessmentAgent: {
    enabled: true,
    mcpServers: {
      git: {
        enabled: true,
        endpoint: 'http://localhost:3001/git',
      },
      database: {
        enabled: true,
        endpoint: 'http://localhost:3002/db',
      },
      fileSystem: {
        enabled: true,
        endpoint: 'http://localhost:3003/fs',
      },
      documentation: {
        enabled: true,
        endpoint: 'http://localhost:3004/docs',
      },
    },
    consciousness: {
      enabled: true,
      memoryLayers: [
        'codebase',
        'architecture',
        'quality',
        'security',
        'performance',
      ],
      intentionFramework: 'codalism',
      reflexiveCapabilities: true,
      evolutionTracking: true,
    },
  },

  // Living documentation configuration
  livingDocumentation: {
    enabled: true,
    outputFormats: ['markdown', 'html', 'json'],
    templates: {
      systemOverview: {
        enabled: true,
        templatePath: path.resolve(
          __dirname,
          'templates',
          'system-overview.md'
        ),
        outputPath: path.resolve(
          __dirname,
          'output',
          'living-docs',
          'system-overview.md'
        ),
      },
      architectureAssessment: {
        enabled: true,
        templatePath: path.resolve(
          __dirname,
          'templates',
          'architecture-assessment.json'
        ),
        outputPath: path.resolve(
          __dirname,
          'output',
          'living-docs',
          'architecture-assessment.json'
        ),
      },
      refactoringCandidates: {
        enabled: true,
        templatePath: path.resolve(
          __dirname,
          'templates',
          'refactoring-candidates.md'
        ),
        outputPath: path.resolve(
          __dirname,
          'output',
          'living-docs',
          'refactoring-candidates.md'
        ),
      },
      enhancementIdeas: {
        enabled: true,
        templatePath: path.resolve(
          __dirname,
          'templates',
          'enhancement-ideas.md'
        ),
        outputPath: path.resolve(
          __dirname,
          'output',
          'living-docs',
          'enhancement-ideas.md'
        ),
      },
      newFeatures: {
        enabled: true,
        templatePath: path.resolve(__dirname, 'templates', 'new-features.md'),
        outputPath: path.resolve(
          __dirname,
          'output',
          'living-docs',
          'new-features.md'
        ),
      },
      optimizationTargets: {
        enabled: true,
        templatePath: path.resolve(
          __dirname,
          'templates',
          'optimization-targets.md'
        ),
        outputPath: path.resolve(
          __dirname,
          'output',
          'living-docs',
          'optimization-targets.md'
        ),
      },
    },
    updateFrequency: 'weekly', // 'daily', 'weekly', 'monthly', 'on-commit'
    historyRetention: 10, // Number of historical versions to retain
    notificationTargets: [
      {
        type: 'slack',
        webhook: process.env.SLACK_WEBHOOK_URL || '',
        channel: '#codebase-assessment',
        enabled: false,
      },
      {
        type: 'email',
        recipients: ['dev-team@example.com'],
        enabled: false,
      },
    ],
  },

  // Integration with EchoForge Consciousness
  consciousnessIntegration: {
    enabled: true,
    intentionRecognition: {
      enabled: true,
      patterns: [
        'code_improvement',
        'architecture_evolution',
        'security_enhancement',
        'performance_optimization',
        'developer_experience',
      ],
    },
    emotionalImpactAnalysis: {
      enabled: true,
      dimensions: [
        'developer_satisfaction',
        'user_experience',
        'team_collaboration',
        'learning_curve',
      ],
    },
    consciousnessEvolutionTracking: {
      enabled: true,
      metrics: ['adaptability', 'coherence', 'reflexivity', 'intentionality'],
    },
    memoryIntegratedAssessment: {
      enabled: true,
      memoryTypes: [
        'architectural_decisions',
        'refactoring_history',
        'performance_optimizations',
        'security_incidents',
      ],
    },
  },
};
