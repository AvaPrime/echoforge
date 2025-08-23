// Codessa's Codal Grammar: Primitive Registry
// "Not a syntax, but a soulmap."

export interface CodalPrimitive {
  name: string;
  description: string;
  category: 'data' | 'control' | 'interaction' | 'memory' | 'meta';
  examples: string[];
  patterns: CodalPattern[];
  capabilities: string[];
  evolutionWeight: number; // How likely this primitive is to spawn new variants
}

export interface CodalPattern {
  trigger: {
    imports?: string[];
    functions?: string[];
    keywords?: string[];
    callPatterns?: RegExp[];
  };
  context: {
    responseHandling?: boolean;
    errorHandling?: boolean;
    asyncPattern?: boolean;
    dataStructures?: string[];
  };
  confidence: number; // 0.0 to 1.0
  intentWeight: number; // -5 to +5, helps resolve primitive conflicts
}

export interface CodalSequence {
  name: string;
  sequence: string[];
  intent: string;
  suggestedAgent: string;
  commonVariations?: string[][];
}

// Core Primitive Registry
export const CODAL_PRIMITIVES: Record<string, CodalPrimitive> = {
  ExternalFetch: {
    name: 'ExternalFetch',
    description:
      'Retrieve information from outside systems, APIs, or external sources',
    category: 'data',
    examples: ['requests.get', 'fetch()', 'axios.post', 'curl', 'http.request'],
    patterns: [
      {
        trigger: {
          imports: ['requests', 'axios', 'urllib', 'http', 'fetch'],
          functions: ['get', 'post', 'put', 'delete', 'fetch', 'request'],
          callPatterns: [/\.get\(/, /\.post\(/, /fetch\(/],
        },
        context: {
          responseHandling: true,
          asyncPattern: true,
          errorHandling: false,
        },
        confidence: 0.9,
        intentWeight: 3,
      },
    ],
    capabilities: ['external-api', 'network-access'],
    evolutionWeight: 0.8,
  },

  DataTransform: {
    name: 'DataTransform',
    description: 'Convert, parse, reshape or interpret data structures',
    category: 'data',
    examples: [
      'JSON.parse',
      'pandas.DataFrame',
      'map()',
      'filter()',
      'reduce()',
    ],
    patterns: [
      {
        trigger: {
          functions: [
            'parse',
            'transform',
            'map',
            'filter',
            'reduce',
            'reshape',
          ],
          keywords: ['json', 'xml', 'csv', 'yaml'],
          callPatterns: [/\.parse\(/, /\.map\(/, /\.transform\(/],
        },
        context: {
          dataStructures: ['array', 'object', 'dataframe', 'list', 'dict'],
        },
        confidence: 0.85,
        intentWeight: 2,
      },
    ],
    capabilities: ['data-processing'],
    evolutionWeight: 0.9,
  },

  MemoryStore: {
    name: 'MemoryStore',
    description:
      'Commit data to long-term memory, databases, or persistent storage',
    category: 'memory',
    examples: [
      'db.save()',
      'fs.writeFile',
      'localStorage.setItem',
      'redis.set',
    ],
    patterns: [
      {
        trigger: {
          functions: ['save', 'write', 'store', 'insert', 'create', 'persist'],
          imports: ['sqlite3', 'mongodb', 'redis', 'fs', 'os'],
          callPatterns: [/\.save\(/, /\.write\(/, /\.insert\(/],
        },
        context: {
          dataStructures: ['database', 'file', 'cache', 'memory'],
        },
        confidence: 0.9,
        intentWeight: 4,
      },
    ],
    capabilities: ['memory:write', 'storage-access'],
    evolutionWeight: 0.7,
  },

  MemoryQuery: {
    name: 'MemoryQuery',
    description: 'Retrieve internal memory, data, or query stored information',
    category: 'memory',
    examples: ['db.find()', 'fs.readFile', 'localStorage.getItem', 'search()'],
    patterns: [
      {
        trigger: {
          functions: [
            'find',
            'read',
            'get',
            'query',
            'search',
            'retrieve',
            'select',
          ],
          callPatterns: [/\.find\(/, /\.read\(/, /\.get\(/, /\.query\(/],
        },
        context: {
          dataStructures: ['database', 'file', 'cache', 'index'],
        },
        confidence: 0.85,
        intentWeight: 3,
      },
    ],
    capabilities: ['memory:read', 'storage-access'],
    evolutionWeight: 0.6,
  },

  ConditionEvaluate: {
    name: 'ConditionEvaluate',
    description: 'Logical decision-making, branching, or rule evaluation',
    category: 'control',
    examples: ['if/else', 'switch', 'match', 'ternary', 'guard clauses'],
    patterns: [
      {
        trigger: {
          keywords: ['if', 'else', 'elif', 'switch', 'case', 'match', 'when'],
          callPatterns: [/if\s*\(/, /switch\s*\(/, /\?\s*.*\s*:/],
        },
        context: {},
        confidence: 0.95,
        intentWeight: 2,
      },
    ],
    capabilities: ['logic-processing'],
    evolutionWeight: 0.5,
  },

  ReflexiveTrigger: {
    name: 'ReflexiveTrigger',
    description:
      'Behavior contingent on meta-state, feedback, or system observation',
    category: 'meta',
    examples: [
      'event listeners',
      'retry logic',
      'adaptive behavior',
      'self-monitoring',
    ],
    patterns: [
      {
        trigger: {
          functions: [
            'on',
            'addEventListener',
            'retry',
            'monitor',
            'watch',
            'observe',
          ],
          keywords: ['event', 'trigger', 'callback', 'hook'],
          callPatterns: [/\.on\(/, /addEventListener/, /retry/, /monitor/],
        },
        context: {
          errorHandling: true,
          asyncPattern: true,
        },
        confidence: 0.8,
        intentWeight: 5,
      },
    ],
    capabilities: ['meta-cognition', 'event-handling'],
    evolutionWeight: 0.9,
  },

  AgentInvoke: {
    name: 'AgentInvoke',
    description: 'Delegation to another agent, subprocess, or external service',
    category: 'interaction',
    examples: ['subprocess.call', 'agent.invoke()', 'api.call', 'microservice'],
    patterns: [
      {
        trigger: {
          functions: [
            'call',
            'invoke',
            'dispatch',
            'delegate',
            'spawn',
            'exec',
          ],
          imports: ['subprocess', 'multiprocessing', 'celery'],
          callPatterns: [/\.call\(/, /\.invoke\(/, /\.exec\(/],
        },
        context: {
          asyncPattern: true,
        },
        confidence: 0.85,
        intentWeight: 4,
      },
    ],
    capabilities: ['agent-communication', 'process-management'],
    evolutionWeight: 0.8,
  },

  LoopExecute: {
    name: 'LoopExecute',
    description:
      'Iterative process across data structures or repeated operations',
    category: 'control',
    examples: ['for loops', 'while loops', 'map', 'forEach', 'itertools'],
    patterns: [
      {
        trigger: {
          keywords: ['for', 'while', 'forEach', 'map', 'iterate'],
          callPatterns: [/for\s*\(/, /while\s*\(/, /\.forEach\(/, /\.map\(/],
        },
        context: {
          dataStructures: ['array', 'list', 'iterator', 'collection'],
        },
        confidence: 0.9,
        intentWeight: 2,
      },
    ],
    capabilities: ['iteration-processing'],
    evolutionWeight: 0.6,
  },

  UserInteract: {
    name: 'UserInteract',
    description: 'Collect or present information to human users',
    category: 'interaction',
    examples: ['input()', 'print()', 'console.log', 'UI callbacks', 'prompts'],
    patterns: [
      {
        trigger: {
          functions: ['input', 'print', 'log', 'alert', 'prompt', 'display'],
          callPatterns: [/input\(/, /print\(/, /console\.log/, /alert\(/],
        },
        context: {},
        confidence: 0.9,
        intentWeight: 3,
      },
    ],
    capabilities: ['user-interface', 'human-interaction'],
    evolutionWeight: 0.7,
  },

  IntentRecognize: {
    name: 'IntentRecognize',
    description: 'Map raw input to semantic goals or understand user intent',
    category: 'meta',
    examples: ['NLP parsing', 'command parsing', 'intent classification'],
    patterns: [
      {
        trigger: {
          functions: [
            'parse',
            'classify',
            'recognize',
            'understand',
            'interpret',
          ],
          imports: ['nltk', 'spacy', 'transformers', 'openai'],
          keywords: ['intent', 'nlp', 'language', 'semantic'],
        },
        context: {},
        confidence: 0.8,
        intentWeight: 4,
      },
    ],
    capabilities: ['natural-language', 'intent-processing'],
    evolutionWeight: 0.9,
  },

  CapabilityCheck: {
    name: 'CapabilityCheck',
    description: 'Determine permissions, constraints, or system capabilities',
    category: 'meta',
    examples: ['auth checks', 'permission validation', 'resource limits'],
    patterns: [
      {
        trigger: {
          functions: [
            'check',
            'validate',
            'authorize',
            'can',
            'has',
            'allowed',
          ],
          keywords: ['auth', 'permission', 'capability', 'access', 'security'],
          callPatterns: [/\.check\(/, /\.validate\(/, /\.can\(/],
        },
        context: {},
        confidence: 0.85,
        intentWeight: 3,
      },
    ],
    capabilities: ['security', 'access-control'],
    evolutionWeight: 0.6,
  },
};

// Common Primitive Sequences (Codal Patterns)
export const CODAL_SEQUENCES: Record<string, CodalSequence> = {
  DataHarvestRoutine: {
    name: 'DataHarvestRoutine',
    sequence: ['ExternalFetch', 'DataTransform', 'MemoryStore'],
    intent: 'Acquire external data, process it, and store for future use',
    suggestedAgent: 'DataHarvesterAgent',
    commonVariations: [
      ['ExternalFetch', 'ConditionEvaluate', 'DataTransform', 'MemoryStore'],
      ['ExternalFetch', 'DataTransform', 'ConditionEvaluate', 'MemoryStore'],
    ],
  },

  InteractiveProcessor: {
    name: 'InteractiveProcessor',
    sequence: [
      'UserInteract',
      'IntentRecognize',
      'AgentInvoke',
      'UserInteract',
    ],
    intent: 'Handle user interaction through intent recognition and response',
    suggestedAgent: 'ConversationAgent',
  },

  AdaptiveMonitor: {
    name: 'AdaptiveMonitor',
    sequence: ['MemoryQuery', 'ConditionEvaluate', 'ReflexiveTrigger'],
    intent: 'Monitor system state and adapt behavior based on conditions',
    suggestedAgent: 'ObserverAgent',
  },

  SecureDataPipeline: {
    name: 'SecureDataPipeline',
    sequence: [
      'CapabilityCheck',
      'ExternalFetch',
      'DataTransform',
      'MemoryStore',
    ],
    intent: 'Secure data processing with capability validation',
    suggestedAgent: 'SecureProcessorAgent',
  },
};

// Utility functions for primitive matching and evolution
export class CodalRegistry {
  static getAllPrimitives(): CodalPrimitive[] {
    return Object.values(CODAL_PRIMITIVES);
  }

  static getPrimitive(name: string): CodalPrimitive | undefined {
    return CODAL_PRIMITIVES[name];
  }

  static addPrimitive(primitive: CodalPrimitive): void {
    CODAL_PRIMITIVES[primitive.name] = primitive;
  }

  static getSequence(name: string): CodalSequence | undefined {
    return CODAL_SEQUENCES[name];
  }

  static findMatchingSequences(primitives: string[]): CodalSequence[] {
    return Object.values(CODAL_SEQUENCES).filter((sequence) =>
      this.sequenceMatches(sequence.sequence, primitives)
    );
  }

  private static sequenceMatches(
    pattern: string[],
    detected: string[]
  ): boolean {
    // Simple pattern matching - could be enhanced with fuzzy matching
    if (pattern.length !== detected.length) return false;
    return pattern.every((p, i) => p === detected[i]);
  }
}
